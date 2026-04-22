import type { RecentDonation, Project, Chain } from '@tor/types';
import { CHAIN_LABELS } from '@tor/types';
import { formatUsd } from '@/lib/format';

/**
 * <RecentFeed> — fixed-height list of recent donations, each line:
 *   "$X to [project] via [chain], Y min ago"
 *
 * Container has a fixed max-height + `overflow: hidden` so new entries
 * appearing after a snapshot refresh do NOT push the page layout —
 * critical per brief §7 and design-handoff "Recent-feed scroll".
 *
 * New entries get the `animate-feed-in` Tailwind keyframe (defined in
 * the tailwind config). Reduced-motion is honored globally via globals.css.
 */
export interface RecentFeedProps {
  donations: readonly RecentDonation[];
  projects: readonly Project[];
  /** If provided, filter to donations for this project_id only. */
  projectId?: string;
  /** Max items to render. */
  limit?: number;
  /** Fixed max-height so layout is stable. Tailwind class-compatible.  */
  className?: string;
}

function chainLabel(c: Chain): string {
  return CHAIN_LABELS[c] ?? c;
}

export function RecentFeed({
  donations,
  projects,
  projectId,
  limit = 8,
  className = '',
}: RecentFeedProps) {
  const projectNameById = new Map(projects.map((p) => [p.id, p.name]));
  const filtered = (projectId
    ? donations.filter((d) => d.project_id === projectId)
    : donations
  ).slice(0, limit);

  if (filtered.length === 0) {
    return (
      <div className={'text-caption text-ink-500 dark:text-ink-400 ' + className}>
        No donations yet — be the first.
      </div>
    );
  }

  return (
    <ul
      // Fixed height reserves vertical space so new entries don't shift
      // layout. Roughly 44px per row × default limit, clamped.
      className={
        'overflow-hidden border-t border-ink-100 dark:border-ink-700 ' + className
      }
      style={{ maxHeight: 44 * Math.min(limit, filtered.length) + 8 }}
    >
      {filtered.map((d, idx) => {
        const name =
          (d.project_id && projectNameById.get(d.project_id)) ?? d.project_id;
        return (
          <li
            // Key includes index so that when the snapshot updates with
            // a new list, the top entry mounts fresh and triggers the
            // feed-in animation.
            key={`${d.project_id}-${d.chain}-${d.minutes_ago}-${idx}`}
            className="animate-feed-in flex items-center justify-between gap-3 py-2 border-b border-ink-100 dark:border-ink-700"
          >
            <div className="min-w-0 text-body text-ink-800 dark:text-ink-100">
              <span className="font-mono">{formatUsd(d.amount_usd)}</span>{' '}
              to <span className="font-medium">{name}</span>{' '}
              <span className="text-ink-500 dark:text-ink-400">
                via {chainLabel(d.chain)}
              </span>
            </div>
            <div className="shrink-0 font-mono text-caption text-ink-500 dark:text-ink-400">
              {d.minutes_ago}m ago
            </div>
          </li>
        );
      })}
    </ul>
  );
}
