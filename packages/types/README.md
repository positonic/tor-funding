# @tor/types

Shared TypeScript contract between the donation tracker and the web app
for the Tor × Funding the Commons QF round.

## Purpose

This package defines the shape of `snapshot.json` — the single
JSON file published by the tracker every 60s and consumed by the web app
via TanStack Query. Canonical spec: [`docs/tech-spec-v3.1.md`](../../docs/tech-spec-v3.1.md) §13.1.

## Producer / consumer

| Side | Role | Location |
|---|---|---|
| `@tor/tracker` | **Writer** — emits `snapshot.json` matching the `Snapshot` interface every 60s. | `apps/tracker/` |
| `@tor/web` | **Reader** — polls `snapshot.json` and types the response as `Snapshot`. | `apps/web/` |

Both sides typecheck against this package via workspace linking.

## Change discipline

Any change to `Snapshot` (or its transitive types) is a **breaking
contract change** and must ship atomically:

1. Update `src/` here first.
2. Update the writer in `apps/tracker/` in the same PR.
3. Update the reader(s) in `apps/web/` in the same PR.
4. `npm run typecheck` from the repo root — all three must pass.

No runtime dependencies. Pure types + a tiny `chains` const for the
matrix of supported chains.
