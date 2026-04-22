import type { GetStaticProps } from 'next';
import { Layout } from '@/components/Layout';
import { CampaignHero } from '@/components/CampaignHero';
import { TopProjectsGrid } from '@/components/TopProjectsGrid';
import { UpdatedChip } from '@/components/UpdatedChip';
import { useSnapshot } from '@/lib/snapshot';
import { loadCampaignConfig, type CampaignConfig } from '@/lib/projects-config';

interface LandingProps {
  campaign: CampaignConfig;
}

export const getStaticProps: GetStaticProps<LandingProps> = async () => {
  return { props: { campaign: loadCampaignConfig() } };
};

function daysBetween(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function formatDateRange(startIso: string, endIso: string): string {
  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const s = fmt.format(new Date(startIso));
  const e = fmt.format(new Date(endIso));
  const year = new Date(endIso).getUTCFullYear();
  return `${s} – ${e}, ${year}`;
}

const HOW_IT_WORKS = [
  {
    n: '01',
    t: 'You donate',
    d: 'Pick a project, choose a chain, send from your wallet.',
  },
  {
    n: '02',
    t: 'Community signals',
    d: 'QF counts donor breadth — ten $10 donors beat one $100.',
  },
  {
    n: '03',
    t: 'Pool pays out',
    d: 'At round end, the matching pool distributes by those signals.',
  },
] as const;

export default function Home({ campaign }: LandingProps) {
  const { snapshot, isStale, updatedAt } = useSnapshot();

  const now = new Date().toISOString();
  const totalDays = daysBetween(campaign.starts_at, campaign.ends_at);
  const daysRemaining = daysBetween(now, campaign.ends_at);
  const daysElapsed = daysBetween(campaign.starts_at, now);
  const dayNumber = Math.min(totalDays, Math.max(0, daysElapsed));

  const totals = snapshot?.totals;
  const pool = snapshot?.matching_pool;
  const projects = snapshot?.projects ?? [];
  const sponsors = snapshot?.sponsors ?? [];

  return (
    <Layout
      title="Home"
      description="31 days. 8 ways to give. Every donation to a Tor project gets matched from the community pool."
    >
      <CampaignHero
        totalRaisedUsd={totals?.total_donated_usd ?? 0}
        poolTotalUsd={pool?.total_usd ?? 0}
        uniqueDonors={totals?.unique_donors ?? 0}
        donationCount={totals?.donation_count ?? 0}
        sponsorCount={sponsors.length}
        projectCount={projects.length}
        daysRemaining={daysRemaining}
        totalDays={totalDays}
        dayNumber={dayNumber}
        dateRangeLabel={formatDateRange(campaign.starts_at, campaign.ends_at)}
      />

      <TopProjectsGrid projects={projects} limit={3} />

      <section
        aria-labelledby="how-it-works-title"
        className="mx-auto max-w-7xl px-panel md:px-8 pb-12"
      >
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2
              id="how-it-works-title"
              className="font-display text-h2 text-ink-800 dark:text-ink-100"
            >
              How it works
            </h2>
            <div className="grid gap-3.5 md:grid-cols-3 mt-5">
              {HOW_IT_WORKS.map((step) => (
                <div
                  key={step.n}
                  className="p-5 rounded-card bg-[var(--surface)] border border-ink-100 dark:border-ink-700"
                >
                  <div className="font-mono text-[12px] font-bold tracking-[0.06em] text-purple-500 dark:text-purple-300">
                    {step.n}
                  </div>
                  <div className="mt-1.5 font-sans text-[14px] font-bold text-ink-800 dark:text-ink-100">
                    {step.t}
                  </div>
                  <p className="mt-1 text-[13px] leading-[1.5] text-ink-500 dark:text-ink-400">
                    {step.d}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-h2 text-ink-800 dark:text-ink-100">
                Sponsors
              </h2>
              <UpdatedChip updatedAt={updatedAt} isStale={isStale} />
            </div>
            {sponsors.length === 0 ? (
              <div className="mt-5 rounded-card border border-dashed border-ink-100 dark:border-ink-700 p-5 text-caption text-ink-500 dark:text-ink-400">
                Sponsors announced at launch.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-px rounded-card overflow-hidden bg-ink-100 dark:bg-ink-700">
                {sponsors.map((s) => (
                  <div
                    key={s.name}
                    className="p-4 bg-[var(--surface)]"
                  >
                    <div className="font-sans text-[14px] font-semibold text-ink-800 dark:text-ink-100">
                      {s.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-500 dark:text-ink-400">
                      ${s.committed_usd.toLocaleString()} committed
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
