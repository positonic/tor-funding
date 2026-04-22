import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@tor/types';
import { formatUsd } from '@/lib/format';

/**
 * <Leaderboard> — mobile: ranked list with inline bar fill; desktop:
 * same pattern (CSS `width:` on a div). No chart library per brief §7.
 *
 * Bars animate width to new values over 800ms ease-out (Tailwind
 * `transition-[width] duration-700` is close enough; reduced-motion
 * honored globally via globals.css which zeroes transitions).
 */
type Sort = 'raised' | 'projected' | 'name';

export interface LeaderboardProps {
  projects: readonly Project[];
  /** Render at most this many rows. Landing page passes 3. */
  limit?: number;
  /** Hide the sort toggle (used on landing where we only want top-3). */
  hideSort?: boolean;
}

function sortProjects(projects: readonly Project[], mode: Sort): Project[] {
  const copy = [...projects];
  switch (mode) {
    case 'raised':
      return copy.sort((a, b) => b.total_donated_usd - a.total_donated_usd);
    case 'projected':
      return copy.sort((a, b) => b.projected_match_usd - a.projected_match_usd);
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function Leaderboard({ projects, limit, hideSort }: LeaderboardProps) {
  const [sort, setSort] = useState<Sort>('raised');

  const ordered = useMemo(() => {
    const s = sortProjects(projects, sort);
    return limit ? s.slice(0, limit) : s;
  }, [projects, sort, limit]);

  const maxTotal = useMemo(
    () =>
      Math.max(
        1,
        ...projects.map((p) => p.total_donated_usd + p.projected_match_usd),
      ),
    [projects],
  );

  return (
    <section aria-labelledby="leaderboard-title" className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <h2
          id="leaderboard-title"
          className="font-display text-h3 text-ink-800 dark:text-ink-100"
        >
          Leaderboard
        </h2>
        {!hideSort && (
          <div role="radiogroup" aria-label="Sort leaderboard" className="flex gap-1">
            {(['raised', 'projected', 'name'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={sort === m}
                onClick={() => setSort(m)}
                className={
                  'px-3 py-1 rounded-pill text-caption border transition-colors ' +
                  (sort === m
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'bg-transparent border-ink-100 dark:border-ink-700 text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100')
                }
              >
                {m === 'raised' ? 'Raised' : m === 'projected' ? 'Projected match' : 'Name'}
              </button>
            ))}
          </div>
        )}
      </div>

      <ol className="border-t border-ink-100 dark:border-ink-700">
        {ordered.map((p, idx) => {
          const total = p.total_donated_usd + p.projected_match_usd;
          const pct = Math.max(6, (total / maxTotal) * 100);
          const donatedPct =
            total > 0 ? (p.total_donated_usd / total) * 100 : 0;
          return (
            <li
              key={p.id}
              className="border-b border-ink-100 dark:border-ink-700"
            >
              <Link
                href={`/projects/${p.id}/`}
                className="grid grid-cols-[24px_1fr_auto] gap-3 items-center py-3"
              >
                <span className="font-mono text-caption text-ink-500 dark:text-ink-400">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-body text-ink-800 dark:text-ink-100">
                    {p.name}
                  </div>
                  <div
                    className="relative h-1.5 rounded-pill bg-ink-100 dark:bg-ink-700 mt-2 overflow-hidden transition-[width] duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-ink-800 dark:bg-ink-100"
                      style={{ width: `${donatedPct}%` }}
                    />
                    <div
                      className="absolute inset-y-0 right-0 bg-purple-500"
                      style={{ left: `${donatedPct}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-caption text-ink-800 dark:text-ink-100">
                    {formatUsd(p.total_donated_usd)}
                  </div>
                  <div className="font-mono text-micro text-purple-500 dark:text-purple-300">
                    +{formatUsd(p.projected_match_usd)}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
