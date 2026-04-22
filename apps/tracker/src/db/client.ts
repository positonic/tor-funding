/**
 * Single shared SQLite + Drizzle client.
 *
 * We use `better-sqlite3` (synchronous) rather than an async driver —
 * the tracker is a single-process, single-writer workload and the sync
 * API simplifies the §14.4 transaction invariant (no await inside the
 * critical section, no risk of interleaving another watcher's work
 * between cursor read and cursor advance).
 *
 * PRAGMAs:
 *  - journal_mode = WAL      → concurrent readers (admin HTTP) don't
 *                              block writers
 *  - synchronous = NORMAL    → durable within WAL checkpoints; safe for
 *                              a process that writes at 30–60s cadence
 *  - foreign_keys = ON       → enforce project_id / sponsor_id refs
 *  - busy_timeout = 5000     → tolerate brief contention between admin
 *                              endpoint and cron jobs
 */

import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import Database from 'better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema.js';

/**
 * Typed Drizzle handle for the tracker DB.
 *
 * We use one alias (`Db`) for both the top-level database handle and
 * transaction handles passed into `db.transaction(tx => ...)`. Drizzle
 * exposes the same query-builder surface on both, and all our write
 * helpers (recordDonation, advanceWatcherState, ...) accept this type.
 * If we ever need to distinguish them, introduce a `TxDb` alias here.
 */
export type Db = BetterSQLite3Database<typeof schema>;

/**
 * The underlying `better-sqlite3` handle, exposed for migration runner
 * and the `better-sqlite3`-native transaction API (drizzle's `db.transaction`
 * delegates into this).
 */
export interface TrackerDbHandle {
  readonly db: Db;
  readonly sqlite: Database.Database;
}

let singleton: TrackerDbHandle | null = null;

/**
 * Open (or return the already-open) DB. Idempotent — call freely from
 * startup code.
 */
export function openDatabase(dbPath?: string): TrackerDbHandle {
  if (singleton !== null) return singleton;

  const resolvedPath = resolve(
    dbPath ?? process.env.DATABASE_PATH ?? './data/tor-campaign.sqlite'
  );

  // Ensure parent dir exists (data/ is gitkeep'd but the path may be customised).
  const parent = dirname(resolvedPath);
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true });
  }

  const sqlite = new Database(resolvedPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 5000');

  const db = drizzle(sqlite, { schema });
  singleton = { db, sqlite };
  return singleton;
}

/** Close the DB and clear the singleton (test teardown). */
export function closeDatabase(): void {
  if (singleton !== null) {
    singleton.sqlite.close();
    singleton = null;
  }
}
