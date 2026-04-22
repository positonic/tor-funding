/**
 * `recordDonation(tx, data)` — spec §17.3 task 17.
 *
 * Inserts a new row into `donations`. USD snapshot is resolved by the
 * caller *before* entering the transaction, because `better-sqlite3`
 * transactions are synchronous and CoinGecko lookups are async. The
 * BaseWatcher pattern pre-fetches prices per event, then runs a single
 * synchronous transaction that covers all inserts + cursor advance.
 *
 * IMPORTANT — idempotency contract (§14.4):
 *  - The caller (typically `BaseWatcher.tick()`) MUST invoke this INSIDE
 *    a drizzle transaction.
 *  - If the event has already been recorded, the UNIQUE(chain, tx_hash,
 *    project_id) constraint rejects the insert. This function re-throws
 *    the raw error and lets the caller classify it.
 */

import type { Db } from '../db/client.js';
import { donations } from '../db/schema.js';

export interface RecordDonationInput {
  readonly project_id: string;
  readonly chain: string;
  readonly asset: string;
  readonly tx_hash: string | null;
  readonly block_height: number | null;
  readonly block_timestamp: Date;
  readonly source_address: string | null;
  /** Atomic-unit string (satoshis, wei, piconero, lamports). */
  readonly amount_native: string;
  /** USD amount of the donation — pre-resolved by the caller. */
  readonly amount_usd: number;
  /** Label recorded in `price_source` (e.g. "coingecko:history"). */
  readonly price_source: string;
  readonly verification_method: 'public' | 'view_key';
  readonly included_in_match?: boolean;
}

/**
 * Convert atomic units to a whole-coin float for price multiplication.
 * Exported so watchers can convert before calling `recordDonation`.
 */
export function atomicToWholeCoin(
  amountAtomic: string,
  decimals: number
): number {
  if (!/^-?\d+$/.test(amountAtomic)) {
    throw new Error(`amount_native must be an integer string, got ${amountAtomic}`);
  }
  // For the USD-value calculation, Number() is fine — we only need ~15
  // significant digits and USD values are far below 2^53.
  return Number(amountAtomic) / 10 ** decimals;
}

const ATOMIC_DECIMALS: Readonly<Record<string, number>> = {
  BTC: 8,
  ETH: 18,
  USDC: 6,
  USDT: 6,
  SOL: 9,
  ZEC: 8,
  XMR: 12,
};

export function decimalsFor(asset: string): number {
  const d = ATOMIC_DECIMALS[asset];
  if (d === undefined) {
    throw new Error(`unknown asset decimals: ${asset} — extend ATOMIC_DECIMALS`);
  }
  return d;
}

/**
 * Insert a donation. Runs inside the caller's drizzle transaction.
 *
 * Throws the underlying sqlite UNIQUE-constraint error on duplicate; the
 * caller treats that as "already processed, skip."
 */
export function recordDonation(tx: Db, input: RecordDonationInput): void {
  tx.insert(donations)
    .values({
      project_id: input.project_id,
      chain: input.chain,
      asset: input.asset,
      tx_hash: input.tx_hash,
      block_height: input.block_height,
      block_timestamp: input.block_timestamp,
      source_address: input.source_address,
      amount_native: input.amount_native,
      amount_usd: input.amount_usd,
      price_source: input.price_source,
      verification_method: input.verification_method,
      included_in_match: input.included_in_match ?? true,
    })
    .run();
}
