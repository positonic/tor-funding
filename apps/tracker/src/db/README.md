# Database layer

Drizzle ORM over SQLite (`better-sqlite3`). Source of truth for the
schema is [`schema.ts`](./schema.ts) — it mirrors spec §8 one-to-one.

## Regenerating migrations

Run `npm run db:generate` after editing `schema.ts` to produce a new
migration SQL file in `src/db/migrations/`. Commit both the schema
change and the generated SQL in the same PR.

Apply migrations to the local DB:

```bash
npm run db:migrate
```

The tracker also runs `runMigrations()` on startup, so a fresh clone
that does `npm run dev:tracker` will bootstrap itself.

## Pragmas

Set in `client.ts`: WAL journal mode, NORMAL synchronous, foreign keys
on, 5s busy timeout. These are the defaults we assume throughout the
codebase — don't change them without coordinating with the §14.4 cursor
invariant in `watchers/base-watcher.ts`.

## Why raw atomic units as TEXT?

`donations.amount_native` and `matching_contributions.amount_native` are
TEXT. Wei values routinely exceed `Number.MAX_SAFE_INTEGER` (2^53-1), so
we store the decimal string and only convert to JS numbers for display.
USD amounts live in `amount_usd` (REAL) — cents-level precision is fine
there.
