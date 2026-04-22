/**
 * CoinGecko historical price fetcher with 5-min-rounded cache (§17.3
 * task 14).
 *
 * Behavior:
 *  - Callers ask for the USD price of `(chain, asset)` at a UNIX-second
 *    timestamp. We round to the nearest 5-minute bucket and look in the
 *    `price_snapshots` table first. Cache hit → return.
 *  - On miss, we hit CoinGecko's `/coins/{id}/history` endpoint (or the
 *    `/simple/price` endpoint for current prices if the historical call
 *    fails — spec allows fallback to current price).
 *  - Result is written to `price_snapshots` and returned.
 *
 * Rate-limit awareness:
 *  - The free tier is ~5–15 req/min. We naturally stay under that
 *    because most lookups hit the cache. If we start seeing 429s we can
 *    layer a simple token bucket here without changing callers.
 *
 * No API key is required on the free tier — `COINGECKO_API_KEY` is
 * optional and used only to hit the pro endpoint where available.
 *
 * Uses `undici.fetch`.
 */

import { and, eq } from 'drizzle-orm';
import { fetch } from 'undici';

import type { Db } from '../db/client.js';
import { price_snapshots } from '../db/schema.js';
import { logger } from '../logger.js';

/** Floors a UNIX-second timestamp to the nearest 5-minute bucket. */
export function fiveMinBucket(unixSeconds: number): number {
  const bucketSize = 300;
  return Math.floor(unixSeconds / bucketSize) * bucketSize;
}

export interface PriceResult {
  readonly priceUsd: number;
  readonly source: string;
}

/**
 * Maps `(chain, asset)` to CoinGecko's coin id. Small hand-maintained
 * table — we only support a known set of assets by spec §9.
 */
const COINGECKO_IDS: Readonly<Record<string, string>> = {
  'btc:BTC': 'bitcoin',
  'eth:ETH': 'ethereum',
  'arb:ETH': 'ethereum',
  'op:ETH': 'ethereum',
  'base:ETH': 'ethereum',
  'eth:USDC': 'usd-coin',
  'arb:USDC': 'usd-coin',
  'base:USDC': 'usd-coin',
  'op:USDC': 'usd-coin',
  'eth:USDT': 'tether',
  'sol:SOL': 'solana',
  'sol:USDC': 'usd-coin',
  'zec_t:ZEC': 'zcash',
  'zec_z:ZEC': 'zcash',
  'xmr:XMR': 'monero',
};

function coinId(chain: string, asset: string): string | null {
  return COINGECKO_IDS[`${chain}:${asset}`] ?? null;
}

export interface CoinGeckoClientOptions {
  readonly apiKey?: string | undefined;
  readonly baseUrl?: string;
}

export class CoinGeckoClient {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;

  constructor(opts: CoinGeckoClientOptions = {}) {
    this.apiKey = opts.apiKey ?? process.env.COINGECKO_API_KEY;
    this.baseUrl = opts.baseUrl ?? 'https://api.coingecko.com/api/v3';
  }

  /**
   * Fetch (and cache) the USD price of `(chain, asset)` at a given UNIX
   * timestamp in seconds. Returns the cached value if already known.
   */
  async getPriceAtTime(
    db: Db,
    chain: string,
    asset: string,
    timestampSeconds: number
  ): Promise<PriceResult> {
    const bucket = fiveMinBucket(timestampSeconds);

    const cached = db
      .select()
      .from(price_snapshots)
      .where(
        and(
          eq(price_snapshots.chain, chain),
          eq(price_snapshots.asset, asset),
          eq(price_snapshots.timestamp_bucket, bucket)
        )
      )
      .all();
    const hit = cached[0];
    if (hit !== undefined) {
      return { priceUsd: hit.price_usd, source: hit.source };
    }

    const id = coinId(chain, asset);
    if (id === null) {
      throw new Error(
        `no CoinGecko id mapping for ${chain}:${asset} — add to COINGECKO_IDS`
      );
    }

    const result = await this.fetchFromCoinGecko(id, bucket);

    db.insert(price_snapshots)
      .values({
        chain,
        asset,
        timestamp_bucket: bucket,
        price_usd: result.priceUsd,
        source: result.source,
      })
      .onConflictDoNothing()
      .run();

    return result;
  }

  private async fetchFromCoinGecko(
    id: string,
    bucketSeconds: number
  ): Promise<PriceResult> {
    // CoinGecko historical endpoint wants DD-MM-YYYY.
    const d = new Date(bucketSeconds * 1000);
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    const dateParam = `${dd}-${mm}-${yyyy}`;

    const headers: Record<string, string> = { accept: 'application/json' };
    if (this.apiKey !== undefined && this.apiKey !== '') {
      headers['x-cg-demo-api-key'] = this.apiKey;
    }

    const histUrl = `${this.baseUrl}/coins/${id}/history?date=${dateParam}&localization=false`;
    try {
      const res = await fetch(histUrl, { headers });
      if (res.ok) {
        const body = (await res.json()) as {
          market_data?: { current_price?: { usd?: number } };
        };
        const price = body.market_data?.current_price?.usd;
        if (typeof price === 'number' && Number.isFinite(price)) {
          return { priceUsd: price, source: 'coingecko:history' };
        }
      } else {
        logger.warn(
          { id, status: res.status },
          'coingecko history call non-OK; falling back to current price'
        );
      }
    } catch (err) {
      logger.warn(
        { id, err: (err as Error).message },
        'coingecko history call errored; falling back to current price'
      );
    }

    // Fallback: current price (spec §12.5 / §9 allow this when history
    // is unavailable).
    const curUrl = `${this.baseUrl}/simple/price?ids=${id}&vs_currencies=usd`;
    const res = await fetch(curUrl, { headers });
    if (!res.ok) {
      throw new Error(
        `coingecko current-price call failed: ${res.status} ${res.statusText}`
      );
    }
    const body = (await res.json()) as Record<string, { usd?: number }>;
    const cur = body[id]?.usd;
    if (typeof cur !== 'number' || !Number.isFinite(cur)) {
      throw new Error(`coingecko returned no USD price for ${id}`);
    }
    return { priceUsd: cur, source: 'coingecko:current' };
  }
}
