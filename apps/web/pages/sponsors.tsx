import { Layout } from '@/components/Layout';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useSnapshot } from '@/lib/snapshot';
import type { Sponsor } from '@tor/types';

type Tier = 'Anchor' | 'Supporter' | 'Contributor';

function tierFor(committed_usd: number): Tier {
  if (committed_usd >= 20000) return 'Anchor';
  if (committed_usd >= 10000) return 'Supporter';
  return 'Contributor';
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
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

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const tier = tierFor(sponsor.committed_usd);
  const initials = initialsFor(sponsor.name);
  const href = sponsor.outbound_url ?? '#';
  const isExternal = Boolean(sponsor.outbound_url);

  return (
    <a
      href={href}
      {...(isExternal ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
      className="group flex flex-col gap-3.5 p-5 rounded-[12px] bg-[var(--surface)] border border-ink-100 dark:border-ink-700 hover:border-purple-500/40 dark:hover:border-purple-300/40 hover:shadow-card transition-colors min-h-[180px]"
    >
      <div className="flex items-center justify-between">
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-ink-50 dark:bg-ink-900 font-display font-bold text-[15px] tracking-tight text-ink-500 dark:text-ink-400"
        >
          {initials}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-pill bg-purple-50 dark:bg-purple-900/40 text-purple-500 dark:text-purple-300 font-sans text-[10px] font-semibold tracking-[0.04em] uppercase">
          {tier}
        </span>
      </div>

      <div>
        <div className="font-sans text-[16px] font-bold tracking-tight text-ink-800 dark:text-ink-100">
          {sponsor.name}
        </div>
        <div className="mt-0.5 font-mono text-[12px] text-ink-500 dark:text-ink-400">
          ${sponsor.committed_usd.toLocaleString()} committed
        </div>
      </div>

      <div className="flex-1" />

      <div className="inline-flex items-center gap-1 font-sans text-[12px] font-semibold text-purple-500 dark:text-purple-300">
        Visit
        <ExternalIcon />
      </div>
    </a>
  );
}

export default function SponsorsPage() {
  const { snapshot } = useSnapshot();
  const sponsors = snapshot?.sponsors ?? [];
  const total = sponsors.reduce((a, s) => a + s.committed_usd, 0);

  return (
    <Layout
      title="Sponsors"
      description="Organizations committed to the Tor × FTC matching pool."
    >
      {/* Hero */}
      <section className="border-b border-ink-100 dark:border-ink-700">
        <div className="mx-auto max-w-7xl px-panel md:px-8 py-10 md:py-14">
          <div className="grid gap-10 md:gap-12 lg:grid-cols-[2fr_1fr] lg:items-end">
            <div>
              <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-ink-500 dark:text-ink-400 mb-2.5">
                Match sponsors
              </div>
              <h1 className="font-display font-bold text-[40px] sm:text-[48px] lg:text-[56px] leading-[1] tracking-[-0.04em] text-ink-800 dark:text-ink-100 [text-wrap:balance]">
                The pool that
                <br />
                multiplies every donation.
              </h1>
              <p className="mt-4 max-w-[620px] text-body-lg text-ink-500 dark:text-ink-400 [text-wrap:pretty]">
                Thank you to the organizations who committed matching funds.
                They enable every small donor to move the needle.
              </p>
            </div>

            <aside className="p-6 rounded-[14px] bg-pool-50 dark:bg-pool-900/20 border border-pool-500 dark:border-pool-300 text-right">
              <div className="font-sans text-[11px] font-semibold tracking-[0.08em] uppercase text-pool-500 dark:text-pool-300">
                Total committed
              </div>
              <AnimatedNumber
                value={total}
                className="block mt-1 font-display font-bold text-[40px] md:text-[48px] leading-none tracking-[-0.03em] text-ink-800 dark:text-ink-100"
              />
              <div className="mt-1 text-[13px] text-ink-500 dark:text-ink-400">
                across {sponsors.length} sponsor{sponsors.length === 1 ? '' : 's'}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Sponsor grid */}
      <section
        aria-label="Match sponsors"
        className="mx-auto max-w-7xl px-panel md:px-8 py-8 md:py-10"
      >
        {sponsors.length === 0 ? (
          <div className="rounded-card border border-dashed border-ink-100 dark:border-ink-700 p-8 text-center text-caption text-ink-500 dark:text-ink-400">
            Sponsors will appear here as the pool fills.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sponsors.map((s) => (
              <li key={s.name}>
                <SponsorCard sponsor={s} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Outreach */}
      <section className="mx-auto max-w-7xl px-panel md:px-8 pb-12">
        <div className="p-6 rounded-[14px] border-[1.5px] border-dashed border-ink-100 dark:border-ink-700 text-center text-[15px] text-ink-500 dark:text-ink-400">
          Want to sponsor a future round?{' '}
          <a
            href="https://www.torproject.org/"
            className="font-semibold text-purple-500 dark:text-purple-300 hover:text-purple-600"
          >
            Get in touch →
          </a>
        </div>
      </section>
    </Layout>
  );
}
