import { AnimatedNumber } from './AnimatedNumber';
import { Button } from './Button';

/**
 * <CampaignHero> — the top of the landing page.
 *
 * Hero pitch is VERBATIM from brief §11 microcopy (negotiated with
 * comms — do not paraphrase).
 */
export interface CampaignHeroProps {
  totalRaisedUsd: number;
  poolTotalUsd: number;
  uniqueDonors: number;
  daysRemaining: number;
}

export function CampaignHero({
  totalRaisedUsd,
  poolTotalUsd,
  uniqueDonors,
  daysRemaining,
}: CampaignHeroProps) {
  return (
    <section className="border-b border-ink-100 dark:border-ink-700">
      <div className="mx-auto max-w-6xl px-panel py-8 md:py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-700 text-caption text-ink-500 dark:text-ink-400 mb-4">
          <span className="w-2 h-2 rounded-pill bg-success animate-pulse-slow" aria-hidden="true" />
          May 19 – Jun 19 · {daysRemaining} days remaining
        </div>

        {/* Verbatim from brief §11 — do not paraphrase. */}
        <h1 className="font-display text-h1 md:text-display-s text-ink-800 dark:text-ink-100 leading-tight">
          31 days. 8 ways to give. Every donation to a Tor project gets matched from the community pool.
        </h1>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl">
          <div className="p-panel rounded-card border border-ink-100 dark:border-ink-700 bg-[var(--surface)]">
            <div className="text-micro uppercase text-ink-500 dark:text-ink-400">Raised</div>
            <AnimatedNumber
              value={totalRaisedUsd}
              className="block font-display text-h2 md:text-h1 text-ink-800 dark:text-ink-100 mt-1"
            />
            <div className="font-mono text-caption text-ink-500 dark:text-ink-400 mt-1">
              {uniqueDonors.toLocaleString()} donors
            </div>
          </div>
          <div className="p-panel rounded-card border border-pool-500 bg-pool-50 dark:bg-pool-900 dark:border-pool-300">
            <div className="text-micro uppercase text-pool-700 dark:text-pool-300">Pool</div>
            <AnimatedNumber
              value={poolTotalUsd}
              className="block font-display text-h2 md:text-h1 text-ink-800 dark:text-ink-100 mt-1"
            />
            <div className="font-mono text-caption text-pool-700 dark:text-pool-300 mt-1">
              multiplies every donation
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
          <Button as="a" href="/projects/" kind="primary" fullWidth>
            Support a project →
          </Button>
          <Button as="a" href="/matching-pool/" kind="pool" fullWidth>
            Fund the pool →
          </Button>
        </div>
      </div>
    </section>
  );
}
