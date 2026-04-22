import type { KeyboardEvent } from 'react';
import type { Chain } from '@tor/types';
import { CHAIN_LABELS } from '@tor/types';

/**
 * Chain selector tab. Renders inside a `role="tablist"` container in
 * <DonationPanel>. Ticker + currency glyph + 44px-min tap target.
 *
 * TODO: replace the inline ticker glyphs with proper per-chain icons
 * (BTC Unicode ₿, Ethereum diamond, etc.) once we have the SVG assets
 * from the brand kit. Until then the ticker text + an accent-colored
 * circle is legible enough to ship.
 */
export interface ChainTabProps {
  chain: Chain;
  selected: boolean;
  accent?: 'primary' | 'pool';
  onSelect: () => void;
  label?: string;
  ticker?: string;
}

/** Short tickers used on the tab chip itself. */
const TICKERS: Record<Chain, string> = {
  btc: 'BTC',
  eth: 'ETH',
  'usdc-eth': 'USDC',
  'usdc-base': 'USDC',
  sol: 'SOL',
  zec_t: 'ZEC-t',
  zec_z: 'ZEC-z',
  xmr: 'XMR',
};

export function ChainTab({
  chain,
  selected,
  accent = 'primary',
  onSelect,
  label,
  ticker,
}: ChainTabProps) {
  const resolvedTicker = ticker ?? TICKERS[chain];
  const resolvedLabel = label ?? CHAIN_LABELS[chain];

  const selectedAccent =
    accent === 'pool'
      ? 'bg-pool-50 border-pool-500 text-pool-700 dark:bg-pool-900 dark:border-pool-300 dark:text-pool-300'
      : 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-300 dark:text-purple-300';

  const unselected =
    'bg-transparent border-ink-100 dark:border-ink-700 text-ink-800 dark:text-ink-100 ' +
    'hover:bg-ink-50 dark:hover:bg-ink-900';

  function handleKey(e: KeyboardEvent<HTMLButtonElement>) {
    // Arrow-key cycling is delegated to the parent tablist via keyboard
    // focus traversal — this handler just catches Enter/Space to make
    // activation explicit for screen-reader users.
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={resolvedLabel}
      onClick={onSelect}
      onKeyDown={handleKey}
      tabIndex={selected ? 0 : -1}
      className={
        'shrink-0 snap-start inline-flex items-center gap-2 px-3 py-2 rounded-pill border ' +
        'text-caption font-mono transition-colors min-h-touch min-w-touch ' +
        (selected ? selectedAccent : unselected)
      }
    >
      <span
        aria-hidden="true"
        className={
          'inline-block w-5 h-5 rounded-pill border ' +
          (selected
            ? accent === 'pool'
              ? 'bg-pool-500 border-pool-500'
              : 'bg-purple-500 border-purple-500'
            : 'bg-ink-100 dark:bg-ink-700 border-transparent')
        }
      />
      <span className="font-mono text-caption">{resolvedTicker}</span>
    </button>
  );
}
