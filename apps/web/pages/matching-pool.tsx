import { Layout } from '@/components/Layout';
import { MatchingPoolPanel } from '@/components/MatchingPoolPanel';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { ChainIcon } from '@/components/ChainIcon';
import { useSnapshot } from '@/lib/snapshot';
import { formatUsd } from '@/lib/format';
import { CHAIN_LABELS } from '@tor/types';
import type { Chain, RecentMatchingContribution } from '@tor/types';

function PoolByChain({
  byChain,
  total,
}: {
  byChain: Partial<Record<Chain, number>>;
  total: number;
}) {
  const entries = (Object.entries(byChain) as [Chain, number][])
    .filter(([, usd]) => usd > 0)
    .sort((a, b) => b[1] - a[1]);

  if (total <= 0 || entries.length === 0) {
    return (
      <div className="text-caption text-ink-500 dark:text-ink-400">
        No per-chain data yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {entries.map(([chain, amt]) => {
        const pct = (amt / total) * 100;
        return (
          <div key={chain}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-2.5 text-[14px] font-medium text-ink-800 dark:text-ink-100">
                <span className="text-ink-500 dark:text-ink-400">
                  <ChainIcon chain={chain} size={18} />
                </span>
                {CHAIN_LABELS[chain]}
              </span>
              <span className="font-mono text-[13px] text-ink-500 dark:text-ink-400">
                {formatUsd(amt)}{' '}
                <span className="opacity-60">· {pct.toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-2 rounded-pill bg-ink-50 dark:bg-ink-900 overflow-hidden">
              <div
                className="h-full bg-pool-500 dark:bg-pool-300 rounded-pill"
                style={{ width: `${pct}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatVerification(v: 'public' | 'view_key'): string {
  return v === 'view_key' ? 'view-key verified' : 'on-chain';
}

function RecentPoolContributions({
  items,
}: {
  items: readonly RecentMatchingContribution[];
}) {
  if (items.length === 0) {
    return (
      <div className="text-caption text-ink-500 dark:text-ink-400">
        No pool contributions yet.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-ink-100 dark:divide-ink-700">
      {items.slice(0, 8).map((c, i) => (
        <li
          key={`${c.chain}-${c.minutes_ago}-${i}`}
          className="flex items-center gap-4 py-3 animate-feed-in"
        >
          <span className="shrink-0 text-ink-500 dark:text-ink-400">
            <ChainIcon chain={c.chain} size={20} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px]">
              <span className="font-mono font-bold text-pool-500 dark:text-pool-300">
                {formatUsd(c.amount_usd)}
              </span>
              <span className="text-ink-800 dark:text-ink-100">
                {' '}
                · {c.sponsor_name ?? 'Matching pool'}
              </span>
            </div>
            <div className="mt-0.5 text-[12px] text-ink-500 dark:text-ink-400">
              via {CHAIN_LABELS[c.chain]} · {formatVerification(c.verification_method)}
            </div>
          </div>
          <div className="shrink-0 font-mono text-[12px] text-ink-500 dark:text-ink-400">
            {c.minutes_ago}m
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function MatchingPoolPage() {
  const { snapshot } = useSnapshot();

  const pool = snapshot?.matching_pool;
  const addresses = pool?.addresses ?? {};
  const eligibleChains = Object.keys(addresses) as Chain[];
  const projectCount = snapshot?.projects.length ?? 0;
  const sponsorCount = snapshot?.sponsors.length ?? 0;
  const poolByChain = pool?.by_chain ?? {};
  const recent = snapshot?.recent_matching_contributions ?? [];

  return (
    <Layout
      title="Matching pool"
      description="Fund the pool that multiplies every donation to every Tor project."
    >
      {/* Hero band — pool accent */}
      <section className="relative bg-pool-50 dark:bg-pool-900/20 border-b-2 border-dashed border-pool-500 dark:border-pool-300">
        <div className="mx-auto max-w-7xl px-panel md:px-8 py-10 md:py-14">
          <div className="grid gap-10 md:gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-pill bg-pool-500 text-white text-[12px] font-semibold tracking-tight">
                  Pool
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-pill border border-pool-500 text-pool-700 dark:text-pool-300 text-[12px] font-medium">
                  Splits across all {projectCount} projects
                </span>
              </div>

              <h1 className="font-display font-bold text-[40px] sm:text-[48px] lg:text-[56px] leading-[1] tracking-[-0.03em] text-ink-800 dark:text-ink-100 [text-wrap:balance]">
                Fund the matching pool
              </h1>

              {/* Verbatim from brief §11 — do not paraphrase. */}
              <p className="mt-4 max-w-[620px] text-body-lg text-ink-800 dark:text-ink-100 [text-wrap:pretty]">
                Donations to the matching pool are distributed across all
                participating projects based on community support. Your
                contribution multiplies the impact of every donor.
              </p>
            </div>

            <aside
              className="p-6 md:p-7 rounded-[14px] bg-[var(--surface)] border border-pool-500 dark:border-pool-300 shadow-[0_0_0_3px_rgba(255,233,204,0.8)] dark:shadow-[0_0_0_3px_rgba(58,36,17,0.6)]"
            >
              <div className="font-sans text-[11px] font-semibold tracking-[0.08em] uppercase text-pool-500 dark:text-pool-300">
                Pool total
              </div>
              <AnimatedNumber
                value={pool?.total_usd ?? 0}
                className="block mt-1 font-display font-bold text-[46px] md:text-[54px] leading-none tracking-[-0.03em] text-ink-800 dark:text-ink-100"
              />
              <div className="mt-2 text-[13px] text-ink-500 dark:text-ink-400">
                Committed by {sponsorCount} sponsor{sponsorCount === 1 ? '' : 's'}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-panel md:px-8 py-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_460px] items-start">
          <div className="flex flex-col gap-5">
            <section
              aria-labelledby="pool-by-chain-title"
              className="p-6 rounded-[14px] bg-[var(--surface)] border border-ink-100 dark:border-ink-700"
            >
              <h2
                id="pool-by-chain-title"
                className="font-sans text-[16px] font-bold text-ink-800 dark:text-ink-100 mb-4"
              >
                Pool by chain
              </h2>
              <PoolByChain
                byChain={poolByChain}
                total={pool?.total_usd ?? 0}
              />
            </section>

            <section
              aria-labelledby="pool-recent-title"
              className="p-6 rounded-[14px] bg-[var(--surface)] border border-ink-100 dark:border-ink-700"
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="pool-recent-title"
                  className="font-sans text-[16px] font-bold text-ink-800 dark:text-ink-100"
                >
                  Recent pool contributions
                </h2>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-500 dark:text-ink-400">
                  <span
                    className="w-1.5 h-1.5 rounded-pill bg-pool-500 dark:bg-pool-300 animate-pulse-slow"
                    aria-hidden="true"
                  />
                  Live
                </span>
              </div>
              <RecentPoolContributions items={recent} />
            </section>
          </div>

          <div className="lg:sticky lg:top-4">
            {eligibleChains.length > 0 ? (
              <MatchingPoolPanel
                addresses={addresses}
                eligibleChains={eligibleChains}
              />
            ) : (
              <div className="rounded-[14px] border border-ink-100 dark:border-ink-700 bg-[var(--surface)] p-6 text-body text-ink-500 dark:text-ink-400">
                Matching pool addresses are not available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
