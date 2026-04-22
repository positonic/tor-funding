# CLAUDE.md

Guidance for Claude Code working in the Tor × Funding the Commons QF campaign repo.

## Project summary

Single-purpose campaign microsite + donation tracker for the **Tor Project's quadratic funding round**, run with Funding the Commons.

- **Launch**: May 19, 2026 (staging URL required May 5 for Pavel's comms ramp)
- **Round window**: May 19 – June 19, 2026
- **URL**: `donate-match.torproject.org`
- **Canonical spec**: [docs/tech-spec-v3.1.md](docs/tech-spec-v3.1.md)
- **Design handoff**: [design-mockups/design_handoff_tor_ftc_qf/](design-mockups/design_handoff_tor_ftc_qf/)

## Architecture

Two deployables, both deployed via GitLab CI on Tor Project Associates (TPA) infra:

1. **Frontend** — Next.js (**Pages Router**, `output: 'export'`) + TypeScript + Tailwind. Pre-renders every route to HTML at build time, hydrates and polls `/snapshot.json` every 60s. Served from TPA's static CDN.
2. **Donation tracker** — single Node.js 20 container watching a known set of recipient addresses across BTC, ETH + L2s, SOL, ZEC-t, ZEC-z (view key), XMR (view key). SQLite + Drizzle. Writes `snapshot.json` to the static CDN every 60s. No smart contracts, no wallet connect, no custody.

See [docs/tech-spec-v3.1.md](docs/tech-spec-v3.1.md) §3 for the full stack rationale and §14 for the tracker spec.

## 🚨 Critical contracts (do not break)

### 1. Anti-ellipsis rule for addresses
Donors verify the full address before sending. Any `…` or U+2026 on a rendered address is a **bug**. Use the `.address-mono` class from [design-mockups/design_handoff_tor_ftc_qf/tokens/globals.css](design-mockups/design_handoff_tor_ftc_qf/tokens/globals.css). Forbidden CSS on address elements: `truncate`, `line-clamp-*`, `text-overflow: ellipsis`, `white-space: nowrap` + `overflow: hidden`. Testable: Playwright pass asserts no rendered address contains ellipsis.

### 2. No hardcoded colors
All colors live in [design-mockups/design_handoff_tor_ftc_qf/tokens/tailwind.config.ts](design-mockups/design_handoff_tor_ftc_qf/tokens/tailwind.config.ts) and `globals.css` CSS variables. Forbidden: `bg-[#...]`, `style={{ color: '#...' }}`, `rgb(...)` literals in components. Use tokens: `bg-purple-500`, `text-ink-800`, `border-ink-100`, CSS vars `var(--surface)`, `var(--brand)`, etc.

The palette has two **semantic** accents that must not be mixed:
- **Purple** (`#9338C1`) — project donation flows, primary CTAs, links, focus rings.
- **Pool orange** (`#C96A12`) — `/matching-pool` flow **only**. Never used on `/projects/*`. This is how donors distinguish the two flows.

### 3. View-key handling (tracker)
- Loaded into tracker memory at startup from TPA's secret store. Never in source, never in env files committed to the repo.
- **Never logged.** Not even at debug level. Not even redacted. Don't print, don't include in error messages.
- Used only with local `monero-wallet-rpc` / `zcashd` instances. Never sent to a third-party API.
- `donation_addresses.view_key_secret_ref` stores an opaque reference (`vault://...`) — never the key itself.
- Destroyed 90 days post-round close (configurable).

### 4. Watcher cursor idempotency (tracker)
Every watcher MUST follow the loop in spec §14.4: read `watcher_state` cursor → fetch events strictly after the cursor → **in a single DB transaction**, insert new donations/contributions AND advance the cursor → commit. UNIQUE constraints on `(chain, tx_hash, project_id)` and `(chain, tx_hash)` make replays after crash safe. Watchers MUST NOT advance the cursor based on "events seen" — only on "events fully committed."

### 5. No hot wallet, no custody, no auto-conversion
The tracker holds view keys only — never spend keys. We don't convert assets to USDC on-chain. Donations go directly to recipient-controlled addresses; USD value is snapshotted at donation time for matching math and left alone.

## Task tracking — beads

Mandatory. Session-start hook enforces this.

- `bd ready` — what's unblocked
- `bd create --title="..." --type=task|bug|feature --priority=2` (priority is integer 0–4, never "high/medium/low")
- `bd update <id> --status=in_progress` before starting work
- `bd close <id>` on completion; `bd sync --flush-only` before saying "done"
- `bd dep add <issue> <depends-on>` to wire dependencies
- **Never** use `bd edit` — it opens `$EDITOR` and blocks the agent. Use `bd update`.
- **Never** use `TodoWrite` for task tracking in this repo.

No git remote is configured — beads persist locally in `.beads/beads.db` and JSONL.

## Code conventions

### TypeScript
- Strict mode on. No `any`. Use `unknown` + narrowing where the shape is genuinely unknown.
- `??` instead of `||` for nullish coalescing (empty strings and `0` are valid values).
- Type imports: `import type { Chain } from '@/lib/types'`.
- Prefer `interface` for object shapes.

### Next.js (Pages Router, static export)
- `output: 'export'` in `next.config.js`. No API routes at runtime (except build-time `/api/og` via Satori). No server components. No `getServerSideProps`.
- Static content (project descriptions, FAQ, hero copy) is baked in via `getStaticProps` + `getStaticPaths`.
- Live numbers come from `/snapshot.json` polled every 60s via **TanStack Query**.
- Components are pure — receive data via props or `useSnapshot()`. No component fetches directly.
- Prefer `next/link` over `useRouter().push()` for navigation.

### Styling
- Tailwind CSS + CSS variables for theme surfaces (`--bg`, `--surface`, `--brand`, etc. from `globals.css`).
- Mobile-first. Design at 390×844 first, then 768, then 1280+.
- Min tap target **44×44** on touch devices — enforced globally in `globals.css`.
- Respect `prefers-reduced-motion`: disables counter animation, feed slide-in, bar transitions.
- Light + dark theme parity. Class-based (`.dark` on `<html>`). User override persists in **sessionStorage** (not localStorage — matches torproject.org behavior).

### Tracker (Node.js)
- Node 20 LTS. Drizzle ORM. SQLite in v1.
- Every watcher extends `BaseWatcher` and follows the §14.4 invariant.
- Every watcher has its own `watcher_state` row — one per `(chain, address, watcher_kind)`.
- For chains with reorgs (EVM L2s, Solana), cursor tracks `current_head - confirmation_depth`.
- `node-cron` for scheduling inside the container.

### Pre-commit discipline
Once the scaffolds land, run before committing:
- `npm run check` — lint + typecheck (fast)
- Optionally `npm test` for the packages touched

## Design system primer

Full spec in [design-mockups/design_handoff_tor_ftc_qf/README.md](design-mockups/design_handoff_tor_ftc_qf/README.md). Highlights:

- **Typography**: Inter (UI + body), Space Grotesk Bold (display numerals + hero headlines only), Space Mono (addresses, tickers, code — never substitute).
- **Spacing**: 4px base grid. Named: `touch=44px`, `panel=16px`, `panel-lg=24px`.
- **Radii**: `rounded-card=12px`, `rounded-panel=16px`, `rounded-pill=999px`.
- **Reference components**: [design-mockups/design_handoff_tor_ftc_qf/reference-components/DonationPanel.tsx](design-mockups/design_handoff_tor_ftc_qf/reference-components/DonationPanel.tsx) — start from this. Note it already supports `accent="pool"` so `MatchingPoolPanel` reuses it.
- **Sample snapshot**: [design-mockups/design_handoff_tor_ftc_qf/sample-data/snapshot.json](design-mockups/design_handoff_tor_ftc_qf/sample-data/snapshot.json) — use for dev/storybook.

## Out of scope

Per spec §2.2 and brief §12 — do not build any of:
- Wallet-connect SDK / WalletConnect
- Account creation, login, profile pages
- Comments / likes / reactions
- Recurring donations, fiat onramps, tax receipts (handled by Tor's existing donation flow)
- Server-side rendering at request time
- Real-time websockets (60s polling is sufficient)
- Generalized blockchain indexing (we watch a known set of cooperating-recipient addresses)
- Smart contracts / on-chain matching logic / cryptographic sybil resistance (MACI, ZK)
- KYC or identity linking

## Repo layout (once scaffolds land)

```
tor-platform/
├── docs/
│   └── tech-spec-v3.1.md         ← canonical spec
├── design-mockups/               ← design handoff bundle (visual truth, not production code)
├── apps/
│   ├── web/                      ← Next.js frontend (static export)
│   └── tracker/                  ← donation tracker container
├── config/
│   ├── projects.yaml             ← source-of-truth project + address config
│   └── matching-pool.yaml        ← source-of-truth pool address config
└── .beads/                       ← issue tracking
```

(Layout will be finalized in scaffolding tasks — this is the intent.)
