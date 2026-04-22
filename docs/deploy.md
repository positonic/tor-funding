# Deploy guide — for TPA

Audience: Tor Project Administration (TPA) — Anarcat and team.
Target launch: **May 19, 2026**. Staging URL required by **May 5** for Pavel's 3-week comms ramp.

This document is the operational runbook for deploying and running the Tor × Funding the Commons QF campaign site on TPA infrastructure. The app developers own correctness; TPA owns uptime, secrets, and the CDN transport. This file lists every operational contract between the two sides.

Canonical technical spec: [tech-spec-v3.1.md](tech-spec-v3.1.md).

---

## 1. What gets deployed

Two independent artifacts, same GitLab project, path-filtered CI:

| # | Artifact | Source path | Deploy target | Redeploy frequency |
|---|----------|-------------|---------------|--------------------|
| 1 | **Static website** | `apps/web/` → `apps/web/out/` (after `next build`) | TPA static CDN under `donate-match.torproject.org` | On merge to `main` (content/UI changes). Expected ~daily during ramp, then ~weekly. |
| 2 | **Donation tracker container** | `apps/tracker/` → Docker image | Single container on a TPA-managed VM | On merge to `main` (tracker code changes). Expected ~weekly. |

Both paths ship through the **same** GitLab pipeline in `.gitlab-ci.yml`, gated by `changes:` rules — a UI-only PR does not rebuild the tracker, and a watcher-only PR does not rebuild the frontend.

Donors only ever hit the CDN. They never connect to the tracker VM, directly or indirectly.

---

## 2. System requirements

### 2.1 Static site (CDN)

- **DNS**: A record `donate-match.torproject.org` and staging `donate-match-staging.torproject.org` pointing at TPA's existing static-hosting surface. Open question: whether to use `.org` or `.net` subdomain — deferring to Anarcat (spec §18 Q2).
- **Storage**: ~30MB for the built frontend (`apps/web/out/`). Plus ongoing writes of `snapshot.json` (~50KB gzipped) — rewritten every 60s by the tracker.
- **TLS**: standard `*.torproject.org` certificate surface. No special cert needs.
- **Caching**: set `Cache-Control: public, max-age=31536000, immutable` on hashed assets (`_next/static/*`). Set `Cache-Control: public, max-age=30, must-revalidate` (or even `no-cache`) on `snapshot.json` — we need the 60s polling cadence to actually see new values. Default HTML can cache for a short window (~5min) or use ETags.

### 2.2 Tracker VM

- **OS**: any Linux that runs Docker. Debian stable matches TPA's existing fleet.
- **CPU / RAM**: 2 vCPU / 4 GB RAM is comfortably over-provisioned. The tracker is almost entirely I/O-bound; it polls external RPCs and writes to SQLite. Baseline load is < 5% CPU, <200MB RAM.
- **Disk**: 20 GB for headroom. Actual SQLite footprint will be ~100 MB even at 10× the projected donation volume.
- **Network egress**:
  - Outbound HTTPS to: CoinGecko, Alchemy (Ethereum + L2s), Helius (Solana), BTCPay Server (TPA-internal), `api.github.com` (for image pulls in CI, not runtime).
  - Outbound from `monero-wallet-rpc` sidecar to a remote Monero node (can be a public node or TPA-run). ZEC-t uses `zcashd` RPC — either a TPA-run node or a light-wallet API.
  - Outbound to CDN write endpoint (see §6 — this is the one new inbound surface we need TPA to set up).
- **Inbound**:
  - **None from the public internet.** The admin HTTP on port 8080 binds to `127.0.0.1` only.
  - SSH from TPA ops + Anarcat for deploys, debugging, view-key access.
- **Persistent volume**: one volume mounted at `/app/data`. Contains the SQLite file and derivative artifacts. Sized 20 GB. Backed up per §7.

### 2.3 Operating-team surface

- Nobody outside TPA + the campaign engineering team ever touches the tracker VM.
- Recipients never submit view keys through any public endpoint. See §5.

---

## 3. GitLab CI pipeline

Full pipeline lives in `.gitlab-ci.yml` at the repo root. Stages:

```
install  →  check (typecheck + lint)  →  build (web | tracker, path-filtered)  →  deploy (staging | prod)
```

### 3.1 Stages at a glance

| Stage | Jobs | What it produces |
|---|---|---|
| `install` | `install` | `node_modules/` cached as artifact |
| `check` | `typecheck`, `lint` | Pass/fail signal. Blocks downstream stages on failure. |
| `build` | `build-web` (when web/types/config change) | `apps/web/out/` — the static site directory |
| | `build-tracker` (when tracker/types/config change) | Docker image tagged with the commit SHA, pushed to TPA registry |
| `deploy` | `deploy-web-staging` (on `main` with web changes) | `rsync apps/web/out/` → staging CDN path |
| | `deploy-tracker-staging` (on `main` with tracker changes) | `docker pull` + restart on staging VM |
| | `deploy-web-prod` / `deploy-tracker-prod` | Gated on **tagged release** (`v1.0.0`, etc.) |

### 3.2 What TPA needs to wire up

Right now the deploy steps in `.gitlab-ci.yml` are **placeholder `echo` commands** because the actual targets are TPA secrets. We need you to provide:

- [ ] **Static CDN rsync target** — an SSH target + path we can rsync `out/` to. One for staging, one for prod. Example contract: `deploy@cdn.torproject.org:/srv/www/donate-match-staging` / `/srv/www/donate-match`.
- [ ] **GitLab CI shell-runner credentials** for the above — SSH key loaded as a protected CI variable.
- [ ] **Docker registry** — `registry.torproject.org` path for the tracker image, plus a deploy token.
- [ ] **Tracker VM SSH target** — so the deploy job can `ssh tpa-vm 'docker pull ... && docker restart tracker'`.
- [ ] **Staging VM + prod VM** — two separate VMs, or one with two docker-compose stacks.

Once those land, we replace the `echo` lines and flip the pipeline from dry-run to real.

---

## 4. Environment variables & secrets

All values below live in **GitLab CI protected variables** (for build-time access) or in a secrets file on the tracker VM (for runtime access). Nothing is in the repo or in the web bundle.

### 4.1 Frontend (`apps/web`)

The static site has **zero runtime secrets**. Its only config is build-time and lives in `config/*.yaml`, committed to the repo.

### 4.2 Tracker container (`apps/tracker`)

| Variable | Where it lives | Purpose | Who provides |
|---|---|---|---|
| `DATABASE_URL` / SQLite path | tracker `/app/data/tor-campaign.sqlite` (volume) | SQLite file location | tracker defaults |
| `SNAPSHOT_OUTPUT_PATH` | env var | Where `snapshot.json` gets written locally (before being shipped to CDN — see §6) | TPA sets to a shared volume path |
| `COINGECKO_API_KEY` | TPA secret store → env | Historical price lookups | TPA |
| `ALCHEMY_API_KEY` | TPA secret store → env | Ethereum + L2s RPC | TPA |
| `HELIUS_API_KEY` | TPA secret store → env | Solana RPC | TPA |
| `BTCPAY_BASE_URL` + `BTCPAY_API_KEY` | TPA-internal | BTC invoice polling | TPA |
| `ADMIN_PORT` | env | Admin HTTP bind port (default 8080, bound to 127.0.0.1) | tracker default |
| `LOG_LEVEL` | env | pino log level (default `info`) | TPA |
| `TOR_SECRETS_XMR_ANTI_CENSORSHIP_VIEW_KEY` | **TPA secret store** → env at startup | Private view key — Monero / Anti-Censorship | Recipient → TPA (see §5) |
| `TOR_SECRETS_XMR_TOR_BROWSER_VIEW_KEY` | same | Monero / Tor Browser view key | Recipient → TPA |
| `TOR_SECRETS_XMR_MATCHING_POOL_VIEW_KEY` | same | Monero / matching pool view key | Matching pool controller → TPA |
| `TOR_SECRETS_ZEC_*_VIEW_KEY` | same | Zcash shielded viewing keys (fast-follow; not at v1 launch) | Recipient → TPA |

**`TOR_SECRETS_*_VIEW_KEY` are the only secrets with legal / donor-trust implications.** See §5.

### 4.3 Secret-store contract

The tracker references every view key by an **opaque path** like `vault://kv/tor-campaign/xmr/anti-censorship/view_key`. The path is in `config/projects.yaml` (committed). The resolver maps the opaque path to a real secret via `TOR_SECRETS_*` env vars, injected by the TPA secret store at container start.

For v1, the local-dev resolver reads plain env vars with the name mapping shown above. TPA replaces that with your existing secret-store mechanism (Vault? Pass? Ansible-vault?). Open question (spec §18 Q4): **which TPA secret store do we use, and what's the submission channel for recipients?** — For Anarcat + Tor finance.

---

## 5. View-key handling (high-sensitivity operational contract)

Read this section carefully. It's the part with the most residual risk.

### 5.1 What a view key is

- Monero / shielded Zcash are privacy chains. To enumerate donations to a recipient wallet, you need either (a) the spend key — we will not ask for or accept this — or (b) the **incoming viewing key**, which lets the campaign see incoming transactions but not spend them.
- Every participating project on a privacy chain must supply a view key to the campaign. The same applies to the matching pool if it accepts privacy-chain contributions.
- Best practice: recipients use a dedicated wallet for the campaign, separate from operational funds.

### 5.2 Submission channel (to be finalized with TPA)

**Hard requirements:**
- Never transmitted via the public site, Signal, Discord, regular email, or shared chat.
- Submission must be over TLS + authenticated and explicitly logged.

**Options for TPA to pick between:**
1. **Encrypted email to a designated Tor-finance key** — `finance@torproject.org` with a published GPG fingerprint.
2. **TPA-internal admin upload endpoint** — the tracker's admin HTTP on port 8080 grows a `POST /admin/view-key/:chain/:project_id` endpoint, authenticated via TPA's internal auth (see spec §18 Q3). Reachable only via VPN or SSH tunnel.

We recommend option 2 — it leaves a structured audit log, has fewer "did you check PGP?" failure modes, and the receiving code is the only process that ever holds the key.

Either way: submission produces a ticket in TPA's ops tracker so we have a human-readable log of who submitted what when.

### 5.3 Storage

- **Encrypted at rest** in TPA's existing secret store.
- Referenced by opaque path in `config/projects.yaml` (e.g., `vault://kv/tor-campaign/xmr/anti-censorship/view_key`). The path is public-committable. The key behind the path is not.
- Loaded into tracker memory **once at container startup**. Never re-fetched, never cached to disk.

### 5.4 Use

- Consumed only by the local `monero-wallet-rpc` / `zcashd` sidecar. **Never sent to a third-party API.** Never written to a log file.
- pino's log redaction list includes `view_key`, `private_view_key`, `secret`, `api_key`, `authorization` — logs are safe by default.

### 5.5 Destruction

- After round close (default: 90 days later, configurable per recipient), the destruction job deletes each key from the secret store and overwrites the in-memory reference.
- Recipients are advised to rotate to a new wallet/address pair post-round if they want their ongoing transactions private from the campaign.

### 5.6 What a view key does NOT do

Document this prominently in recipient onboarding:
- **No spend ability.** Spend keys stay offline with the recipient.
- **No retroactive visibility.** It only exposes transactions that arrive at the address after the key was generated — but for the duration it exists, all incoming traffic to that wallet is visible.

---

## 6. `snapshot.json` publishing — the one cross-cutting question

The tracker writes `snapshot.json` to a local path every 60s. The frontend polls `donate-match.torproject.org/snapshot.json`. Something has to bridge those two — here are the options, ranked:

### Option A (recommended): shared volume between tracker VM and CDN origin

If the tracker VM and the CDN origin have a shared filesystem (NFS, local, whatever TPA's topology allows), the tracker writes directly into the CDN-served directory (atomically via `.tmp` + `rename`). **Simplest.** No network transport, no polling loop, no transient failure window.

### Option B: tracker pushes to CDN via `rsync` or `scp` every 60s

A cron job on the tracker VM `rsync`s `snapshot.json` to the CDN host after each write. ~30s end-to-end latency on top of the tracker's 60s cadence. Requires an SSH key for the push. Works fine if a shared FS is not available.

### Option C: CDN pulls from the tracker

CDN origin fetches `snapshot.json` from the tracker VM's admin HTTP (`GET /admin/snapshot.json`) every 60s. Reverses the trust direction (CDN → tracker VM instead of tracker → CDN), which is slightly cleaner but needs a new inbound port on the tracker VM. We don't recommend this for v1.

**Decision needed from TPA**: which option best fits your existing ops model? The tracker code is option-agnostic — we just need to point `SNAPSHOT_OUTPUT_PATH` at the right place, or wire up a post-write hook.

---

## 7. Backups

### 7.1 SQLite

- Hourly snapshot job (`tor-platform` repo, §17.2 task 13 in beads) `sqlite3 /app/data/tor-campaign.sqlite ".backup /app/data/backups/tor-campaign-$(date +%Y%m%dT%H%M%S).sqlite"`.
- TPA's backup system mirrors `/app/data/backups/` off-host nightly.
- Retention: 90 days rolling, per spec §15.
- **Restore smoke test**: exercised during week 4 of the campaign ramp.

### 7.2 Config

`config/projects.yaml` and `config/matching-pool.yaml` are in git. Git is the authoritative source — losing the tracker VM loses no config, only runtime state.

### 7.3 Secrets

TPA secret store's own backup policy applies. View keys are destroyed 90 days post-round; backup retention should respect that lifecycle (i.e., not retain view keys longer than the operational key lifetime).

---

## 8. Monitoring & alerting

### 8.1 Health checks

- `GET http://127.0.0.1:8080/healthz` on the tracker VM returns 200 OK if the process is up. Useful as a systemd / Docker healthcheck probe.
- A static `HEAD /snapshot.json` from an external monitor validates the CDN side.

### 8.2 Cursor-stalled alerts (spec §15 item 12)

For every (chain, address) in `watcher_state`, if `last_run_at` falls more than **10× the expected cadence** behind (e.g., EVM cadence 30s → alert at 5 min silence), page on-call. Data source: `GET http://127.0.0.1:8080/admin/watcher-state`. We'll provide a tiny script TPA can schedule, or wire it into your existing monitoring once you tell us what that is.

### 8.3 Error-status alerts

If any row in `watcher_state` has `last_run_status = 'error'` for 3+ consecutive cycles, alert. Same data source.

### 8.4 Disk-space

Standard TPA disk-space monitoring on `/app/data`. The SQLite file plus hourly backups are expected <500 MB at campaign end; alert at 75% of the 20 GB volume.

### 8.5 Logs

Structured JSON via pino. TPA's existing log-aggregation picks them up from stdout. **Redaction is baked in**: keys named `view_key`, `private_view_key`, `secret`, `api_key`, `authorization` are replaced with `[REDACTED]`.

---

## 9. Runbook — common operations

### 9.1 Deploy (automatic via GitLab CI)

Nothing to do manually. `git push origin main` with a qualifying change triggers the right jobs.

### 9.2 Rollback frontend

- SSH to the CDN host.
- `rsync -a /srv/www/donate-match.previous/ /srv/www/donate-match/`.
- Previous build is retained by the CI job for 1 week. For older rollbacks, re-run the CI job on the target git SHA.

### 9.3 Rollback tracker

- `docker pull registry.torproject.org/tor-platform/tracker:<previous-sha>`.
- `docker stop tracker && docker rm tracker`.
- `docker run --name tracker --restart unless-stopped -v /app/data:/app/data --env-file /etc/tor-platform/tracker.env registry.torproject.org/tor-platform/tracker:<previous-sha>`.
- The SQLite schema is backwards-compatible with the previous tracker for at least 1 release; rolling back never requires a schema downgrade.

### 9.4 Restart tracker

```
docker restart tracker
```

Clean. The cursor invariant (§14.4 in the spec) guarantees no donation is double-counted or missed across a restart.

### 9.5 View logs

```
docker logs --since 1h --follow tracker
```

### 9.6 Fetch a view key for debugging

**Don't.** If you must, use TPA's secret-store CLI directly with two-person review. Never print, copy-paste, or save the value. Read it straight from the tool, confirm the thing you needed to confirm, close the tool.

### 9.7 Manually trigger a snapshot regenerate

```
curl -X POST http://127.0.0.1:8080/admin/snapshot/regenerate
```

(Admin endpoint exists on the roadmap — §17.3 task 24.)

### 9.8 Flag a donation as sybil post-round

Via admin UI (§17.10 task 82) or `POST http://127.0.0.1:8080/admin/donations/:id/flag`. Flagged rows have `included_in_match = 0` but remain in the public feed for transparency.

---

## 10. Pre-launch checklist (for TPA)

### 4 weeks out (April 21–27, 2026) — Week 1

- [ ] Subdomain `donate-match-staging.torproject.org` registered and CNAME / A record live.
- [ ] GitLab project created; CI vars for staging CDN rsync target set.
- [ ] TPA secret store submission channel for view keys decided (§5.2).
- [ ] One tracker VM provisioned (staging), Docker runtime installed.
- [ ] Docker registry path for the tracker image set.

### 3 weeks out (April 28 – May 4) — Week 2

- [ ] Tracker container deploys successfully to staging VM on every merge to `main`.
- [ ] Frontend static export deploys successfully to staging CDN on every merge to `main`.
- [ ] `snapshot.json` publishing loop works end-to-end (option A / B / C from §6 implemented).

### 2 weeks out (May 5–11) — Week 3: **Pavel's comms ramp starts**

- [ ] Staging URL publicly accessible and shareable.
- [ ] Cursor-stalled alerts wired up in TPA monitoring.
- [ ] First recipient view key submitted end-to-end through the real submission channel (catches bugs before launch week).

### 1 week out (May 12–18) — Week 4

- [ ] Production tracker VM provisioned.
- [ ] Production CDN path active, `donate-match.torproject.org` live (showing staging content or a pre-launch holding page).
- [ ] All opted-in recipients' view keys submitted by **May 9**.
- [ ] Restore-from-backup smoke test passed.
- [ ] On-call rotation staffed for launch weekend.

### Launch (May 19)

- [ ] Tagged release `v1.0.0` cut. Production deploys triggered.
- [ ] On-call watching cursor-lag alerts for 72 hours.

---

## 11. Open questions for TPA (to resolve before week 1 end)

Mirrors spec §18. The ones TPA owns:

1. **`donate-match.org` vs `donate-match.net`?** (Q2)
2. **Admin authentication mechanism?** OAuth via Gitlab? mTLS? Basic over VPN? (Q3)
3. **View-key submission channel + secret store?** (Q4)
4. **BTCPay Server**: namespace on TPA's existing instance, or spin up our own for this campaign? (Q1)
5. **Analytics** — any TPA-approved self-hosted metrics, or fully tracking-free? (Q7)
6. **`.onion` mirror** — v1 launch or fast-follow? (Q6)

---

## 12. Security posture summary

- Frontend: zero runtime secrets, zero user input that writes to state, zero third-party scripts, strict CSP. All tap targets static HTML + client-side React rehydration over a JSON file. Blast radius of a compromise: the site could be defaced (same as any static site); no donor data at risk (there is no donor data stored).
- Tracker: view keys (read-only), RPC API keys, BTCPay API key. No spend keys ever. Admin HTTP on loopback. SQLite on a local volume. Entire attack surface is what TPA ops decides to expose via SSH.
- Secret rotation policy: all RPC keys rotated before launch and again at round close. View keys destroyed 90 days post-close.
- Codebase security review tracked in beads (§17.11 task 93) before production deploy — includes CSP header review, dep audit, secret scan, and view-key-handling audit.

---

## Contacts

- **App developer (primary)**: James Farrell, Commons Lab / Funding the Commons
- **TPA lead**: Anarcat
- **Campaign program lead**: Al (Tor Project) + Pavel (comms ramp)
- **Matching pool custody**: TBD (spec §18 Q5)

Questions about this doc → James. Questions about TPA infra → Anarcat. If we disagree, Al calls it.
