import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@tor/types';
import { formatUsd } from '@/lib/format';
import { Button } from './Button';

/**
 * <ProjectGrid> — responsive card grid. Sort toggle mirrors <Leaderboard>.
 *
 * FLIP animation on re-sort is deliberately NOT implemented in v1 — the
 * static grid reorders without animation. Reduced-motion users get the
 * correct behavior for free; motion-tolerant users see a brief flash on
 * sort change which is acceptable. (Bead TODO: FLIP pass.)
 */
type Sort = 'raised' | 'projected' | 'name';

export interface ProjectGridProps {
  projects: readonly Project[];
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

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [sort, setSort] = useState<Sort>('raised');
  const ordered = useMemo(() => sortProjects(projects, sort), [projects, sort]);

  return (
    <section aria-labelledby="project-grid-title">
      <div className="flex flex-wrap items-baseline gap-3 justify-between mb-4">
        <h2
          id="project-grid-title"
          className="font-display text-h2 text-ink-800 dark:text-ink-100"
        >
          Projects
        </h2>
        <div role="radiogroup" aria-label="Sort projects" className="flex gap-1">
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
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ordered.map((p) => (
          <li key={p.id}>
            <article className="h-full flex flex-col rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)] p-panel">
              <Link
                href={`/projects/${p.id}/`}
                className="font-display text-h3 text-ink-800 dark:text-ink-100 hover:text-purple-500 dark:hover:text-purple-300"
              >
                {p.name}
              </Link>
              <p className="mt-2 text-body text-ink-500 dark:text-ink-400">
                {p.short_desc}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-micro uppercase text-ink-500 dark:text-ink-400">
                    Raised
                  </div>
                  <div className="font-mono text-body-lg text-ink-800 dark:text-ink-100">
                    {formatUsd(p.total_donated_usd)}
                  </div>
                </div>
                <div>
                  <div className="text-micro uppercase text-ink-500 dark:text-ink-400">
                    Projected match
                  </div>
                  <div className="font-mono text-body-lg text-purple-500 dark:text-purple-300">
                    +{formatUsd(p.projected_match_usd)}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button as="a" href={`/projects/${p.id}/`} kind="primary" fullWidth>
                  Donate
                </Button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
