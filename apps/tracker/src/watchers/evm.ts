/**
 * Skeleton EVM watcher. Proves the BaseWatcher pattern end-to-end on one
 * chain without requiring a live RPC key for the scaffold.
 *
 * Real implementation lands in §17.4 tasks 25–28 — this file leaves the
 * shape in place and stubs out the RPC call with a commented-out Alchemy
 * request body so the next implementer sees the intended shape.
 *
 * Cursor semantics (spec §14.4 final paragraph):
 *   For reorg-prone chains, the cursor tracks `current_head -
 *   confirmationDepth` rather than the chain tip, so we never have to
 *   re-process reorged blocks.
 */

import type { Db } from '../db/client.js';
import type { CoinGeckoClient } from '../prices/coingecko.js';
import {
  BaseWatcher,
  type WatcherCursor,
  type WatcherEvent,
} from './base-watcher.js';
import { recordDonation } from './record-donation.js';
import { recordMatchingContribution } from './record-matching-contribution.js';

export type EvmChain = 'eth' | 'arb' | 'base' | 'op';

export interface EvmWatcherOptions {
  readonly db: Db;
  readonly chain: EvmChain;
  readonly address: string;
  readonly watcherKind: 'project_donation' | 'matching_pool';
  /** Needed for pricing once real RPC is wired up. */
  readonly priceClient: CoinGeckoClient;
  /**
   * Number of blocks behind chain head that the cursor trails, so we
   * don't have to re-process reorged blocks. Spec §14.4.
   */
  readonly confirmationDepth: number;
  /**
   * For donation watchers only: the project the address belongs to.
   * Unused for matching-pool watchers.
   */
  readonly projectId?: string;
  readonly cadenceMs?: number;
}

export class EvmWatcher extends BaseWatcher {
  private readonly chain: EvmChain;
  private readonly address: string;
  private readonly watcherKind: 'project_donation' | 'matching_pool';
  private readonly priceClient: CoinGeckoClient;
  private readonly confirmationDepth: number;
  private readonly projectId: string | undefined;

  constructor(opts: EvmWatcherOptions) {
    super({
      db: opts.db,
      target: {
        chain: opts.chain,
        address: opts.address,
        watcher_kind: opts.watcherKind,
      },
      cadenceMs: opts.cadenceMs ?? 30_000,
      name: `evm:${opts.chain}`,
    });
    this.chain = opts.chain;
    this.address = opts.address;
    this.watcherKind = opts.watcherKind;
    this.priceClient = opts.priceClient;
    this.confirmationDepth = opts.confirmationDepth;
    this.projectId = opts.projectId;
  }

  protected async fetchEventsAfter(
    _cursor: WatcherCursor
  ): Promise<readonly WatcherEvent[]> {
    // Silences unused-variable lint while keeping real-impl references
    // visible via names.
    void this.chain;
    void this.address;
    void this.watcherKind;
    void this.priceClient;
    void this.confirmationDepth;
    void this.projectId;

    this.log.info('EVM watcher stub — no RPC configured');

    // ------------------------------------------------------------------
    // Intended shape (landing in §17.4 tasks 25–28):
    //
    //   const apiKey = process.env.ALCHEMY_API_KEY!;
    //   const alchemyUrl = ALCHEMY_BASE_URL[this.chain] + apiKey;
    //   const fromBlock =
    //     this.cursor.last_processed_height !== null
    //       ? `0x${(this.cursor.last_processed_height + 1).toString(16)}`
    //       : '0x0';
    //   const head = await getBlockNumber(alchemyUrl);          // eth_blockNumber
    //   const safeHead = head - this.confirmationDepth;
    //   const body = {
    //     jsonrpc: '2.0',
    //     id: 1,
    //     method: 'alchemy_getAssetTransfers',
    //     params: [
    //       {
    //         fromBlock,
    //         toBlock: `0x${safeHead.toString(16)}`,
    //         toAddress: this.address,
    //         category: ['external', 'erc20'],
    //         excludeZeroValue: true,
    //         order: 'asc',
    //         withMetadata: true,
    //       },
    //     ],
    //   };
    //   const res = await fetch(alchemyUrl, {
    //     method: 'POST',
    //     headers: { 'content-type': 'application/json' },
    //     body: JSON.stringify(body),
    //   });
    //   const json = await res.json();
    //   const transfers = json.result.transfers;
    //
    //   // Then map each transfer → WatcherEvent, pre-resolve USD via
    //   // this.priceClient.getPriceAtTime(...), and return ascending by
    //   // block height.
    // ------------------------------------------------------------------

    return [];
  }

  protected recordEvent(tx: Db, event: WatcherEvent): void {
    if (event.kind === 'donation') {
      recordDonation(tx, {
        project_id: event.project_id,
        chain: event.chain,
        asset: event.asset,
        tx_hash: event.tx_hash,
        block_height: event.block_height,
        block_timestamp: event.block_timestamp,
        source_address: event.source_address,
        amount_native: event.amount_native,
        amount_usd: event.amount_usd,
        price_source: event.price_source,
        verification_method: event.verification_method,
      });
    } else {
      recordMatchingContribution(tx, {
        chain: event.chain,
        asset: event.asset,
        tx_hash: event.tx_hash,
        block_height: event.block_height,
        block_timestamp: event.block_timestamp,
        source_address: event.source_address,
        amount_native: event.amount_native,
        amount_usd: event.amount_usd,
        price_source: event.price_source,
        verification_method: event.verification_method,
      });
    }
  }
}
