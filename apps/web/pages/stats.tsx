import { useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { ChainIcon, CHAIN_TICKERS } from '@/components/ChainIcon';
import { useSnapshot } from '@/lib/snapshot';
import { formatUsd } from '@/lib/format';
import { CHAIN_LABELS } from '@tor/types';
import type { Chain, RecentDonation } from '@tor/types';

// Rainbow palette mirrors design-reference ChainBreakdownChart —
// ordered by per-chain rank in the legend.
const RAINBOW_BG = [
  'bg-purple-500',
  'bg-pool-500',
  'bg-info',
  'bg-success',
  'bg-warning',
  'bg-danger',
] as const;

const RAINBOW_DOT = [
  'bg-purple-500',
  'bg-pool-500',
  'bg-info',
  'bg-success',
  'bg-warning',
  'bg-danger',
] as const;

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <div className="font-sans text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-500 dark:text-ink-400">
        {label}
      </div>
      <div className="mt-1 font-display font-bold text-[36px] md:text-[40px] leading-none tracking-[-0.03em] text-ink-800 dark:text-ink-100">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 1L12 3V7c0 3-2 5-5 6-3-1-5-3-5-6V3l5-2z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M5 7l1.5 1.5L9 6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3H3V11H11V8M8 3H11V6M11 3L6.5 7.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatTimeAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m ago` : `${h}h ago`;
}

interface AggregatedChain {
  chain: Chain;
  amount: number;
  count: number;
}

function aggregateByChain(
  donations: readonly RecentDonation[],
): AggregatedChain[] {
  const agg = new Map<Chain, { amount: number; count: number }>();
  for (const d of donations) {
    const cur = agg.get(d.chain) ?? { amount: 0, count: 0 };
    cur.amount += d.amount_usd;
    cur.count += 1;
    agg.set(d.chain, cur);
  }
  return Array.from(agg.entries())
    .map(([chain, v]) => ({ chain, ...v }))
    .sort((a, b) => b.amount - a.amount);
}

function downloadCsv(donations: readonly RecentDonation[]) {
  const rows = [
    ['chain', 'project_id', 'amount_usd', 'verification', 'minutes_ago'],
    ...donations.map((d) => [
      d.chain,
      d.project_id,
      String(d.amount_usd),
      d.verification_method,
      String(d.minutes_ago),
    ]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tor-qf-donations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StatsPage() {
  const { snapshot } = useSnapshot();

  const totals = snapshot?.totals;
  const projects = useMemo(
    () => snapshot?.projects ?? [],
    [snapshot?.projects],
  );
  const donations = useMemo(
    () => snapshot?.recent_donations ?? [],
    [snapshot?.recent_donations],
  );

  const [projectFilter, setProjectFilter] = useState('');
  const [chainFilter, setChainFilter] = useState<'' | Chain>('');

  const projectNameById = useMemo(
    () => new Map(projects.map((p) => [p.id, p.name])),
    [projects],
  );

  const filtered = useMemo(() => {
    const q = projectFilter.trim().toLowerCase();
    return donations.filter((d) => {
      const name = projectNameById.get(d.project_id) ?? d.project_id;
      if (q && !name.toLowerCase().includes(q)) return false;
      if (chainFilter && d.chain !== chainFilter) return false;
      return true;
    });
  }, [donations, projectFilter, chainFilter, projectNameById]);

  const byChain = useMemo(() => aggregateByChain(filtered), [filtered]);
  const filteredTotal = filtered.reduce((a, d) => a + d.amount_usd, 0);
  const chainsPresent = Array.from(new Set(donations.map((d) => d.chain)));
  const availableChains = chainsPresent.length > 0 ? chainsPresent : ([] as Chain[]);

  return (
    <Layout
      title="Stats"
      description="Full campaign transparency — every chain, every project."
    >
      {/* Hero */}
      <section className="border-b border-ink-100 dark:border-ink-700">
        <div className="mx-auto max-w-7xl px-panel md:px-8 py-10 md:py-14">
          <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-ink-500 dark:text-ink-400 mb-2.5">
            Full transparency
          </div>
          <h1 className="font-display font-bold text-[36px] sm:text-[42px] lg:text-[48px] leading-[1] tracking-[-0.04em] text-ink-800 dark:text-ink-100 [text-wrap:balance]">
            Every donation. On-chain, verifiable, exportable.
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
            <Stat
              label="Donations"
              value={totals?.donation_count ?? donations.length}
            />
            <Stat
              label="Total (USD)"
              value={formatUsd(totals?.total_donated_usd ?? filteredTotal)}
            />
            <Stat
              label="Chains live"
              value={chainsPresent.length}
            />
            <Stat label="Projects" value={projects.length} />
          </div>
        </div>
      </section>

      {/* By chain card */}
      <section className="mx-auto max-w-7xl px-panel md:px-8 pt-8 md:pt-10">
        <div className="p-6 rounded-[14px] bg-[var(--surface)] border border-ink-100 dark:border-ink-700">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="font-sans text-[16px] font-bold text-ink-800 dark:text-ink-100">
              By chain
            </h2>
            <span className="font-mono text-[11px] text-ink-500 dark:text-ink-400">
              {filtered.length.toLocaleString()} donation
              {filtered.length === 1 ? '' : 's'} · {formatUsd(filteredTotal)}
            </span>
          </div>

          {byChain.length === 0 || filteredTotal <= 0 ? (
            <div className="text-caption text-ink-500 dark:text-ink-400">
              No donations yet.
            </div>
          ) : (
            <>
              <div className="flex h-4 rounded-pill overflow-hidden bg-ink-50 dark:bg-ink-900">
                {byChain.map((c, i) => {
                  const pct = (c.amount / filteredTotal) * 100;
                  return (
                    <div
                      key={c.chain}
                      className={RAINBOW_BG[i % RAINBOW_BG.length]}
                      style={{ width: `${pct}%` }}
                      aria-label={`${CHAIN_LABELS[c.chain]}: ${pct.toFixed(
                        1,
                      )}%`}
                    />
                  );
                })}
              </div>
              <ul className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2">
                {byChain.map((c, i) => {
                  const pct = (c.amount / filteredTotal) * 100;
                  return (
                    <li
                      key={c.chain}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span
                        aria-hidden="true"
                        className={`inline-block w-2.5 h-2.5 rounded-[3px] ${
                          RAINBOW_DOT[i % RAINBOW_DOT.length]
                        }`}
                      />
                      <span className="font-sans text-[13px] text-ink-800 dark:text-ink-100">
                        {CHAIN_LABELS[c.chain]}
                      </span>
                      <span className="font-mono text-[12px] text-ink-500 dark:text-ink-400">
                        {formatUsd(c.amount)} · {pct.toFixed(0)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* Donations table */}
      <section
        aria-labelledby="donations-title"
        className="mx-auto max-w-7xl px-panel md:px-8 py-8 md:py-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2
            id="donations-title"
            className="font-sans text-[18px] font-bold text-ink-800 dark:text-ink-100"
          >
            Donations{' '}
            <span className="font-mono text-[13px] font-normal text-ink-500 dark:text-ink-400">
              ({filtered.length.toLocaleString()})
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Filter by project</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 dark:text-ink-400"
              >
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M9.5 9.5L12 12"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                placeholder="Filter by project…"
                className="pl-8 pr-3 h-10 w-64 rounded-card border border-ink-100 dark:border-ink-700 bg-[var(--surface)] text-[13px] text-ink-800 dark:text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-purple-500"
              />
            </label>
            <label>
              <span className="sr-only">Filter by chain</span>
              <select
                value={chainFilter}
                onChange={(e) => setChainFilter(e.target.value as '' | Chain)}
                className="h-10 px-3 rounded-card border border-ink-100 dark:border-ink-700 bg-[var(--surface)] text-[13px] text-ink-800 dark:text-ink-100 focus:outline-none focus:border-purple-500"
              >
                <option value="">All chains</option>
                {availableChains.map((c) => (
                  <option key={c} value={c}>
                    {CHAIN_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => downloadCsv(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-card border border-ink-100 dark:border-ink-700 bg-[var(--surface)] text-[13px] font-semibold text-ink-800 dark:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 2v7M3.5 6L7 9.5L10.5 6M2 12h10"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="rounded-[12px] border border-ink-100 dark:border-ink-700 bg-[var(--surface)] overflow-hidden">
          <div
            className="hidden md:grid px-4.5 py-3 bg-ink-50 dark:bg-ink-900 border-b border-ink-100 dark:border-ink-700 font-sans text-[11px] font-semibold tracking-[0.04em] uppercase text-ink-500 dark:text-ink-400"
            style={{
              gridTemplateColumns:
                '80px minmax(0,1fr) 120px 130px 120px 100px 40px',
              padding: '12px 18px',
            }}
          >
            <span>Chain</span>
            <span>Project</span>
            <span>Verification</span>
            <span>Tx hash</span>
            <span>Timestamp</span>
            <span className="text-right">Amount</span>
            <span />
          </div>

          {filtered.length === 0 ? (
            <div className="p-6 text-center text-caption text-ink-500 dark:text-ink-400">
              No donations match the current filters.
            </div>
          ) : (
            filtered.slice(0, 20).map((d, i) => {
              const name = projectNameById.get(d.project_id) ?? d.project_id;
              const isViewKey = d.verification_method === 'view_key';
              return (
                <div
                  key={`${d.chain}-${d.project_id}-${d.minutes_ago}-${i}`}
                  className={
                    'grid md:grid-cols-[80px_minmax(0,1fr)_120px_130px_120px_100px_40px] grid-cols-[1fr_auto] items-center px-4.5 py-3 text-[13px] text-ink-800 dark:text-ink-100 ' +
                    (i < Math.min(20, filtered.length) - 1
                      ? 'border-b border-ink-100 dark:border-ink-700'
                      : '')
                  }
                  style={{ padding: '12px 18px' }}
                >
                  <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-ink-500 dark:text-ink-400">
                    <ChainIcon chain={d.chain} size={14} />
                    {CHAIN_TICKERS[d.chain]}
                  </span>
                  <span className="truncate font-medium">{name}</span>
                  <span
                    className={
                      'hidden md:inline-flex items-center gap-1.5 text-[12px] ' +
                      (isViewKey ? 'text-info' : 'text-success')
                    }
                  >
                    {isViewKey ? <EyeIcon /> : <ShieldIcon />}
                    {isViewKey ? 'View-key' : 'On-chain'}
                  </span>
                  <span className="hidden md:inline-block font-mono text-[11px] text-ink-500 dark:text-ink-400 truncate">
                    —
                  </span>
                  <span className="hidden md:inline-block font-mono text-[11px] text-ink-500 dark:text-ink-400">
                    {formatTimeAgo(d.minutes_ago)}
                  </span>
                  <span className="text-right font-mono font-bold">
                    {formatUsd(d.amount_usd)}
                  </span>
                  <span className="hidden md:inline-block text-right text-ink-500 dark:text-ink-400">
                    <ExternalIcon />
                  </span>
                </div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-[13px] text-ink-500 dark:text-ink-400">
            <span>
              Showing {Math.min(20, filtered.length).toLocaleString()} of{' '}
              {filtered.length.toLocaleString()} · sorted by most recent
            </span>
          </div>
        )}
      </section>
    </Layout>
  );
}
