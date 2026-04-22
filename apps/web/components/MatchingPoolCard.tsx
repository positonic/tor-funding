import { Button } from './Button';
import { AnimatedNumber } from './AnimatedNumber';

/**
 * <MatchingPoolCard> — compact, always-orange summary with a CTA to
 * /matching-pool. Use anywhere outside the `/matching-pool` page itself
 * to promote the pool (landing hero sidebar, project sidebar, etc.).
 */
export interface MatchingPoolCardProps {
  totalUsd: number;
  sponsorCount: number;
}

export function MatchingPoolCard({ totalUsd, sponsorCount }: MatchingPoolCardProps) {
  return (
    <aside
      aria-labelledby="pool-card-title"
      className="rounded-panel p-panel md:p-panel-lg border border-pool-500 bg-pool-50 dark:bg-pool-900 dark:border-pool-300"
    >
      <div className="text-micro uppercase text-pool-700 dark:text-pool-300">Matching pool</div>
      <h3
        id="pool-card-title"
        className="font-display text-h3 text-ink-800 dark:text-ink-100 mt-1"
      >
        <AnimatedNumber value={totalUsd} />
      </h3>
      <p className="text-caption text-pool-700 dark:text-pool-300 mt-1">
        {sponsorCount} sponsor{sponsorCount === 1 ? '' : 's'} · multiplies every donor
      </p>
      <div className="mt-3">
        <Button as="a" href="/matching-pool/" kind="pool" fullWidth>
          Fund the pool
        </Button>
      </div>
    </aside>
  );
}
