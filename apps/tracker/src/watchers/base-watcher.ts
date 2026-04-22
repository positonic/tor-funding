/**
 * BaseWatcher — the §14.4 cursor invariant, centralised.
 *
 * =============================================================================
 *  Spec §14.4 (verbatim):
 *
 *    Every watcher MUST follow this loop, and this is a documented
 *    architectural invariant:
 *
 *      1. Read its row from `watcher_state` for
 *         (chain, address, watcher_kind).
 *      2. Query the chain for events strictly after `last_processed_height`
 *         (or `last_processed_timestamp` for chains without per-block
 *         cursors, like Monero).
 *      3. Open a single DB transaction.
 *      4. Insert all new `donations` / `matching_contributions` rows. The
 *         UNIQUE constraints on (chain, tx_hash, project_id) and
 *         (chain, tx_hash) make duplicate inserts safe — they fail loudly
 *         if the same event is processed twice.
 *      5. In the same transaction, update
 *         `watcher_state.last_processed_height` to the highest
 *         fully-processed value, and set `last_run_at`,
 *         `last_run_status = 'ok'`.
 *      6. Commit.
 *
 *  Watchers MUST NOT advance their cursor based on "events seen" — only
 *  on "events fully committed." This is the single most important
 *  correctness property of the tracker.
 *
 *  For chains where the most recent block may be subject to reorg (EVM
 *  L2s, Solana with low confirmations), the cursor should track
 *  `current_head - confirmation_depth` rather than the latest block.
 * =============================================================================
 *
 * Implementation notes:
 *
 *  - `better-sqlite3` transactions are synchronous. Async work (e.g.
 *    CoinGecko lookups) MUST happen before `db.transaction(...)` is
 *    opened. Subclasses implement `fetchEventsAfter(cursor)` which
 *    returns events with `amount_usd` + `price_source` already filled in.
 *  - Duplicate events (UNIQUE violations) are treated as "already
 *    processed": the single event is skipped, the rest of the batch
 *    proceeds, and the cursor still advances past them.
 */

import type { Db } from '../db/client.js';
import { logger, type Logger } from '../logger.js';
import {
  advanceWatcherState,
  readWatcherState,
  recordWatcherError,
  type WatcherTarget,
} from '../state/watcher-state.js';

export interface WatcherCursor {
  readonly last_processed_height: number | null;
  readonly last_processed_timestamp: Date;
}

/**
 * Shape subclasses produce per event. The union covers both donations
 * and matching pool contributions; `kind` disambiguates them for the
 * writer.
 *
 * `amount_usd` and `price_source` are expected to be pre-resolved by
 * `fetchEventsAfter` — the transactional write path is synchronous.
 */
export type WatcherEvent =
  | {
      readonly kind: 'donation';
      readonly project_id: string;
      readonly chain: string;
      readonly asset: string;
      readonly tx_hash: string | null;
      readonly block_height: number | null;
      readonly block_timestamp: Date;
      readonly source_address: string | null;
      readonly amount_native: string;
      readonly amount_usd: number;
      readonly price_source: string;
      readonly verification_method: 'public' | 'view_key';
    }
  | {
      readonly kind: 'matching_contribution';
      readonly chain: string;
      readonly asset: string;
      readonly tx_hash: string | null;
      readonly block_height: number | null;
      readonly block_timestamp: Date;
      readonly source_address: string | null;
      readonly amount_native: string;
      readonly amount_usd: number;
      readonly price_source: string;
      readonly verification_method: 'public' | 'view_key';
    };

export interface BaseWatcherOptions {
  readonly db: Db;
  readonly target: WatcherTarget;
  /** Poll interval in milliseconds. */
  readonly cadenceMs: number;
  /** Optional per-watcher child logger name. */
  readonly name: string;
}

/**
 * Internal type guard for recognising sqlite UNIQUE violations from
 * better-sqlite3. The library surfaces them with `code` on the error.
 */
function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const code = (err as { code?: string }).code;
  return (
    code === 'SQLITE_CONSTRAINT_UNIQUE' ||
    code === 'SQLITE_CONSTRAINT_PRIMARYKEY'
  );
}

export abstract class BaseWatcher {
  protected readonly db: Db;
  protected readonly target: WatcherTarget;
  protected readonly cadenceMs: number;
  protected readonly log: Logger;
  private interval: NodeJS.Timeout | null = null;
  private running = false;

  constructor(opts: BaseWatcherOptions) {
    this.db = opts.db;
    this.target = opts.target;
    this.cadenceMs = opts.cadenceMs;
    this.log = logger.child({
      watcher: opts.name,
      chain: opts.target.chain,
      watcher_kind: opts.target.watcher_kind,
    });
  }

  // -------------------------------------------------------------------------
  // Subclass contract
  // -------------------------------------------------------------------------

  /**
   * Fetch events strictly after the given cursor. Subclasses are
   * responsible for:
   *  - Respecting confirmation depth (e.g. `head - confirmation_depth`
   *    for EVM L2s).
   *  - Pre-resolving `amount_usd` and `price_source` for every event.
   *  - Returning events sorted ascending by (block_height, block_timestamp)
   *    so the cursor advance in `tick()` is monotonic.
   */
  protected abstract fetchEventsAfter(
    cursor: WatcherCursor
  ): Promise<readonly WatcherEvent[]>;

  /** Write a single event to the open transaction. */
  protected abstract recordEvent(tx: Db, event: WatcherEvent): void;

  // -------------------------------------------------------------------------
  // The §14.4 loop.
  // -------------------------------------------------------------------------

  async tick(): Promise<void> {
    if (this.running) {
      // Guard against overlapping ticks if a slow RPC call outlasts the
      // cadence. Next interval will retry.
      this.log.warn('tick skipped — previous tick still running');
      return;
    }
    this.running = true;
    try {
      const stateRow = readWatcherState(this.db, this.target);
      if (stateRow === null) {
        throw new Error(
          `watcher_state row missing for ${JSON.stringify(this.target)} — seed at startup`
        );
      }
      const cursor: WatcherCursor = {
        last_processed_height: stateRow.last_processed_height,
        last_processed_timestamp: stateRow.last_processed_timestamp,
      };

      const events = await this.fetchEventsAfter(cursor);
      if (events.length === 0) {
        this.log.debug('no new events');
        return;
      }

      // §14.4 steps 3–6: single transaction covering ALL inserts + cursor
      // advance. `db.transaction` is synchronous under better-sqlite3.
      const maxHeight = this.computeMaxHeight(events, cursor.last_processed_height);
      const maxTimestamp = this.computeMaxTimestamp(
        events,
        cursor.last_processed_timestamp
      );

      let inserted = 0;
      let skipped = 0;

      this.db.transaction((txArg) => {
        // Drizzle's transaction callback type (`SQLiteTransaction<...>`) and
        // the top-level handle (`BetterSQLite3Database<...>`) both extend the
        // same base query builder; our write helpers only use methods on that
        // base. Cast once here so helpers stay typed against `Db`.
        const tx = txArg as unknown as Db;

        for (const event of events) {
          try {
            this.recordEvent(tx, event);
            inserted++;
          } catch (err) {
            if (isUniqueViolation(err)) {
              // Already processed — safe to skip, per §14.4.
              skipped++;
              continue;
            }
            throw err;
          }
        }

        advanceWatcherState(tx, {
          ...this.target,
          last_processed_height: maxHeight,
          last_processed_timestamp: maxTimestamp,
          last_run_status: 'ok',
          last_error: null,
        });
      });

      this.log.info(
        { inserted, skipped, new_cursor_height: maxHeight },
        'tick committed'
      );
    } catch (err) {
      const message = (err as Error).message ?? String(err);
      this.log.error({ err: message }, 'tick failed');
      // Out-of-band cursor update to surface the error via
      // /admin/watcher-state. Does NOT touch last_processed_* so the
      // next tick retries from the same point.
      try {
        recordWatcherError(this.db, this.target, message);
      } catch (inner) {
        this.log.error(
          { err: (inner as Error).message },
          'failed to record watcher error'
        );
      }
    } finally {
      this.running = false;
    }
  }

  // -------------------------------------------------------------------------
  // Cursor math
  // -------------------------------------------------------------------------

  private computeMaxHeight(
    events: readonly WatcherEvent[],
    prior: number | null
  ): number | null {
    let max = prior;
    for (const e of events) {
      if (e.block_height === null) continue;
      if (max === null || e.block_height > max) max = e.block_height;
    }
    return max;
  }

  private computeMaxTimestamp(
    events: readonly WatcherEvent[],
    prior: Date
  ): Date {
    let max = prior;
    for (const e of events) {
      if (e.block_timestamp.getTime() > max.getTime()) max = e.block_timestamp;
    }
    return max;
  }

  // -------------------------------------------------------------------------
  // Scheduling
  // -------------------------------------------------------------------------

  /** Start the polling loop. Idempotent. */
  start(): void {
    if (this.interval !== null) return;
    this.log.info({ cadence_ms: this.cadenceMs }, 'watcher starting');
    // Fire once immediately; subsequent ticks on interval.
    void this.tick();
    this.interval = setInterval(() => {
      void this.tick();
    }, this.cadenceMs);
  }

  /** Stop the polling loop. Idempotent. */
  stop(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
