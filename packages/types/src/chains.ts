/**
 * Chain identifiers and per-chain metadata.
 *
 * `Chain` is intentionally an exact string-literal union — new chains
 * require a spec amendment, a config change, AND a tracker watcher, so
 * the type system should force us to handle the union exhaustively
 * everywhere (snapshot writer, QR code generator, TransparencyBadge).
 *
 * Naming notes:
 *  - `zec_t`  — Zcash transparent address (publicly verifiable).
 *  - `zec_z`  — Zcash shielded address (verified via view key).
 *  - `xmr`    — Monero (verified via view key).
 *  - `usdc-eth`, `usdc-base` — USDC treated as a separate "chain" for UI
 *    purposes so the donation panel can surface correct deep links and
 *    ticker/label pairs. The tracker still indexes via the underlying EVM.
 */
export type Chain =
  | 'btc'
  | 'eth'
  | 'usdc-eth'
  | 'usdc-base'
  | 'sol'
  | 'zec_t'
  | 'zec_z'
  | 'xmr';

/**
 * All known chains in the order the UI should consider as "default" for
 * tab rendering. Consumers that need a different order should sort by
 * something project-specific (e.g. matching-eligible first).
 */
export const CHAINS = [
  'btc',
  'eth',
  'usdc-eth',
  'usdc-base',
  'sol',
  'zec_t',
  'zec_z',
  'xmr',
] as const satisfies readonly Chain[];

/** Human-readable display labels for each chain. */
export const CHAIN_LABELS: Readonly<Record<Chain, string>> = {
  btc: 'Bitcoin',
  eth: 'Ethereum',
  'usdc-eth': 'USDC (Ethereum)',
  'usdc-base': 'USDC (Base)',
  sol: 'Solana',
  zec_t: 'Zcash (transparent)',
  zec_z: 'Zcash (shielded)',
  xmr: 'Monero',
};

/**
 * Verification model per chain — consumed by `<TransparencyBadge>` and
 * drives the cooperative-transparency copy (spec §6, §10).
 *
 *  - `public`   — on-chain transfers to the receiving address are directly
 *                 verifiable by anyone; no secret material on the tracker.
 *  - `view_key` — tracker scans with a read-only view key; donors see a
 *                 "view-key verified" badge instead of a block explorer link.
 */
export const CHAIN_VERIFICATION: Readonly<
  Record<Chain, 'public' | 'view_key'>
> = {
  btc: 'public',
  eth: 'public',
  'usdc-eth': 'public',
  'usdc-base': 'public',
  sol: 'public',
  zec_t: 'public',
  zec_z: 'view_key',
  xmr: 'view_key',
};
