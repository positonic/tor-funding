import { Layout } from '@/components/Layout';
import { MatchingPoolPanel } from '@/components/MatchingPoolPanel';
import { ChainBreakdown } from '@/components/ChainBreakdown';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { UpdatedChip } from '@/components/UpdatedChip';
import { useSnapshot } from '@/lib/snapshot';
import type { Chain } from '@tor/types';

export default function MatchingPoolPage() {
  const { snapshot, isStale, updatedAt } = useSnapshot();

  const pool = snapshot?.matching_pool;
  const addresses = pool?.addresses ?? {};
  const eligibleChains = Object.keys(addresses) as Chain[];
  const recent = snapshot?.recent_matching_contributions ?? [];

  return (
    <Layout
      title="Matching pool"
      description="Fund the pool that multiplies every donation to every Tor project."
    >
      <div className="mx-auto max-w-6xl px-panel py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-micro uppercase tracking-wide text-pool-700 dark:text-pool-300">
              Matching pool
            </div>
            <UpdatedChip updatedAt={updatedAt} isStale={isStale} />
          </div>
          <h1 className="font-display text-h1 text-ink-800 dark:text-ink-100 mt-2">
            Fund the matching pool
          </h1>
          {/* Verbatim from brief §11 — do not paraphrase. */}
          <p className="mt-3 text-body-lg text-ink-500 dark:text-ink-400 max-w-3xl">
            Donations to the matching pool are distributed across all
            participating projects based on community support. Your
            contribution multiplies the impact of every donor.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-[1fr_380px]">
          <div>
            {eligibleChains.length > 0 ? (
              <MatchingPoolPanel
                addresses={addresses}
                eligibleChains={eligibleChains}
              />
            ) : (
              <div className="rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)] p-panel text-body text-ink-500 dark:text-ink-400">
                Matching pool addresses are not available yet.
              </div>
            )}

            <section aria-labelledby="pool-recent-title" className="mt-8">
              <h2
                id="pool-recent-title"
                className="font-display text-h3 text-ink-800 dark:text-ink-100 mb-3"
              >
                Recent matching contributions
              </h2>
              {recent.length === 0 ? (
                <div className="text-caption text-ink-500 dark:text-ink-400">
                  No matching contributions yet.
                </div>
              ) : (
                <ul className="border-t border-ink-100 dark:border-ink-700">
                  {recent.slice(0, 8).map((c, idx) => (
                    <li
                      key={`${c.chain}-${c.minutes_ago}-${idx}`}
                      className="animate-feed-in flex items-center justify-between gap-3 py-2 border-b border-ink-100 dark:border-ink-700"
                    >
                      <div className="text-body text-ink-800 dark:text-ink-100">
                        {c.sponsor_name && (
                          <span className="font-medium mr-1">{c.sponsor_name}:</span>
                        )}
                        <span className="font-mono">${c.amount_usd.toLocaleString()}</span>{' '}
                        <span className="text-ink-500 dark:text-ink-400">via {c.chain}</span>
                      </div>
                      <div className="font-mono text-caption text-ink-500 dark:text-ink-400">
                        {c.minutes_ago}m ago
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <div className="p-panel rounded-panel border border-pool-500 bg-pool-50 dark:bg-pool-900 dark:border-pool-300">
              <div className="text-micro uppercase text-pool-700 dark:text-pool-300">
                Pool total
              </div>
              <AnimatedNumber
                value={pool?.total_usd ?? 0}
                className="block font-display text-h1 text-ink-800 dark:text-ink-100 mt-1"
              />
              <div className="text-caption text-pool-700 dark:text-pool-300 mt-1">
                splits across {snapshot?.projects.length ?? 0} projects
              </div>
            </div>

            <div className="p-panel rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)]">
              <ChainBreakdown
                byChain={pool?.by_chain ?? {}}
                title="Pool by chain"
                accent="pool"
              />
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
