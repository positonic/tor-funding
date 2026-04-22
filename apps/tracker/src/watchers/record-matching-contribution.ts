/**
 * `recordMatchingContribution(tx, data)` — spec §17.3 task 18.
 *
 * Mirrors `recordDonation`:
 *   - Synchronous insert inside the caller's drizzle transaction (§14.4).
 *   - USD snapshot is pre-resolved by the caller.
 *   - Auto-credits a sponsor when the source address matches a known
 *     `match_sponsors.source_address` on the same chain (§11.6).
 */

import { and, eq } from 'drizzle-orm';

import type { Db } from '../db/client.js';
import { match_sponsors, matching_contributions } from '../db/schema.js';

export interface RecordMatchingContributionInput {
  readonly chain: string;
  readonly asset: string;
  readonly tx_hash: string | null;
  readonly block_height: number | null;
  readonly block_timestamp: Date;
  readonly source_address: string | null;
  readonly amount_native: string;
  /** USD amount — pre-resolved by the caller. */
  readonly amount_usd: number;
  /** Label recorded in `price_source` (e.g. "coingecko:history"). */
  readonly price_source: string;
  readonly verification_method: 'public' | 'view_key';
}

export function recordMatchingContribution(
  tx: Db,
  input: RecordMatchingContributionInput
): void {
  let sponsor_id: string | null = null;
  if (input.source_address !== null) {
    const rows = tx
      .select({ id: match_sponsors.id })
      .from(match_sponsors)
      .where(
        and(
          eq(match_sponsors.source_address, input.source_address),
          eq(match_sponsors.source_chain, input.chain)
        )
      )
      .all();
    sponsor_id = rows[0]?.id ?? null;
  }

  tx.insert(matching_contributions)
    .values({
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
      sponsor_id,
    })
    .run();
}
