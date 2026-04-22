import { Layout } from '@/components/Layout';
import { useSnapshot } from '@/lib/snapshot';
import { formatUsd } from '@/lib/format';

export default function SponsorsPage() {
  const { snapshot } = useSnapshot();
  const sponsors = snapshot?.sponsors ?? [];

  return (
    <Layout
      title="Sponsors"
      description="Organizations committed to the Tor × FTC matching pool."
    >
      <div className="mx-auto max-w-6xl px-panel py-8">
        <h1 className="font-display text-h1 text-ink-800 dark:text-ink-100">
          Match sponsors
        </h1>
        <p className="mt-2 text-body-lg text-ink-500 dark:text-ink-400 max-w-3xl">
          These organizations fund the matching pool that multiplies every
          donation across the round.
        </p>

        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {sponsors.length === 0 ? (
            <li className="text-caption text-ink-500 dark:text-ink-400">
              Sponsors will appear here as the pool fills.
            </li>
          ) : (
            sponsors.map((s) => (
              <li
                key={s.name}
                className="p-panel rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)] flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-display text-h4 text-ink-800 dark:text-ink-100">
                    {s.name}
                  </div>
                  {s.outbound_url && (
                    <a
                      href={s.outbound_url}
                      rel="noopener noreferrer"
                      className="text-caption text-purple-500 dark:text-purple-300"
                    >
                      {s.outbound_url}
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-micro uppercase text-ink-500 dark:text-ink-400">
                    Committed
                  </div>
                  <div className="font-mono text-body-lg text-ink-800 dark:text-ink-100">
                    {formatUsd(s.committed_usd)}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </Layout>
  );
}
