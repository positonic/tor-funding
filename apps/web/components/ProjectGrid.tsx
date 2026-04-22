import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@tor/types';
import { formatUsd } from '@/lib/format';
import { ChainIcon, CHAIN_TICKERS } from './ChainIcon';

type Sort = 'projected' | 'raised' | 'name';

export interface ProjectGridProps {
  projects: readonly Project[];
}

const SORT_OPTIONS: { k: Sort; l: string }[] = [
  { k: 'projected', l: 'Projected match' },
  { k: 'raised', l: 'Raised' },
  { k: 'name', l: 'Name' },
];

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

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10L10 4M10 4H5M10 4V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [sort, setSort] = useState<Sort>('projected');
  const ordered = useMemo(() => sortProjects(projects, sort), [projects, sort]);

  return (
    <section aria-labelledby="project-grid-title">
      <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
        <div>
          <h1
            id="project-grid-title"
            className="font-display font-bold text-[32px] md:text-[40px] leading-[1.05] tracking-[-0.03em] text-ink-800 dark:text-ink-100"
          >
            Projects
          </h1>
          <p className="mt-1.5 text-[15px] text-ink-500 dark:text-ink-400">
            All {projects.length} participating team{projects.length === 1 ? '' : 's'}.
            Every chain we support is matching-eligible.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Sort projects"
          className="inline-flex gap-1.5 p-1 rounded-[10px] bg-ink-50 dark:bg-ink-900"
        >
          {SORT_OPTIONS.map((o) => {
            const selected = sort === o.k;
            return (
              <button
                key={o.k}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSort(o.k)}
                className={
                  'px-3.5 py-2 rounded-[7px] text-[13px] font-semibold transition-colors ' +
                  (selected
                    ? 'bg-[var(--surface)] text-ink-800 dark:text-ink-100 shadow-[0_1px_3px_rgba(15,24,34,0.08)]'
                    : 'bg-transparent text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100')
                }
              >
                {o.l}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
        {ordered.map((p) => {
          const total = p.total_donated_usd + p.projected_match_usd;
          const raisedPct = total > 0 ? (p.total_donated_usd / total) * 100 : 0;
          return (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}/`}
                className="group flex h-full flex-col gap-3.5 p-6 rounded-[14px] bg-[var(--surface)] border border-ink-100 dark:border-ink-700 hover:border-purple-500/40 dark:hover:border-purple-300/40 hover:shadow-card transition-colors"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <h3 className="font-sans text-[18px] font-bold tracking-tight text-ink-800 dark:text-ink-100">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-[13px] leading-[1.5] text-ink-500 dark:text-ink-400">
                      {p.short_desc}
                    </p>
                  </div>
                  <span className="shrink-0 text-ink-500 dark:text-ink-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors">
                    <ArrowIcon />
                  </span>
                </div>

                <div className="flex items-baseline gap-5">
                  <div>
                    <div className="font-sans text-[10px] font-semibold tracking-[0.06em] uppercase text-ink-500 dark:text-ink-400">
                      Raised
                    </div>
                    <div className="font-mono text-[17px] font-bold text-ink-800 dark:text-ink-100">
                      {formatUsd(p.total_donated_usd)}
                    </div>
                  </div>
                  <div>
                    <div className="font-sans text-[10px] font-semibold tracking-[0.06em] uppercase text-purple-500 dark:text-purple-300">
                      Match
                    </div>
                    <div className="font-mono text-[17px] font-bold text-purple-500 dark:text-purple-300">
                      +{formatUsd(p.projected_match_usd)}
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="text-right">
                    <div className="font-sans text-[10px] font-semibold tracking-[0.06em] uppercase text-ink-500 dark:text-ink-400">
                      Donors
                    </div>
                    <div className="font-mono text-[17px] font-bold text-ink-800 dark:text-ink-100">
                      {p.unique_donors.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div
                  className="h-1.5 rounded-pill overflow-hidden flex bg-ink-100 dark:bg-ink-700"
                  aria-hidden="true"
                >
                  <div
                    className="bg-ink-800 dark:bg-ink-100"
                    style={{ width: `${raisedPct}%` }}
                  />
                  <div className="flex-1 bg-purple-500 dark:bg-purple-300" />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {p.matching_eligible_chains.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-ink-50 dark:bg-ink-900 font-mono text-[10px] font-semibold text-ink-800 dark:text-ink-100"
                    >
                      <span className="text-ink-500 dark:text-ink-400">
                        <ChainIcon chain={c} size={12} />
                      </span>
                      {CHAIN_TICKERS[c]}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
