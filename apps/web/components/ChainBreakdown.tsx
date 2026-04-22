import type { Chain } from '@tor/types';
import { CHAIN_LABELS } from '@tor/types';
import { formatUsd } from '@/lib/format';

/**
 * <ChainBreakdown> — per-chain share of a given USD total.
 *
 * Desktop (md+): stacked horizontal bar segmented by chain.
 * Mobile: legend + percentages only (skip the donut per brief §5).
 *
 * Colors come from the Tailwind token palette — no hardcoded hex.
 */
export interface ChainBreakdownProps {
  /** Per-chain USD totals. Chains with $0 are filtered out. */
  byChain: Partial<Record<Chain, number>>;
  /** Optional label above the breakdown. */
  title?: string;
  /** When true, swap to the pool accent palette. */
  accent?: 'primary' | 'pool';
}

// Token-only per-chain swatches. We reuse the brand palette rather than
// inventing per-chain colors so we stay inside the design system — a
// cleaner per-chain icon set is a later pass (bead TODO).
const CHAIN_SWATCH_LIGHT: Record<Chain, string> = {
  btc:         'bg-purple-500',
  eth:         'bg-purple-400',
  'usdc-eth':  'bg-purple-300',
  'usdc-base': 'bg-purple-200',
  sol:         'bg-purple-600',
  zec_t:       'bg-purple-700',
  zec_z:       'bg-purple-800',
  xmr:         'bg-ink-800',
};

const CHAIN_SWATCH_POOL: Record<Chain, string> = {
  btc:         'bg-pool-500',
  eth:         'bg-pool-400',
  'usdc-eth':  'bg-pool-300',
  'usdc-base': 'bg-pool-200',
  sol:         'bg-pool-600',
  zec_t:       'bg-pool-700',
  zec_z:       'bg-pool-800',
  xmr:         'bg-ink-800',
};

export function ChainBreakdown({
  byChain,
  title,
  accent = 'primary',
}: ChainBreakdownProps) {
  const entries = (Object.entries(byChain) as [Chain, number][])
    .filter(([, usd]) => typeof usd === 'number' && usd > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  if (total <= 0) {
    return (
      <div className="text-caption text-ink-500 dark:text-ink-400">
        No per-chain data yet.
      </div>
    );
  }

  const swatches = accent === 'pool' ? CHAIN_SWATCH_POOL : CHAIN_SWATCH_LIGHT;

  return (
    <section aria-label={title ?? 'Chain breakdown'}>
      {title && (
        <h3 className="font-display text-h4 text-ink-800 dark:text-ink-100 mb-2">
          {title}
        </h3>
      )}

      {/* Stacked bar — desktop */}
      <div className="hidden md:flex h-3 rounded-pill overflow-hidden mb-3 border border-ink-100 dark:border-ink-700">
        {entries.map(([chain, usd]) => (
          <div
            key={chain}
            className={swatches[chain]}
            style={{ width: `${(usd / total) * 100}%` }}
            aria-label={`${CHAIN_LABELS[chain]} ${((usd / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Legend — both mobile + desktop */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
        {entries.map(([chain, usd]) => {
          const pct = (usd / total) * 100;
          return (
            <li
              key={chain}
              className="flex items-center justify-between gap-3 text-caption"
            >
              <span className="flex items-center gap-2 text-ink-800 dark:text-ink-100">
                <span
                  aria-hidden="true"
                  className={`inline-block w-2.5 h-2.5 rounded-pill ${swatches[chain]}`}
                />
                {CHAIN_LABELS[chain]}
              </span>
              <span className="font-mono text-ink-500 dark:text-ink-400">
                {formatUsd(usd)} · {pct.toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
