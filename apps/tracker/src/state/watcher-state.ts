/**
 * Helpers for reading and advancing the `watcher_state` cursor.
 *
 * See spec §14.4. The one rule that matters:
 *
 *   advanceWatcherState() MUST be called inside the same DB transaction
 *   that inserted the events. The BaseWatcher.tick() loop enforces this.
 */

import { and, eq } from 'drizzle-orm';

import type { Db } from '../db/client.js';
import {
  watcher_state,
  type WatcherStateRow,
} from '../db/schema.js';

export type WatcherKind = 'project_donation' | 'matching_pool';

export interface WatcherTarget {
  readonly chain: string;
  readonly address: string;
  readonly watcher_kind: WatcherKind;
}

export interface AdvanceArgs extends WatcherTarget {
  readonly last_processed_height: number | null;
  readonly last_processed_timestamp: Date;
  readonly last_run_status: 'ok' | 'partial' | 'error';
  readonly last_error?: string | null;
}

export interface SeedArgs extends WatcherTarget {
  readonly last_processed_height: number | null;
  readonly last_processed_timestamp: Date;
}

/**
 * Read the cursor row for a (chain, address, watcher_kind) triple.
 * Returns `null` if no row exists yet — the caller should seed one
 * (`seedWatcherState`) at startup so this only returns null during
 * bootstrap.
 */
export function readWatcherState(
  db: Db,
  target: WatcherTarget
): WatcherStateRow | null {
  const rows = db
    .select()
    .from(watcher_state)
    .where(
      and(
        eq(watcher_state.chain, target.chain),
        eq(watcher_state.address, target.address),
        eq(watcher_state.watcher_kind, target.watcher_kind)
      )
    )
    .all();
  return rows[0] ?? null;
}

/**
 * Update the cursor row. MUST be called inside the same transaction that
 * inserted the events (§14.4). `tx` is a drizzle transaction handle —
 * the type is the same `Db` the watcher otherwise uses, because drizzle
 * shares the interface.
 */
export function advanceWatcherState(tx: Db, args: AdvanceArgs): void {
  tx.update(watcher_state)
    .set({
      last_processed_height: args.last_processed_height,
      last_processed_timestamp: args.last_processed_timestamp,
      last_run_at: new Date(),
      last_run_status: args.last_run_status,
      last_error: args.last_error ?? null,
    })
    .where(
      and(
        eq(watcher_state.chain, args.chain),
        eq(watcher_state.address, args.address),
        eq(watcher_state.watcher_kind, args.watcher_kind)
      )
    )
    .run();
}

/**
 * Idempotently seed a cursor row at startup. Uses SQLite's
 * `INSERT ... ON CONFLICT DO NOTHING` so restart doesn't overwrite a
 * live cursor.
 */
export function seedWatcherState(db: Db, args: SeedArgs): void {
  db.insert(watcher_state)
    .values({
      chain: args.chain,
      address: args.address,
      watcher_kind: args.watcher_kind,
      last_processed_height: args.last_processed_height,
      last_processed_timestamp: args.last_processed_timestamp,
      last_run_at: new Date(0),
      last_run_status: 'ok',
      last_error: null,
    })
    .onConflictDoNothing({
      target: [
        watcher_state.chain,
        watcher_state.address,
        watcher_state.watcher_kind,
      ],
    })
    .run();
}

/**
 * Out-of-band (i.e. NOT inside the events transaction) update used when
 * the whole tick fails before any events were committed. Records the
 * error so `last_run_status = 'error'` is visible on the admin endpoint
 * and the cursor-stalled alert (§15 / §17.3 task 24) can fire.
 */
export function recordWatcherError(
  db: Db,
  target: WatcherTarget,
  message: string
): void {
  db.update(watcher_state)
    .set({
      last_run_at: new Date(),
      last_run_status: 'error',
      last_error: message.slice(0, 500),
    })
    .where(
      and(
        eq(watcher_state.chain, target.chain),
        eq(watcher_state.address, target.address),
        eq(watcher_state.watcher_kind, target.watcher_kind)
      )
    )
    .run();
}

/** Read all cursor rows for admin diagnostics (§17.3 task 24). */
export function readAllWatcherState(db: Db): readonly WatcherStateRow[] {
  return db.select().from(watcher_state).all();
}
