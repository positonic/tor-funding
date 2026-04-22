import { Layout } from '@/components/Layout';
import { ChainBreakdown } from '@/components/ChainBreakdown';
import { UpdatedChip } from '@/components/UpdatedChip';
import { useSnapshot } from '@/lib/snapshot';
import { formatUsd, formatUsdPrecise } from '@/lib/format';
import type { Chain } from '@tor/types';

export default function StatsPage() {
  const { snapshot, isStale, updatedAt } = useSnapshot();

  const totals = snapshot?.totals;
  const pool = snapshot?.matching_pool;
  const projects = snapshot?.projects ?? [];

  // Aggregate per-chain across all projects for a campaign-wide breakdown.
  const allByChain: Partial<Record<Chain, number>> = {};
  for (const p of projects) {
    for (const [c, usd] of Object.entries(p.by_chain) as [Chain, number | undefined][]) {
      if (typeof usd === 'number') {
        allByChain[c] = (allByChain[c] ?? 0) + usd;
      }
    }
  }

  return (
    <Layout title="Stats" description="Full campaign transparency — every chain, every project.">
      <div className="mx-auto max-w-6xl px-panel py-8">
        <header className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-h1 text-ink-800 dark:text-ink-100">
              Campaign stats
            </h1>
            <p className="mt-2 text-body text-ink-500 dark:text-ink-400">
              Full transparency — every chain, every project.
            </p>
          </div>
          <UpdatedChip updatedAt={updatedAt} isStale={isStale} />
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {/* TODO: the tracker will serve /stats.csv — currently the link
              404s. Pointing at it here so the UX is in place for launch. */}
          <a
            href="/stats.csv"
            className="inline-flex items-center px-3 py-2 rounded-card border border-ink-100 dark:border-ink-700 text-caption text-ink-800 dark:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-900"
            download
          >
            Download CSV
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {[
            { label: 'Total donated', value: totals?.total_donated_usd ?? 0 },
            { label: 'Pool total', value: pool?.total_usd ?? 0 },
            { label: 'Unique donors', value: totals?.unique_donors ?? 0, isCount: true },
            { label: 'Donation count', value: totals?.donation_count ?? 0, isCount: true },
          ].map((s) => (
            <div
              key={s.label}
              className="p-panel rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)]"
            >
              <div className="text-micro uppercase text-ink-500 dark:text-ink-400">
                {s.label}
              </div>
              <div className="font-display text-h2 text-ink-800 dark:text-ink-100 mt-1">
                {s.isCount ? s.value.toLocaleString() : formatUsd(s.value)}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="p-panel rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)]">
            <ChainBreakdown byChain={allByChain} title="Donations by chain" />
          </div>
          <div className="p-panel rounded-panel border border-pool-500 bg-pool-50 dark:bg-pool-900 dark:border-pool-300">
            <ChainBreakdown
              byChain={pool?.by_chain ?? {}}
              title="Pool by chain"
              accent="pool"
            />
          </div>
        </div>

        <section aria-labelledby="per-project-title">
          <h2
            id="per-project-title"
            className="font-display text-h3 text-ink-800 dark:text-ink-100 mb-3"
          >
            Per-project totals
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-body border-collapse">
              <thead>
                <tr className="text-left border-b border-ink-100 dark:border-ink-700">
                  <th className="py-2 pr-4 text-micro uppercase text-ink-500 dark:text-ink-400">Project</th>
                  <th className="py-2 px-4 text-right text-micro uppercase text-ink-500 dark:text-ink-400">Raised</th>
                  <th className="py-2 px-4 text-right text-micro uppercase text-ink-500 dark:text-ink-400">Donors</th>
                  <th className="py-2 pl-4 text-right text-micro uppercase text-ink-500 dark:text-ink-400">Projected match</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-ink-100 dark:border-ink-700"
                  >
                    <td className="py-2 pr-4 text-ink-800 dark:text-ink-100">{p.name}</td>
                    <td className="py-2 px-4 text-right font-mono text-ink-800 dark:text-ink-100">
                      {formatUsdPrecise(p.total_donated_usd)}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-ink-500 dark:text-ink-400">
                      {p.unique_donors.toLocaleString()}
                    </td>
                    <td className="py-2 pl-4 text-right font-mono text-purple-500 dark:text-purple-300">
                      +{formatUsdPrecise(p.projected_match_usd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}
