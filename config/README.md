# config/

Source-of-truth YAML for the Tor × FtC QF round. Both `@tor/tracker`
(runtime) and `@tor/web` (build-time) read from here. Changes take
effect on next tracker reload / next web build.

## Files

- [`projects.yaml`](./projects.yaml) — project list, descriptions, and
  per-chain donation addresses. Spec §14.1.
- [`matching-pool.yaml`](./matching-pool.yaml) — pool-level receiving
  addresses. Spec §11, §17.5 task 37.

## Adding a project

1. Append a new entry to `projects.yaml`:
   - Pick a stable `id` (kebab-case, used as the URL slug).
   - Set `order_index` to control grid ordering.
   - Write `short_desc` (one line, card grid) and `long_desc_md`
     (rendered on the project detail page).
   - Only list chains under `donation_addresses` that the project
     actually controls. Only set `is_matching_eligible: true` on
     chains that meet the §6 cooperative-transparency rules:
     either the chain is **publicly verifiable** (BTC, EVM, SOL, ZEC-t)
     or the project has shared a **view key** that the tracker can
     load via the secret store (XMR, ZEC-z). See §10.
2. Confirm the addresses are project-controlled (not exchange deposit
   addresses — those can be rotated without warning).
3. For view-key chains, provision the key in the TPA secret store and
   record the `vault://...` reference under `view_key_secret_ref`. The
   raw view key MUST NOT appear in this file or anywhere in git.
4. Commit together with a `@tor/types` change if the project requires a
   chain not yet in the `Chain` union.

## Adding a chain

1. Add the new literal to `Chain` in `packages/types/src/chains.ts`
   (and to `CHAINS`, `CHAIN_LABELS`, `CHAIN_VERIFICATION`).
2. Implement a watcher under `apps/tracker/src/watchers/` that obeys
   the §14.4 idempotency invariant.
3. Decide per-chain matching eligibility per spec §6:
   - **Public chains** (BTC, EVM, SOL, ZEC-t): eligible by default.
   - **View-key chains** (XMR, ZEC-z): eligible only when every
     recipient for that chain has provisioned a view key; otherwise
     the chain is display-only.
4. Add the pool address to `matching-pool.yaml` and per-project
   addresses to `projects.yaml` as relevant.
5. Update `apps/web/` components that hard-code chain lists (tab order,
   palette).

## Cooperative transparency — the short version

The campaign publishes a running `snapshot.json` so donors can watch
the match update in near-real-time. That only works because every
receiving party either uses a publicly-verifiable chain or shares a
read-only view key with the tracker. A project that refuses both
cannot accept matching-eligible donations on that chain — it can still
receive direct donations, but those won't count toward the QF match.
See spec §6 for the eligibility rules and §10 for view key handling.
