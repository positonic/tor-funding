# @tor/tracker

Donation tracker for the Tor × Funding the Commons QF campaign.

Single long-running Node.js 20 process. Watches a known set of recipient
addresses across supported chains, stores observed donations in SQLite
(via Drizzle), and regenerates `snapshot.json` every 60s for the web app
to poll.

Canonical spec: [`docs/tech-spec-v3.1.md`](../../docs/tech-spec-v3.1.md) §14.

## Local dev

```bash
# From the repo root:
npm install
cp apps/tracker/.env.example apps/tracker/.env   # fill in API keys if you have them
npm run dev:tracker
```

You should see pino log lines for:
- config loaded and validated
- migrations applied
- seed inserts (idempotent — re-running is a no-op)
- each EVM watcher tick emitting "EVM watcher stub — no RPC configured"
- Fastify admin server listening on `http://127.0.0.1:8080`

Admin diagnostics:

```bash
curl http://127.0.0.1:8080/admin/watcher-state | jq .
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | `tsx watch` entry point for hot-reload dev |
| `npm run build` | `tsc --build` → `dist/` |
| `npm start` | Run the compiled `dist/index.js` |
| `npm run db:generate` | Regenerate migration SQL from `src/db/schema.ts` |
| `npm run db:migrate` | Apply outstanding migrations to the SQLite DB |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint over `src/` |
| `npm test` | Vitest |

## Data location

SQLite DB lives at `apps/tracker/data/tor-campaign.sqlite` (gitignored).
The snapshot is written atomically to `$SNAPSHOT_OUTPUT_PATH`
(default `./out/snapshot.json`).

## Critical invariants

1. **Cursor idempotency (spec §14.4).** Every watcher inserts events and
   advances its `watcher_state` row in the **same DB transaction**.
   See `src/watchers/base-watcher.ts`.
2. **View keys are never logged.** pino is configured with a redaction
   list. See `src/logger.ts` and `src/secrets/store.ts`.
3. **No hot wallet, no spend keys.** This process only reads chains.

## Layout

```
src/
  config/        YAML loader + zod schemas
  db/            Drizzle schema, client, migrations
  matching/      QF square-root compute (+ tests)
  prices/        CoinGecko historical price fetcher
  secrets/       Secret-store interface (view keys, never logged)
  snapshot/      Aggregator + atomic publisher
  state/         watcher_state cursor helpers
  watchers/      BaseWatcher + per-chain implementations
  logger.ts      pino with redaction
  index.ts       entry point (cron wiring, admin server)
```
