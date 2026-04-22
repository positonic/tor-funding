/**
 * USD / number formatters. Kept here so components don't reach for
 * `Intl.NumberFormat` inline (consistent locale-less USD rendering
 * across the app).
 */

const usdWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const usdPrecise = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** `$1,234` — for hero counters and cards where cents would be noise. */
export function formatUsd(n: number): string {
  return usdWhole.format(Math.round(n));
}

/** `$1,234.56` — when cents matter (per-donation displays, totals). */
export function formatUsdPrecise(n: number): string {
  return usdPrecise.format(n);
}

/** `$1.2K` — for inline bar labels and tight leaderboard rows. */
export function formatCompact(n: number): string {
  return compact.format(n);
}
