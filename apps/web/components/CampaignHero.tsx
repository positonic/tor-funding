import Link from 'next/link';
import { AnimatedNumber } from './AnimatedNumber';

export interface CampaignHeroProps {
  totalRaisedUsd: number;
  poolTotalUsd: number;
  uniqueDonors: number;
  donationCount: number;
  sponsorCount: number;
  projectCount: number;
  daysRemaining: number;
  totalDays: number;
  dayNumber: number;
  dateRangeLabel: string;
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

export function CampaignHero({
  totalRaisedUsd,
  poolTotalUsd,
  uniqueDonors,
  donationCount,
  sponsorCount,
  projectCount,
  daysRemaining,
  totalDays,
  dayNumber,
  dateRangeLabel,
}: CampaignHeroProps) {
  const eyebrow =
    dayNumber > 0 && dayNumber <= totalDays
      ? `${dateRangeLabel} · Day ${dayNumber} of ${totalDays}`
      : `${dateRangeLabel} · ${daysRemaining} days remaining`;

  return (
    <section className="border-b border-ink-100 dark:border-ink-700">
      <div className="mx-auto max-w-7xl px-panel md:px-8 py-10 md:py-14">
        <div className="grid gap-10 md:gap-12 lg:grid-cols-[1.25fr_0.9fr] lg:items-center">
          {/* Left: copy + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-ink-50 dark:bg-ink-900 font-mono text-[12px] text-ink-500 dark:text-ink-400 mb-5">
              <span
                className="w-1.5 h-1.5 rounded-pill bg-success animate-pulse-slow"
                aria-hidden="true"
              />
              {eyebrow}
            </div>

            {/* Verbatim from brief §11 — do not paraphrase.
                Presented as three rhythmic lines; final clause in purple. */}
            <h1 className="font-display font-bold text-[40px] sm:text-[52px] lg:text-[64px] leading-[0.98] tracking-[-0.04em] text-ink-800 dark:text-ink-100 [text-wrap:balance]">
              31 days.
              <br />
              8 ways to give.
              <br />
              <span className="text-purple-500 dark:text-purple-300">
                Every donation to a Tor project gets matched from the community pool.
              </span>
            </h1>

            <p className="mt-5 max-w-[560px] text-body-lg text-ink-500 dark:text-ink-400 [text-wrap:pretty]">
              A quadratic funding round for the Tor Project, run with Funding the Commons.
              Support a team directly, or fund the pool that multiplies every donation.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/projects/"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-card bg-purple-500 hover:bg-purple-600 text-white text-body font-semibold shadow-cta transition-colors"
              >
                Support a project
                <ArrowIcon />
              </Link>
              <Link
                href="/matching-pool/"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-card bg-pool-500 hover:bg-pool-400 text-white text-body font-semibold shadow-cta-pool transition-colors"
              >
                Fund the matching pool
                <ArrowIcon />
              </Link>
            </div>
          </div>

          {/* Right: stacked stats card */}
          <aside className="rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface-2)] p-6 md:p-7 flex flex-col gap-4">
            <div>
              <div className="font-sans text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-500 dark:text-ink-400">
                Raised so far
              </div>
              <AnimatedNumber
                value={totalRaisedUsd}
                className="block mt-1 font-display font-bold text-[44px] md:text-[52px] leading-none tracking-[-0.03em] text-ink-800 dark:text-ink-100"
              />
              <div className="mt-1.5 font-mono text-caption text-ink-500 dark:text-ink-400">
                {uniqueDonors.toLocaleString()} donors · {donationCount.toLocaleString()} donations
              </div>
            </div>

            <div className="h-px bg-ink-100 dark:bg-ink-700" aria-hidden="true" />

            <div>
              <div className="font-sans text-[11px] font-semibold tracking-[0.08em] uppercase text-pool-500 dark:text-pool-300">
                Matching pool
              </div>
              <AnimatedNumber
                value={poolTotalUsd}
                className="block mt-1 font-display font-bold text-[36px] md:text-[40px] leading-none tracking-[-0.03em] text-ink-800 dark:text-ink-100"
              />
              <div className="mt-1.5 font-mono text-caption text-pool-500 dark:text-pool-300">
                {sponsorCount} sponsor{sponsorCount === 1 ? '' : 's'} · splits {projectCount} way
                {projectCount === 1 ? '' : 's'}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
