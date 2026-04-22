import type { GetStaticProps } from 'next';
import { Layout } from '@/components/Layout';
import { CampaignHero } from '@/components/CampaignHero';
import { Leaderboard } from '@/components/Leaderboard';
import { SponsorStrip } from '@/components/SponsorStrip';
import { MatchingPoolCard } from '@/components/MatchingPoolCard';
import { RecentFeed } from '@/components/RecentFeed';
import { UpdatedChip } from '@/components/UpdatedChip';
import { useSnapshot } from '@/lib/snapshot';
import { loadCampaignConfig, type CampaignConfig } from '@/lib/projects-config';

interface LandingProps {
  campaign: CampaignConfig;
}

export const getStaticProps: GetStaticProps<LandingProps> = async () => {
  // TODO: also bake build-time copy for the hero (brief §11) into props.
  return { props: { campaign: loadCampaignConfig() } };
};

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function Home({ campaign }: LandingProps) {
  const { snapshot, isStale, updatedAt } = useSnapshot();

  const daysRemaining = daysBetween(new Date().toISOString(), campaign.ends_at);

  const totals = snapshot?.totals;
  const pool = snapshot?.matching_pool;
  const projects = snapshot?.projects ?? [];
  const sponsors = snapshot?.sponsors ?? [];
  const recent = snapshot?.recent_donations ?? [];

  return (
    <Layout
      title="Home"
      description="31 days. 8 ways to give. Every donation to a Tor project gets matched from the community pool."
    >
      <CampaignHero
        totalRaisedUsd={totals?.total_donated_usd ?? 0}
        poolTotalUsd={pool?.total_usd ?? 0}
        uniqueDonors={totals?.unique_donors ?? 0}
        daysRemaining={daysRemaining}
      />

      <div className="mx-auto max-w-6xl px-panel py-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div />
            <UpdatedChip updatedAt={updatedAt} isStale={isStale} />
          </div>
          <Leaderboard projects={projects} limit={3} hideSort />

          <section aria-labelledby="how-it-works-title" className="mt-10">
            <h2
              id="how-it-works-title"
              className="font-display text-h2 text-ink-800 dark:text-ink-100 mb-4"
            >
              How it works
            </h2>
            <ol className="grid gap-4 md:grid-cols-3">
              {[
                {
                  t: '1. Pick a project',
                  b: 'Browse the Tor teams participating in this round.',
                },
                {
                  t: '2. Donate in any supported chain',
                  b: 'BTC, ETH, SOL, ZEC, XMR, USDC — no account needed.',
                },
                {
                  t: '3. See it multiplied',
                  b: 'The matching pool boosts every donation at round close.',
                },
              ].map((step) => (
                <li
                  key={step.t}
                  className="p-panel rounded-card border border-ink-100 dark:border-ink-700 bg-[var(--surface)]"
                >
                  <div className="font-display text-h4 text-ink-800 dark:text-ink-100">
                    {step.t}
                  </div>
                  <p className="mt-2 text-caption text-ink-500 dark:text-ink-400">
                    {step.b}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="recent-title" className="mt-10">
            <h2
              id="recent-title"
              className="font-display text-h3 text-ink-800 dark:text-ink-100 mb-3"
            >
              Recent donations
            </h2>
            <RecentFeed donations={recent} projects={projects} limit={6} />
          </section>
        </div>

        <aside className="space-y-4">
          <MatchingPoolCard
            totalUsd={pool?.total_usd ?? 0}
            sponsorCount={sponsors.length}
          />
          <SponsorStrip sponsors={sponsors} />
        </aside>
      </div>
    </Layout>
  );
}
