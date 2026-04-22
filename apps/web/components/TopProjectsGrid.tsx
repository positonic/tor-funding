import Link from 'next/link';
import type { Project } from '@tor/types';
import { formatUsd } from '@/lib/format';

export interface TopProjectsGridProps {
  projects: readonly Project[];
  limit?: number;
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

export function TopProjectsGrid({ projects, limit = 3 }: TopProjectsGridProps) {
  const sorted = [...projects].sort(
    (a, b) =>
      b.total_donated_usd +
      b.projected_match_usd -
      (a.total_donated_usd + a.projected_match_usd),
  );
  const top = sorted.slice(0, limit);

  return (
    <section
      aria-labelledby="top-projects-title"
      className="mx-auto max-w-7xl px-panel md:px-8 py-10 md:py-12"
    >
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <h2
          id="top-projects-title"
          className="font-display text-h2 text-ink-800 dark:text-ink-100"
        >
          Top projects
        </h2>
        <Link
          href="/projects/"
          className="inline-flex items-center gap-1 text-[14px] font-semibold text-purple-500 dark:text-purple-300 hover:text-purple-600"
        >
          See all {projects.length} projects
          <ArrowIcon />
        </Link>
      </div>

      {top.length === 0 ? (
        <div className="rounded-card border border-dashed border-ink-100 dark:border-ink-700 p-6 text-caption text-ink-500 dark:text-ink-400">
          No projects published yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {top.map((p, i) => {
            const total = p.total_donated_usd + p.projected_match_usd;
            const raisedPct = total > 0 ? (p.total_donated_usd / total) * 100 : 0;
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}/`}
                className="group flex flex-col gap-3.5 p-6 rounded-[14px] bg-[var(--surface)] border border-ink-100 dark:border-ink-700 hover:border-purple-500/40 dark:hover:border-purple-300/40 hover:shadow-card transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] font-bold tracking-[0.08em] text-purple-500 dark:text-purple-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-ink-500 dark:text-ink-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors">
                    <ArrowIcon />
                  </span>
                </div>
                <div>
                  <h3 className="font-sans text-[18px] font-bold tracking-tight text-ink-800 dark:text-ink-100">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[13px] leading-[1.5] text-ink-500 dark:text-ink-400">
                    {p.short_desc}
                  </p>
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
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
