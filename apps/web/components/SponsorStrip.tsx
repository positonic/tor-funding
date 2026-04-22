import type { Sponsor } from '@tor/types';

/**
 * <SponsorStrip> — greyscale → color on hover/tap.
 *
 * TODO: real sponsor logos (SVG). For now we render the sponsor name
 * as a text badge; swap in <img src={logo_url} /> once the assets land.
 * Kept behind a boolean in case a sponsor supplies a logo early.
 */
export interface SponsorStripProps {
  sponsors: readonly Sponsor[];
  title?: string;
}

export function SponsorStrip({ sponsors, title = 'Match sponsors' }: SponsorStripProps) {
  if (sponsors.length === 0) return null;
  return (
    <section aria-labelledby="sponsor-strip-title" className="py-6">
      <h2
        id="sponsor-strip-title"
        className="text-micro uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-3"
      >
        {title}
      </h2>
      <ul className="flex flex-wrap gap-3">
        {sponsors.map((s) => {
          const content = s.logo_url ? (
            <img
              src={s.logo_url}
              alt={s.name}
              className="h-8 grayscale hover:grayscale-0 transition-all"
            />
          ) : (
            <span className="px-4 py-2 rounded-card border border-ink-100 dark:border-ink-700 bg-[var(--surface)] text-body text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100 hover:border-ink-500 dark:hover:border-ink-400 transition-colors">
              {s.name}
            </span>
          );
          return (
            <li key={s.name}>
              {s.outbound_url ? (
                <a href={s.outbound_url} rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
