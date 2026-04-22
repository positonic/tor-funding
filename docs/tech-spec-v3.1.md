# FtC × Tor Project Quadratic Funding Campaign — Technical Specification v3.1

**Status:** Draft for engineering review
**Author:** James Farrell (Commons Lab / Funding the Commons)
**Target launch:** May 19, 2026
**Supersedes:** v3 (cooperative tracker + dynamic matching pool)

### Changelog from v3

- **Frontend switched from Vite SPA to Next.js with static export (`output: 'export'`).** Pre-renders each route to HTML at build time, giving project pages real SEO discoverability for Pavel's comms ramp. Build output is still pure static files for TPA's CDN. Same React, Tailwind, components, and TanStack Query as before.
- **New `watcher_state` table** and explicit cursor-checkpointing invariant. Each watcher tracks its last processed block height/timestamp per address and updates the cursor in the same DB transaction as the donation insert. Crash-safe by construction.
- **Added a tight "What this is / is not" callout** at the top of §5, for use in stakeholder comms, the About page, and recipient onboarding docs.

### Changelog from v2

- Reframed system architecture as a multi-chain donation tracker with cooperating recipients, not a generalized blockchain indexer.
- Cooperative transparency promoted to a first-class design principle.
- View-key requirements for privacy chains (Monero, shielded Zcash).
- Eligibility rules tied to per-chain transparency.
- Matching pool architecture with dedicated per-chain addresses; pool size is dynamic (sum of contributions).
- Data model: `verification_method` field; new `MatchingPool` and `MatchingContribution` entities.

---

## 1. Context & Background

The original v1 architecture proposed a MACI-based quadratic funding round with attestation-gated voting, a Human-WaaP embedded wallet, and on-chain tallying. After reviewing the threat model on April 16 (pre-vetted beneficiaries, modest match pool, Tor's non-crypto-native donor base, multi-chain inclusivity), we pivoted in v2 to a "direct donation + off-chain matching" model.

v3 tightened the architecture around two clarifications:

1. **We are not indexing blockchains.** We are tracking a known set of addresses owned by cooperating recipients. This is a much smaller problem than general indexing and unlocks privacy-chain support cleanly.
2. **The matching pool is itself a first-class fundraising target.** Donors should be able to fund the pool directly — separately from picking a project — and that pool's contents must be just as observable as project donations.

v3.1 makes three operational refinements: a frontend change for SEO, an explicit idempotency model for the tracker, and tightened framing language.

The guiding principles remain:

- **Donor = voter by default.** The act of donating to a project is the signal.
- **Any chain, any asset.** BTC, ETH (+ L2s), Solana, Zcash, Monero, USDC.
- **Lowest possible engineering lift.** Tor's TPA team has limited appetite for complex orchestration.
- **Match calculation is off-chain.** Square-root matching from collected data; sybil handling is human review.
- **Live-ish dashboard.** Refreshed every 60 seconds.
- **Cooperative transparency.** Recipients supply the access needed to make donations to them auditable. No cooperation, no matching eligibility.

---

## 2. Goals & Non-Goals

### 2.1 Goals

1. Let a donor pick a Tor sub-project, pick a chain/asset, and send funds in under 60 seconds.
2. Let a donor contribute to the global matching pool with the same simplicity, on any supported chain.
3. Track every donation across every supported chain (including privacy chains via view keys) into a single canonical record with a USD value pinned at donation time.
4. Compute a defensible square-root match allocation per project at round close, using the dynamically-sized matching pool.
5. Display a live (~60s latency) campaign dashboard.
6. Deploy entirely on Tor Project infrastructure (subdomain of `torproject.org`).
7. Ship a visually polished site aligned with the Tor Project Figma style guide.
8. Make project pages discoverable by search engines and shareable on social with proper preview cards (driven by static HTML pre-rendering).

### 2.2 Non-Goals (v1 release)

- Generalized blockchain indexing infrastructure.
- Smart contracts. No on-chain matching logic.
- Wallet-connect flows or wallet-based authentication.
- Cryptographic sybil resistance (MACI, ZK, etc.).
- Combining donation flow with voting flow — they are now the same thing.
- Real-time websockets (polling is sufficient).
- Recurring donations, fiat onramps, tax receipts (handled by Tor Project's existing donation flow).
- Linking donor identities across projects or across project/matching-pool flows.
- Server-side rendering at request time (we use build-time SSG only).

---

## 3. Tech Stack Recommendation

### 3.1 Frontend: Next.js (static export) + React + TypeScript + Tailwind

| Concern | Decision | Rationale |
|---|---|---|
| Framework | **Next.js with `output: 'export'`** (Pages Router) | Pre-renders each route to HTML at build time. Project pages are indexed by Google with real content, not an empty SPA shell. Build output is pure static HTML/CSS/JS that drops directly into TPA's static CDN — operationally identical to a Vite build from Anarcat's perspective. Pages Router is preferred over App Router for simpler static export semantics. |
| Language | TypeScript | Catches chain-integration and data-contract bugs at compile time. |
| Styling | Tailwind CSS + CSS variables for brand tokens | Fast Figma-to-utility translation. |
| State | TanStack Query (server state); small Zustand store (UI state) | Polling, caching, stale-while-revalidate handled cleanly. |
| Routing | Next.js file-based routing | `pages/index.tsx`, `pages/projects/[slug].tsx`, `pages/matching-pool.tsx`, etc. Static paths generated via `getStaticPaths` from the project list. |
| Data fetching | `getStaticProps` for build-time content (project descriptions, FAQ); TanStack Query for runtime `snapshot.json` polling | Static content gets baked into HTML at build time (great for SEO); live numbers are hydrated client-side. |
| QR codes | `qrcode.react` | Renders payment URIs as QR codes client-side. |
| Charts | Recharts | Leaderboard bar charts, per-chain pie charts. |
| Analytics | None, or self-hosted Plausible | This is the Tor Project — no third-party trackers. |

**Why Next.js static export over Vite SPA**: At runtime they're equivalent — both produce a React app served from static files. The difference is at build time: Next.js pre-renders each route to its own HTML file with all the static content (project name, description, hero copy, FAQ) baked in. Search engines and social media link previews see real content immediately. A Vite SPA serves an empty shell that Google JavaScript-renders inconsistently. For a campaign with PR strategy via Logos and web3privacy, that SEO surface is real value. The cost is a slightly slower build and marginally more framework ceremony, both negligible.

**Why Pages Router over App Router**: App Router supports static export but has more constraints around server components and complicates the build. Pages Router with `getStaticProps` and `getStaticPaths` is the long-established static export path and matches what Anarcat will be deploying.

### 3.2 Backend: Donation Tracker (containerized Node.js)

A single long-running Node.js process that:
1. Polls each supported chain for new transactions to **known recipient addresses** (project addresses and matching pool addresses).
2. For privacy chains, scans transactions using **recipient-provided view keys**.
3. Resolves historical USD prices via CoinGecko.
4. Writes to SQLite.
5. Regenerates a static `snapshot.json` for the frontend.

This is intentionally narrower than an "indexer." It does not parse arbitrary chain state, doesn't handle reorgs across the whole chain, and doesn't subscribe to general events. It only watches a small set of known addresses, with explicit cursor state per address (§14.4).

| Concern | Decision | Rationale |
|---|---|---|
| Runtime | Node.js 20 (LTS) | Best ecosystem for chain client libraries. |
| Framework | Bare Node + Fastify (only if we need admin HTTP) | We don't need a public API; the frontend reads static JSON. |
| Database | **SQLite** (v1) | Single-file, trivially backed up, zero ops overhead. Postgres later if needed. |
| ORM | Drizzle | Type-safe, lightweight. |
| Scheduling | `node-cron` inside the container | Simple, no external scheduler needed. |
| Containerization | Single Dockerfile, multi-stage build | Anarcat: a single container is fine. |

### 3.3 Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│  donate-match.torproject.org  (static site, TPA CDN)       │
│  - Next.js static export (SSG)                             │
│  - HTML pre-rendered per route at build time               │
│  - Hydrates and polls /data/snapshot.json every 60s        │
└────────────────────────────────────────────────────────────┘
                              ▲
                              │ static file fetch
                              │
┌─────────────────────────────┴──────────────────────────────┐
│  Donation Tracker Container (TPA VM, GitLab CI deploy)     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Address Watchers (per chain)                          │ │
│  │ - watch project addresses                             │ │
│  │ - watch matching pool addresses                       │ │
│  │ - public chains: poll RPC for incoming transfers      │ │
│  │ - privacy chains: scan with recipient-supplied        │ │
│  │   view keys (read-only)                               │ │
│  │ - cursor state per (chain, address) in watcher_state  │ │
│  └─────────────────────────┬─────────────────────────────┘ │
│                            ▼                               │
│              ┌─────────────────────────┐                   │
│              │ SQLite database         │                   │
│              │ - projects              │                   │
│              │ - donation_addresses    │                   │
│              │ - donations             │                   │
│              │ - matching_pool_addrs   │                   │
│              │ - matching_contribs     │                   │
│              │ - watcher_state         │                   │
│              │ - price_snapshots       │                   │
│              └────────────┬────────────┘                   │
│                           ▼                                │
│              ┌────────────────────────┐                    │
│              │ snapshot.json writer   │ ───► published to  │
│              │ (every 60s cron)       │      static CDN    │
│              └────────────────────────┘                    │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Deployment Strategy

Based on Anarcat's inventory of options:

| Option | Recommendation |
|---|---|
| A. Point `.org` at Vercel | Ruled out by James. |
| B. Single container via GitLab CI | **Use for the donation tracker backend.** |
| C. VM with SSH | Fallback only. |
| **D. Static site via TPA's CDN** | **Use for the frontend.** Anarcat's easiest path. |

### 4.1 Recommended split deployment

- **Frontend** → TPA static site deployment at `donate-match.torproject.org`. Next.js exports a directory of static HTML/CSS/JS files; that directory is what gets published. GitLab CI builds on merge to `main`.
- **Backend (tracker + JSON writer)** → Single Docker container deployed on a TPA-managed VM via GitLab CI. Writes `snapshot.json` to a directory served by the static CDN.
- **Database** → SQLite on the VM's persistent volume. Snapshotted hourly to TPA's backup system.

### 4.2 Environments

- `staging`: deployed from `main` to e.g. `donate-match-staging.torproject.org`.
- `production`: deployed from tagged releases (`v1.0.0`, etc.) to `donate-match.torproject.org`.
- Local dev: `docker-compose up` runs the tracker against testnet addresses + `next dev` for the frontend.

### 4.3 Secrets management

- Chain RPC API keys (Alchemy, Helius, CoinGecko, etc.) → GitLab CI secret variables.
- **Recipient-supplied view keys (XMR, shielded ZEC)** → stored encrypted at rest in TPA's secret store. Loaded into tracker memory at startup. Never logged.
- BTCPay Server API key → tracker accesses over TPA's internal network only.
- No secrets ever in the frontend bundle.

---

## 5. Core Design Principle: Cooperative Transparency

> **What this system is**
> - A multi-chain donation tracker for a known set of cooperating recipients
> - An off-chain matching calculator
> - A static, audit-friendly campaign dashboard
>
> **What this system is not**
> - A blockchain indexer
> - A voting protocol
> - A smart contract system
> - A custodial wallet
> - A KYC or identity system

This is the load-bearing assumption of the entire architecture:

> **Recipients of matching funds — both projects and the matching pool itself — are required to make their donation flows observable.**

For public chains, transparency is inherent. For privacy chains, it must be explicitly enabled by the recipient providing read-only access (view keys).

**This unlocks two things:**

1. **Privacy-chain support without breaking matching.** We can include Monero and shielded Zcash because recipients voluntarily provide observability into their incoming flows. Donor privacy is preserved (the chain still hides the sender); recipient flows become auditable for the campaign.
2. **Massive scope reduction.** We don't need a generalized indexer. We watch a finite, known list of addresses with a finite, known list of view keys.

The cost of this principle is operational: every project (and the matching pool) has to do a small amount of crypto-ops work to onboard. That tradeoff is explicitly worth it.

---

## 6. Eligibility Rules

### 6.1 Per-chain eligibility for matching

A project is eligible for matching funds **on a given chain** if and only if it has provided sufficient transparency for that chain:

| Chain | Requirement to be matching-eligible |
|---|---|
| BTC | Public donation address |
| ETH (+ L2s) | Public donation address |
| Solana | Public donation address |
| Zcash transparent (t-) | Public donation address |
| Zcash shielded (z-) | Shielded address + viewing key |
| Monero | Address + private view key |

### 6.2 Direct donations remain possible

A project that opts not to provide transparency on a given chain may still publish a donation address there. Donations to that address:

- Are accepted and forwarded to the project (we are not in the custody loop).
- Are **not counted** in the matching calculation for that project.
- Are **not displayed** on the campaign dashboard for that project.

The project's listing on the campaign site shows only chains where it is eligible. This avoids the worst-case UX of a donor giving on a chain where their donation won't count toward matching.

### 6.3 Matching pool eligibility

The matching pool itself is subject to the same rule: any chain on which the pool accepts contributions must have either a public address (public chains) or an address + view key (privacy chains). Otherwise that chain's contributions don't count toward the total pool size.

### 6.4 Onboarding artifact

Each participating project (and the pool controller) signs off on a single configuration artifact (YAML or JSON, committed to the repo) listing:
- Their per-chain addresses.
- For privacy chains: their view keys (encrypted, supplied via secure channel).
- An attestation that the addresses are theirs and they accept the visibility implications.

This artifact is the source of truth for the tracker.

---

## 7. User Experience

### 7.1 Pages

| Route | Purpose |
|---|---|
| `/` | Campaign landing: pitch, total raised counter, leaderboard, match sponsor showcase, two prominent CTAs ("Support a project" and "Fund the matching pool") |
| `/projects` | Grid of all Tor sub-projects with short descriptions and current projected match |
| `/projects/[slug]` | Deep page for a sub-project: description, donation panel showing only matching-eligible chains, live donation feed, projected match. Pre-rendered at build time via `getStaticPaths`. |
| `/matching-pool` | Dedicated page for funding the matching pool, with chain selector, addresses, QR codes, and live total |
| `/sponsors` | Public list of named match sponsors with amount committed |
| `/about` | How the round works, how matching is calculated, transparency model, FAQ |
| `/stats` | Full transparency: all donations, chain breakdowns, matching pool breakdown, downloadable CSV |

### 7.2 Project donation flow

1. Donor lands on `/projects/[slug]`.
2. Clicks into the "Support this project" panel.
3. Picks a chain/asset (tabs show only chains where the project is matching-eligible).
4. Sees: donation address, QR code, copy-to-clipboard button, deep link for EVM/Solana wallets.
5. Donor sends funds from their own wallet/exchange.
6. Within ~60–300s the donation appears on the dashboard.

### 7.3 Matching pool contribution flow

The matching pool flow is **deliberately separate** from the project donation flow.

1. Donor lands on `/matching-pool` (or clicks the "Fund the matching pool" CTA from any page).
2. Reads a clear explainer:
   > "Donations to the matching pool are distributed across all participating projects based on community support. Your contribution multiplies the impact of every donor."
3. Picks a chain/asset.
4. Sees: matching pool address for that chain, QR code, copy button, deep link.
5. Donor sends funds.
6. The contribution appears in the matching pool total within ~60–300s.

### 7.4 Live dashboard elements

On every page with campaign data:
- Total USD raised (donations + matching pool, broken out).
- Total matching pool size (live).
- Unique donor count.
- Per-project leaderboard.
- Per-chain breakdown.
- Recent donations feed (e.g. "$25 to Anti-Censorship Team via Monero, 2 min ago").
- Recent matching pool contributions (separate feed).

### 7.5 Separation of concerns (made visible to users)

| Type | Purpose | Where in UI |
|---|---|---|
| **Project donation** | Signals which projects the community values; shapes allocation | Project pages |
| **Matching pool donation** | Funds the allocation pot itself | Matching pool page |

These two flows are never combined into a single form. A donor can do either, both, or neither.

---

## 8. Data Model

### 8.1 `projects` table

```sql
CREATE TABLE projects (
  id              TEXT PRIMARY KEY,           -- slug, e.g. "anti-censorship"
  name            TEXT NOT NULL,
  short_desc      TEXT NOT NULL,
  long_desc_md    TEXT NOT NULL,
  order_index     INTEGER NOT NULL,
  active          BOOLEAN NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.2 `donation_addresses` table

```sql
CREATE TABLE donation_addresses (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id          TEXT NOT NULL REFERENCES projects(id),
  chain               TEXT NOT NULL,          -- 'btc', 'eth', 'sol', 'zec_t', 'zec_z', 'xmr', 'arb', ...
  asset               TEXT NOT NULL,
  address             TEXT NOT NULL,
  label               TEXT,                   -- e.g. BTCPay store id
  is_matching_eligible BOOLEAN NOT NULL DEFAULT 0,
  view_key_secret_ref TEXT,                   -- reference to secret store entry, NOT the key itself
  active              BOOLEAN NOT NULL DEFAULT 1,
  UNIQUE(chain, asset, address)
);
```

### 8.3 `matching_pool_addresses` table

```sql
CREATE TABLE matching_pool_addresses (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  chain               TEXT NOT NULL,
  asset               TEXT NOT NULL,
  address             TEXT NOT NULL,
  label               TEXT,
  is_matching_eligible BOOLEAN NOT NULL DEFAULT 1,
  view_key_secret_ref TEXT,
  active              BOOLEAN NOT NULL DEFAULT 1,
  UNIQUE(chain, asset, address)
);
```

### 8.4 `donations` table

```sql
CREATE TABLE donations (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id          TEXT NOT NULL REFERENCES projects(id),
  chain               TEXT NOT NULL,
  asset               TEXT NOT NULL,
  tx_hash             TEXT,                   -- nullable for some XMR cases
  block_height        INTEGER,
  block_timestamp     TIMESTAMP NOT NULL,
  source_address      TEXT,                   -- nullable for XMR / shielded ZEC
  amount_native       TEXT NOT NULL,          -- string for precision (atomic units)
  amount_usd          REAL NOT NULL,
  price_source        TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('public', 'view_key')),
  included_in_match   BOOLEAN NOT NULL DEFAULT 1,
  indexed_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chain, tx_hash, project_id)
);
CREATE INDEX idx_donations_project ON donations(project_id);
CREATE INDEX idx_donations_timestamp ON donations(block_timestamp);
```

### 8.5 `matching_contributions` table

```sql
CREATE TABLE matching_contributions (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  chain               TEXT NOT NULL,
  asset               TEXT NOT NULL,
  tx_hash             TEXT,
  block_height        INTEGER,
  block_timestamp     TIMESTAMP NOT NULL,
  source_address      TEXT,
  amount_native       TEXT NOT NULL,
  amount_usd          REAL NOT NULL,
  price_source        TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('public', 'view_key')),
  sponsor_id          TEXT REFERENCES match_sponsors(id),
  indexed_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chain, tx_hash)
);
CREATE INDEX idx_matching_timestamp ON matching_contributions(block_timestamp);
```

### 8.6 `watcher_state` table (NEW in v3.1)

```sql
CREATE TABLE watcher_state (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  chain                    TEXT NOT NULL,
  address                  TEXT NOT NULL,
  watcher_kind             TEXT NOT NULL CHECK (watcher_kind IN ('project_donation', 'matching_pool')),
  last_processed_height    INTEGER,                  -- nullable for chains without per-block cursor (e.g. Monero scan height instead)
  last_processed_timestamp TIMESTAMP NOT NULL,
  last_run_at              TIMESTAMP NOT NULL,
  last_run_status          TEXT NOT NULL CHECK (last_run_status IN ('ok', 'partial', 'error')),
  last_error               TEXT,
  UNIQUE(chain, address, watcher_kind)
);
CREATE INDEX idx_watcher_state_chain ON watcher_state(chain);
```

This table is the durable cursor for every (chain, address) pair the tracker watches. Each watcher reads its row at the start of a poll cycle, queries the chain from `last_processed_height + 1` (or from `last_processed_timestamp` for chains without block heights, like Monero scan progress), processes new events, and updates the row in the **same database transaction** that inserts the new donations/contributions. Crashes between reading the cursor and committing the transaction are safe — the next run replays from the same cursor and the UNIQUE constraints on `donations(chain, tx_hash, project_id)` and `matching_contributions(chain, tx_hash)` prevent double-insertion. See §14.4 for the full invariant.

### 8.7 `match_sponsors` table

```sql
CREATE TABLE match_sponsors (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  logo_url        TEXT,
  committed_usd   REAL,                       -- pledged amount, optional
  source_address  TEXT,                       -- if provided, lets us auto-credit incoming contributions
  source_chain    TEXT,
  public          BOOLEAN NOT NULL DEFAULT 1,
  order_index     INTEGER NOT NULL DEFAULT 0
);
```

### 8.8 `price_snapshots` table

5-minute-rounded historical USD price cache. Unchanged from v2/v3.

---

## 9. Chain Integration Details

The tracker watches **a fixed set of addresses**, not the chain at large. Each watcher is a small adapter around the chain's read APIs.

### 9.1 Bitcoin (reuse BTCPay Server)

Anarcat confirmed TPA already runs BTCPay. We consume their API — no parallel BTC indexer.

- One BTCPay store/destination per project + one for the matching pool.
- Poll `/api/v1/stores/{storeId}/invoices` or subscribe to webhooks.
- USD price snapshot at confirmation time via CoinGecko.
- `verification_method = 'public'`.

### 9.2 Ethereum + L2s (Arbitrum, Base, Optimism)

- One address per (project, chain) and one per (matching pool, chain).
- Native ETH via Alchemy `alchemy_getAssetTransfers` on the watched address.
- ERC-20 USDC/USDT via `Transfer` event subscription where `to == watchedAddress`.
- Polling cadence: every 30s. Confirmation threshold: ≥ 2 blocks.
- `verification_method = 'public'`.

### 9.3 Solana

- One address per project + one for the pool.
- Helius (or public RPC) for `getSignaturesForAddress` + `getTransaction`.
- Tracks native SOL and SPL tokens (USDC-SPL).
- Cadence: every 30s.
- `verification_method = 'public'`.

### 9.4 Zcash transparent (t-addr)

- t-address per project + one for pool.
- `zcashd` RPC or light wallet API.
- `verification_method = 'public'`.

### 9.5 Zcash shielded (z-addr) — requires view key

- Shielded address per project (only those that opt in) + optional pool address.
- Recipient supplies their **incoming viewing key**. Stored encrypted in TPA's secret store.
- Tracker uses the viewing key with `zcashd` RPC or a light client to scan for incoming notes.
- `verification_method = 'view_key'`.
- **v1 scope decision:** ship transparent ZEC at launch. Add shielded support as fast-follow once the view-key onboarding flow is exercised once with Monero.

### 9.6 Monero — requires view key

- Primary address per project + one for pool.
- Recipient supplies the **private view key** (read-only). Spend keys stay offline with the recipient. Stored encrypted in TPA's secret store.
- Tracker runs `monero-wallet-rpc` as a sidecar in the container, configured in view-only mode with each address + view key.
- `get_transfers` RPC enumerates incoming transactions.
- Cadence: every 60s.
- `verification_method = 'view_key'`.

### 9.7 No auto-conversion to USDC

arturom suggested auto-converting incoming donations to USDC. **Decision for v1: do not auto-convert.**

- Adds a hot wallet with spend keys on the tracker host (hard no for Tor Project).
- Requires DEX/CEX integrations, slippage handling, KYC for the custodian.
- The USD-snapshot-at-donation-time model gives us everything matching needs without conversion.
- Tor Project can convert manually post-round in batches.

### 9.8 Adding new chains (sponsor-driven)

If a sponsor wants their community to donate in a specific token:
- One new address per project + one pool address on that chain.
- One new watcher module.
- Price feed (CoinGecko or sponsor-provided oracle).
- If it's a privacy chain: view key from each opted-in recipient.
- One new `watcher_state` row per (project, chain) + (pool, chain).

Budget ~1 day per new chain for a standard EVM/RPC chain.

---

## 10. View Key Handling — Operational Detail

### 10.1 Collection

- Recipients submit view keys via a TPA-controlled secure channel: encrypted email to a designated key, or an upload form on a TPA-internal admin endpoint with TLS + auth.
- Never submitted via the public site or shared chat.

### 10.2 Storage

- Encrypted at rest in TPA's existing secret store.
- The `donation_addresses.view_key_secret_ref` column holds an opaque reference (e.g. `vault://kv/tor-campaign/xmr/anti-censorship/view_key`), not the key itself.
- The tracker container is the only thing with credentials to fetch view keys at startup.

### 10.3 Use

- Loaded into tracker memory at process startup.
- Used only with local `monero-wallet-rpc` / `zcashd` instances. Never sent to a third-party API.
- Never logged.

### 10.4 Rotation

- After round close, recipients are notified that they may want to rotate to a new wallet/address pair if they want post-round transactions private from us.
- TPA destroys view keys from the secret store 90 days after round close (configurable per recipient).

### 10.5 Risk acknowledgment in onboarding

The recipient onboarding artifact (§6.4) includes language making clear:
- The view key gives the campaign infrastructure visibility into all incoming transactions to that wallet.
- It does not give spending ability.
- Best practice: use a dedicated wallet for the campaign, separated from operational funds.

---

## 11. Matching Pool

### 11.1 Overview

The matching pool is the pot from which matching funds are distributed at round close. It is a **first-class fundraising target** with its own addresses and UX surface, distinct from per-project donations.

### 11.2 Addresses

One matching pool address per (chain, asset). These addresses are publicly displayed on `/matching-pool`, used solely for receiving matching contributions, not tied to any specific project, and subject to the same cooperative-transparency rules as project addresses.

### 11.3 Custody

The matching pool addresses are controlled by a designated entity (Tor Project, Commons Lab, or a co-controlled multisig — to be decided in §18). Tracker only ever reads these addresses; spend authority lives elsewhere entirely.

### 11.4 Tracking

Same model as project donations. Each matching pool watcher has its own `watcher_state` row.

### 11.5 Aggregate

```
TotalMatchingPoolUSD = sum(amount_usd) over matching_contributions
                       where the contribution's chain is matching-eligible
```

This number is **dynamic** — it grows over the round as contributions arrive. The dashboard shows it live.

### 11.6 Sponsor crediting

Named match sponsors can be credited automatically if they pre-disclose their sending address. Otherwise:

1. Sponsor commits an amount via `match_sponsors.committed_usd`.
2. Sponsor sends funds to the matching pool address for their preferred chain.
3. Operator manually maps the incoming `matching_contributions` record to the sponsor via admin UI.
4. Sponsor logo + amount appears on `/sponsors`.

### 11.7 UX requirements

The frontend MUST:
- Provide a dedicated `/matching-pool` page.
- Offer chain selection (BTC, ETH, ZEC, XMR, +others).
- Show QR codes + copyable addresses for each chain.
- Display the explainer:
  > "Donations to the matching pool are distributed across projects based on community support."
- Show live total matching pool size in USD.
- Show breakdown by chain.
- Optionally show recent matching contributions (anonymized).

### 11.8 Separation from project donations

| Type | Purpose | Lives at |
|---|---|---|
| Project donation | Signals preference; shapes allocation | `/projects/[slug]` |
| Matching contribution | Funds the pot itself | `/matching-pool` |

These flows are explicitly separated in the UI. A single transaction always belongs to exactly one bucket (because the destination address differs).

### 11.9 Non-goals

- Matching contributions do **not** influence allocation weight directly.
- No identity linking required for matching donors.
- No requirement to donate to both flows.

---

## 12. Off-Chain Matching Algorithm

### 12.1 Project score (square-root matching)

For each project `P`:

```
donors_P = unique source identifiers who donated to P, where:
  - public-chain donations dedupe by source_address
  - privacy-chain donations (no source visible) treated as individual unique donors

For each donor d ∈ donors_P:
  total_d_P = sum of amount_usd over donations from d to P
              where included_in_match = 1

project_score_P = ( Σ sqrt(total_d_P) for d ∈ donors_P )^2
```

### 12.2 Allocation against the dynamic matching pool

```
total_score = Σ project_score_P over all matching-eligible projects

For each project P:
  match_P = (project_score_P / total_score) * TotalMatchingPoolUSD
```

Where `TotalMatchingPoolUSD` is the live-calculated sum from §11.5.

### 12.3 Sybil review (post-round, manual)

1. Tracker generates a **suspicion report**: source addresses with <30 days age, donations <$2, clusters arriving in tight time windows, repeated patterns across projects.
2. Human reviewers (Commons Lab + Tor) decide which donations to flag.
3. Flagged donations get `included_in_match = 0` but remain in the public feed (transparency).
4. Final allocation runs on the filtered dataset.
5. Calculation published with sybil review notes — mirroring Gitcoin's CLI post-round process.

### 12.4 Privacy-chain donations and sybil review

Privacy-chain donations have no `source_address` to dedupe on. We treat each privacy-chain donation as a unique donor. This slightly inflates donor counts for those chains in the QF formula, but:

- It's a known tradeoff documented in the About page.
- The attack surface remains "shuffling money between trusted Tor projects" — not extraction.
- Privacy-chain donors are the audience least likely to be running a sybil attack.

If this becomes a concern, the fast-follow is to require a per-tx memo string from privacy-chain donors. Out of scope for v1.

### 12.5 Live "projected match" display

During the round, the dashboard shows a live-updated projected match per project using the formula on current data — including the live matching pool total. Labeled "projected, subject to round-close review."

---

## 13. Frontend Specification

### 13.1 Data contract — `snapshot.json`

The frontend consumes a single published JSON file, polled every 60s by TanStack Query. Static content (project descriptions, FAQ, hero copy) is baked into the HTML at build time and does not depend on this file. Live numbers (totals, leaderboard, projected match, recent feeds) come from the snapshot.

```json
{
  "generated_at": "2026-05-20T14:32:00Z",
  "campaign": {
    "name": "Tor Project Quadratic Funding Round",
    "starts_at": "2026-05-19T12:00:00Z",
    "ends_at": "2026-06-19T12:00:00Z"
  },
  "totals": {
    "total_donated_usd": 42310.55,
    "total_matching_pool_usd": 87500.00,
    "unique_donors": 1247,
    "donation_count": 1389,
    "matching_contribution_count": 18
  },
  "matching_pool": {
    "total_usd": 87500.00,
    "by_chain": {
      "btc": 30000.00,
      "eth": 40000.00,
      "sol": 5000.00,
      "zec": 7500.00,
      "xmr": 5000.00
    },
    "addresses": {
      "btc": "bc1q...",
      "eth": "0x...",
      "sol": "...",
      "zec": "t1...",
      "xmr": "4..."
    }
  },
  "projects": [
    {
      "id": "anti-censorship",
      "name": "Anti-Censorship Team",
      "matching_eligible_chains": ["btc", "eth", "sol", "zec_t", "xmr"],
      "donation_addresses": {
        "btc": "bc1q...",
        "eth": "0x...",
        "sol": "...",
        "zec_t": "t1...",
        "xmr": "4..."
      },
      "total_donated_usd": 12450.22,
      "unique_donors": 412,
      "projected_match_usd": 28300.10,
      "by_chain": {
        "btc": 3200.00,
        "eth": 4100.22,
        "sol": 1800.00,
        "zec_t": 900.00,
        "xmr": 2450.00
      }
    }
  ],
  "sponsors": [ ... ],
  "recent_donations": [
    {
      "project_id": "anti-censorship",
      "chain": "xmr",
      "amount_usd": 25.00,
      "verification_method": "view_key",
      "timestamp": "..."
    }
  ],
  "recent_matching_contributions": [
    {
      "chain": "eth",
      "amount_usd": 5000.00,
      "verification_method": "public",
      "sponsor_name": "HRF",
      "timestamp": "..."
    }
  ]
}
```

### 13.2 Build-time vs runtime data

| Content | Source | Mechanism |
|---|---|---|
| Project name, description (long_desc_md) | Database / config at build time | `getStaticProps` per project page; rendered as HTML |
| FAQ, About copy | Markdown files in repo | `getStaticProps` |
| Page metadata (OG tags, title, description) | Build-time | Per-route `<Head>` for social previews |
| Donation addresses | snapshot.json | TanStack Query, polled |
| Live totals, leaderboard, projected match | snapshot.json | TanStack Query, polled |
| Recent feeds | snapshot.json | TanStack Query, polled |

The build pipeline reads project metadata from the source-of-truth YAML config (or the API exposed by the tracker if we go that route) and bakes the static content into HTML. A new build is triggered on config changes; the live numbers don't require a rebuild.

### 13.3 Components

| Component | Description |
|---|---|
| `<CampaignHero>` | Logo, tagline, total raised counter, days remaining, dual CTA |
| `<MatchingPoolCard>` | Live pool size, "fund the pool" CTA |
| `<ProjectGrid>` | Card grid with per-project totals and projected match |
| `<ProjectPage>` | Full project page with donation panel (pre-rendered per project) |
| `<DonationPanel>` | Tabs per **matching-eligible** chain only |
| `<ChainTab>` | Address, QR code, copy button, deep link |
| `<MatchingPoolPage>` | Dedicated page mirroring `<DonationPanel>` for pool addresses |
| `<MatchingPoolPanel>` | Chain tabs for matching pool contributions |
| `<Leaderboard>` | Bar chart with sort toggle (raised / projected match) |
| `<ChainBreakdown>` | Stacked bar or pie of per-chain totals |
| `<RecentFeed>` | Auto-scrolling list of recent donations |
| `<RecentMatchingFeed>` | Auto-scrolling list of pool contributions |
| `<SponsorStrip>` | Match sponsor logo wall |
| `<TransparencyBadge>` | Small UI element showing whether a donation was verified via `public` or `view_key` |
| `<FAQAccordion>` | Collapsible FAQ |

### 13.4 Design system

- Pull tokens from the Tor Figma style guide.
- CSS variables + Tailwind `theme.extend`.
- Respect `prefers-reduced-motion`.
- WCAG 2.1 AA.
- All chain-tab interactions keyboard-navigable.
- Donation addresses rendered in monospace, high-contrast, with one-click copy.

### 13.5 Performance targets

- Initial route HTML < 30 KB gzipped (pre-rendered, no JS required for first paint).
- Hydration JS bundle < 200 KB gzipped.
- First Contentful Paint < 1.0s on 3G (pure HTML).
- Time to Interactive < 2.5s on 3G.
- `snapshot.json` gzipped < 50 KB.
- No layout shift when the dashboard updates.

### 13.6 SEO and social

- Per-page `<Head>` with descriptive `<title>`, `<meta description>`, OG tags, Twitter card tags.
- Each project page has its own OG image (generated at build time or designed in Figma).
- `sitemap.xml` generated at build time covering all routes.
- `robots.txt` allows crawling of all public routes.

---

## 14. Backend Specification

### 14.1 Tracker process structure

```
src/
  watchers/
    bitcoin.ts         # BTCPay API consumer
    evm.ts             # generic EVM watcher, instantiated per chain
    solana.ts
    zcash_t.ts         # transparent zcash
    zcash_z.ts         # shielded zcash (view-key based)
    monero.ts          # view-key based
  prices/
    coingecko.ts       # historical price lookup with caching
  secrets/
    store.ts           # interface to TPA secret store; loads view keys at startup
  db/
    schema.ts          # Drizzle schema
    migrations/
  state/
    watcher-state.ts   # cursor read/write helpers
  matching/
    compute.ts         # square-root matching against dynamic pool
    sybil-report.ts    # flag suspicious patterns
  snapshot/
    generate.ts        # writes snapshot.json
    publish.ts         # copies to static CDN location
  config/
    projects.yaml      # source-of-truth project + address config
    matching-pool.yaml # source-of-truth pool address config
  cron.ts              # entry point wiring cron jobs
  api.ts               # small admin HTTP server
```

### 14.2 Cron schedule

| Job | Cadence | Purpose |
|---|---|---|
| `watch:evm` | every 30s | Pull new EVM transfers (project + pool addresses) |
| `watch:btc` | every 60s | Pull BTCPay invoices |
| `watch:sol` | every 30s | Pull Solana transactions |
| `watch:zec_t` | every 60s | Poll Zcash t-address transfers |
| `watch:zec_z` | every 60s | Scan Zcash shielded with view keys |
| `watch:xmr` | every 60s | Scan Monero with view keys |
| `snapshot:write` | every 60s | Recompute aggregates + matching pool, write JSON |
| `prices:backfill` | every 5 min | Ensure all donations + contributions have USD snapshots |
| `backup:sqlite` | every 60 min | Snapshot DB to TPA backup location |
| `sponsor:reconcile` | every 5 min | Auto-credit matching contributions to known sponsor source addresses |

### 14.3 Admin endpoints (auth required, internal only)

- `POST /admin/donations/:id/flag` — flag a donation as sybil.
- `POST /admin/contributions/:id/credit` — manually credit a matching contribution to a sponsor.
- `POST /admin/projects` — add/edit projects (writes config + reloads).
- `POST /admin/matching-pool/addresses` — add/edit pool addresses.
- `GET /admin/export.csv` — full export for audit.
- `GET /admin/watcher-state` — view cursor state for diagnostics.
- `POST /admin/matching/finalize` — lock the matching calculation at round close.

### 14.4 Idempotency invariant (NEW in v3.1)

Every watcher MUST follow this loop, and this is a documented architectural invariant:

1. Read its row from `watcher_state` for `(chain, address, watcher_kind)`.
2. Query the chain for events strictly after `last_processed_height` (or `last_processed_timestamp` for chains without per-block cursors, like Monero).
3. Open a single DB transaction.
4. Insert all new `donations` / `matching_contributions` rows. The UNIQUE constraints on `(chain, tx_hash, project_id)` and `(chain, tx_hash)` make duplicate inserts safe — they fail loudly if the same event is processed twice.
5. **In the same transaction**, update `watcher_state.last_processed_height` to the highest fully-processed value, and set `last_run_at`, `last_run_status = 'ok'`.
6. Commit.

If the process crashes between steps 2 and 6, the next run replays from the same cursor. The UNIQUE constraint prevents double-counting; the cursor never advances past unprocessed events. If a partial batch was inserted but the cursor update failed (which shouldn't happen if step 4 and 5 are atomic, but defensively), the UNIQUE constraint catches it on retry.

Watchers MUST NOT advance their cursor based on "events seen" — only on "events fully committed." This is the single most important correctness property of the tracker.

For chains where the most recent block may be subject to reorg (EVM L2s, Solana with low confirmations), the cursor should track `current_head - confirmation_depth` rather than the latest block, to avoid having to re-process reorged blocks.

---

## 15. Security & Operational Concerns

1. **No spend keys ever on the tracker.** Only view keys (read-only) for privacy chains.
2. **View keys treated as secrets**: encrypted at rest, never logged, never sent off-host.
3. **All RPC credentials rotated** before launch; in GitLab CI secret vars.
4. **Rate limiting** on admin endpoints.
5. **CSP headers** on the frontend: no third-party scripts, strict nonce for any inline.
6. **No cookies, no tracking, no third-party embeds.**
7. **Tor .onion mirror** of the frontend (stretch goal).
8. **Backups**: SQLite snapshotted hourly, retained 90 days, mirrored to TPA's backup system.
9. **Graceful degradation**: if tracker is down, frontend shows last-known snapshot with a "data last updated X min ago" banner. Pre-rendered HTML still serves all static content with zero backend dependency.
10. **View key destruction**: 90 days after round close, by default.
11. **Matching pool custody clearly documented** in the About page.
12. **Watcher cursor monitoring**: alert if any watcher's `last_run_at` falls more than 10× its expected cadence behind, or if `last_run_status = 'error'` persists across multiple cycles.

---

## 16. Timeline & Milestones

Kickoff April 21, launch May 19. Pavel needs a public staging URL by **May 5** for the 3-week comms ramp.

| Week | Milestone |
|---|---|
| Week 1 (Apr 21–27) | Scaffold Next.js frontend + tracker. Deploy hello-world static export to `donate-match-staging.torproject.org`, validate TPA pipeline with Anarcat. EVM + BTC watchers functional with `watcher_state` cursor checkpointing. SQLite + snapshot writer wired. Project + matching-pool config schema finalized. |
| Week 2 (Apr 28–May 4) | Solana, Zcash transparent, Monero (view-key) watchers. Project pages (statically pre-rendered per slug) + donation panel. Matching pool page. Begin Figma styling. View-key onboarding flow exercised end-to-end with one project. |
| Week 3 (May 5–11) | Full site styled. Leaderboard, projected match, matching pool live total all working against testnet data. SEO/OG tags wired per page. **Staging URL shareable for comms and sponsor review.** |
| Week 4 (May 12–18) | Match sponsor integrations finalized. Real small donations on each chain end-to-end. Sybil review playbook documented. View-key onboarding completed for all participating projects. Production deploy. |
| Launch (May 19) | Campaign goes live. On-call rotation for first 72 hours. |

---

## 17. Task Breakdown (1-point stories)

Each story fits in a single focused work session. Grouped by track for parallelization.

### 17.1 Infrastructure & DevOps

1. Register subdomain `donate-match.torproject.org` with TPA (with Anarcat).
2. Create GitLab project; CI skeleton (lint, typecheck, build, deploy-staging on merge).
3. Dockerfile for tracker container (multi-stage, non-root user, `monero-wallet-rpc` + zcashd lite client as sidecars or in-image).
4. `docker-compose.yml` for local dev (tracker + SQLite volume + testnet RPCs + mock view keys + `next dev` for frontend).
5. GitLab CI job to build tracker container + push to TPA registry.
6. GitLab CI job to run `next build && next export` and deploy the `out/` directory to TPA's static CDN.
7. GitLab CI secret variables for all third-party API keys.
8. Integration with TPA secret store for view keys — define the contract.
9. Runbook: deploy, rollback, restart tracker, view logs, fetch view-key from secret store.

### 17.2 Database & Schema

10. Drizzle schema covering all tables in §8, including `watcher_state`.
11. Initial migration creating all tables + indexes.
12. Seed script: insert Tor sub-projects, donation addresses, matching pool addresses (from YAML configs); insert one `watcher_state` row per (chain, address) pair.
13. SQLite hourly backup job + restore smoke test.

### 17.3 Tracker — Common

14. `coingecko.ts` historical price fetcher with 5-min-rounded caching.
15. `state/watcher-state.ts` helpers: `read(chain, address, kind)`, `advance(chain, address, kind, height, timestamp)` with transaction-scoped semantics.
16. `BaseWatcher` abstract class: shared polling loop using cursor read → fetch → insert+advance-in-transaction → commit (per §14.4 invariant). Includes error handling, partial-batch recovery, and cursor-stalled alerts.
17. `recordDonation` service: inserts into `donations` with USD snapshot, sets `verification_method`. Designed to be called from inside the watcher's transaction.
18. `recordMatchingContribution` service: same for matching pool, with sponsor auto-credit.
19. `snapshot.json` writer: SQL aggregations, matching pool total, projected matches, JSON output.
20. `matching/compute.ts`: square-root match against dynamic pool. Unit-tested with fixtures.
21. `matching/sybil-report.ts`: synthetic sybil pattern flagging. Unit-tested.
22. `secrets/store.ts`: integration with TPA secret store; load view keys on startup; never log.
23. Wire `node-cron` jobs per §14.2.
24. Cursor-stalled monitoring + alerting (logs + admin endpoint surfacing).

### 17.4 Tracker — Per chain

25. EVM watcher: Alchemy asset-transfers integration for native ETH on Ethereum mainnet.
26. EVM watcher: USDC/USDT ERC-20 Transfer event subscription.
27. EVM watcher: extend to Arbitrum, Base, Optimism (parameterized by chain config).
28. EVM watcher: implement reorg-safe cursor (track `head - confirmation_depth`).
29. BTC watcher: BTCPay Server API client + invoice polling, cursor by invoice timestamp.
30. BTC watcher: reconciliation with confirmed on-chain transactions.
31. Solana watcher: `getSignaturesForAddress` + `getTransaction` for native SOL.
32. Solana watcher: USDC-SPL token transfers.
33. Zcash transparent watcher: `zcashd` RPC for t-address polling.
34. Zcash shielded watcher: viewing-key import + scan. (Fast-follow if launch timeline tight.)
35. Monero watcher: `monero-wallet-rpc` sidecar config + `get_transfers` with view keys, cursor by scan height.
36. Per-chain integration tests using testnet/regtest fixtures, including crash-mid-batch tests verifying cursor invariant.

### 17.5 Matching Pool

37. Define `matching-pool.yaml` config schema and document how to add chains.
38. Onboarding doc + script for matching pool controllers (how to provide addresses and view keys).
39. Wire matching pool addresses through all watchers (alongside project addresses), with their own `watcher_state` rows.
40. Aggregation logic: TotalMatchingPoolUSD across chains.
41. Sponsor auto-credit job: match incoming contributions to known sponsor source addresses.
42. Admin UI for manually crediting unmatched contributions to sponsors.
43. Surface matching pool data in `snapshot.json`.

### 17.6 View Key Operations

44. Document the secure view-key submission process for recipients.
45. Build admin endpoint (TLS + auth) for view-key upload.
46. Implement encrypted-at-rest storage in TPA secret store.
47. Audit logging for any view-key access (who, when, which key — never the value).
48. View-key destruction job (90 days post-round, configurable).

### 17.7 Frontend — Foundation

49. Scaffold Next.js (Pages Router) + TS + Tailwind; configure brand tokens from Figma; set `output: 'export'` in `next.config.js`.
50. Implement file-based routing for all routes in §7.1, including `pages/projects/[slug].tsx` with `getStaticPaths`.
51. `getStaticProps` for project pages: read project YAML/config + render long descriptions from markdown.
52. Per-page `<Head>` setup for SEO/OG tags, including dynamic OG titles per project.
53. `snapshot.json` fetcher hook using TanStack Query + 60s refresh, layered on top of static-rendered content.
54. Base layout: header, nav, footer, brand-compliant typography + spacing.
55. Light/dark theme matching Tor's existing site.
56. Accessibility audit checklist + axe-core fixes.
57. `sitemap.xml` and `robots.txt` generation at build time.

### 17.8 Frontend — Components

58. `<CampaignHero>` with animated total counter + dual CTA.
59. `<MatchingPoolCard>` summary with live pool size.
60. `<ProjectGrid>` with per-project cards.
61. `<ProjectPage>` scaffold (statically pre-rendered).
62. `<DonationPanel>` showing only matching-eligible chains.
63. `<ChainTab>` with address, QR, copy, deep link.
64. `<MatchingPoolPage>` full page.
65. `<MatchingPoolPanel>` with chain tabs.
66. `<Leaderboard>` with Recharts and sort toggle.
67. `<ChainBreakdown>` chart.
68. `<RecentFeed>` auto-scroll.
69. `<RecentMatchingFeed>` auto-scroll for pool contributions.
70. `<SponsorStrip>` logo wall.
71. `<TransparencyBadge>` showing `public` vs `view_key` verification.
72. `<FAQAccordion>` from markdown source.
73. `<StatsPage>` with full transparency table + CSV download.
74. `<AboutPage>` with matching algorithm + transparency model explainer.

### 17.9 Content

75. Draft short + long descriptions for each Tor sub-project (with Al + Tor team).
76. Source project imagery from Tor design Figma.
77. Design per-project OG images (Figma → static asset baked into build).
78. Draft FAQ copy.
79. Draft About-page sections: matching algorithm, transparency model, view-key handling, sybil review.
80. Draft `/matching-pool` page copy.
81. Draft recipient onboarding doc (how to submit addresses + view keys).

### 17.10 Admin & Operations

82. Minimal admin page for flagging donations as sybil.
83. Admin endpoint to add/edit match sponsors.
84. Admin endpoint to credit matching contributions to sponsors.
85. CSV export endpoint and download UI.
86. Sybil review playbook (thresholds, who approves).
87. On-call runbook for launch weekend.
88. Watcher diagnostics dashboard (cursor state, lag per chain).

### 17.11 Testing & Launch

89. End-to-end test: $1 on each chain to a test project on staging, verify it appears.
90. End-to-end test: $1 on each chain to the matching pool, verify it counts.
91. Cursor invariant tests: kill the watcher mid-batch, restart, verify no duplicates and no missed events.
92. Load test: 10,000 donations + 100 matching contributions through snapshot path.
93. Security review: CSP headers, secret scan, dependency audit, view-key handling audit.
94. SEO check: validate OG tags, sitemap, that Googlebot sees pre-rendered content for each route.
95. Final visual QA against Figma.
96. Production deploy + smoke test.
97. Launch-day monitoring dashboard.

---

## 18. Open Questions

1. **BTCPay Server access**: namespace on TPA's existing instance, or run our own? — For Anarcat.
2. **`.org` vs `.net` subdomain**: given fully-static frontend, does `.org` become easier? — For Anarcat.
3. **Admin authentication mechanism**: TPA preference. — For TPA.
4. **View-key secret store**: which TPA secret store to use, and submission channel for recipients. — For Anarcat + Tor finance.
5. **Matching pool custody**: who controls the pool addresses? Disbursement timing post-round? — For Al + David.
6. **Tor .onion mirror**: v1 requirement or fast-follow? — For Al.
7. **Analytics**: any analytics, or fully tracking-free? — For Al + Pavel.
8. **Final list of participating sub-projects**: blocks the seed config. — For Al (HRF confirmation pending).
9. **Shielded Zcash at launch or fast-follow?** — Recommendation: fast-follow.
10. **Per-chain view-key collection deadline**: each opted-in recipient needs to deliver a view key before testing. Suggest **May 9** as the cutoff for week 4 end-to-end testing.

---

## 19. What This Buys Us

| Dimension | v1 (MACI + WaaP) | v2 (direct + off-chain match) | v3 (cooperative tracker + dynamic pool) | **v3.1 (this version)** |
|---|---|---|---|---|
| Engineering weeks | 4–8 | ~3 | ~3 | ~3 |
| Chains supported | EVM only | BTC, EVM, SOL, ZEC-t, XMR | + ZEC shielded as fast-follow | Same |
| Donor UX | Wallet + attestation + vote ceremony | Scan QR, send | Scan QR, send | Scan QR, send |
| Sybil resistance | Cryptographic | Human review | Human review | Human review |
| Vote privacy | Strong (MACI) | Onchain pseudonymous | Same | Same |
| Donor privacy on privacy chains | N/A | N/A | Preserved | Preserved |
| Match sponsor flexibility | "Send ETH only" | "Send in your asset" | "Send in your asset" + dedicated pool flow | Same |
| Matching pool | Sponsor-pledged fixed amount | Sponsor-pledged fixed amount | **Dynamic + community-fundable** | Same |
| TPA deploy complexity | Multi-container, orchestration | Single container + static site | Single container + static site | Same |
| Auditability of privacy donations | N/A | N/A | Cooperative view-key model | Same |
| "Donor = voter" narrative | Broken | Preserved | Preserved | Preserved |
| Operational ask of recipients | None | None | View keys for privacy chains | Same |
| **Search/social discoverability of project pages** | N/A | Poor (SPA shell) | Poor (SPA shell) | **Strong (pre-rendered HTML per page)** |
| **Tracker crash safety** | N/A | Implicit dedup | Implicit dedup | **Explicit cursor invariant** |
