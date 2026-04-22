import Link from 'next/link';
import Head from 'next/head';
import type { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';

export interface LayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

const NAV = [
  { href: '/projects', label: 'Projects' },
  { href: '/matching-pool', label: 'Matching pool' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/about', label: 'About' },
  { href: '/stats', label: 'Stats' },
];

export function Layout({ title, description, children }: LayoutProps) {
  const fullTitle = title
    ? `${title} — Tor × FTC Quadratic Funding`
    : 'Tor × FTC Quadratic Funding';
  const meta =
    description ??
    'Support Tor Project sub-projects directly in crypto. Every donation gets matched from a community-funded pool.';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={meta} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index,follow" />
        {/* TODO(§17.9 story 77): per-page OG images via /api/og */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={meta} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <header className="border-b border-ink-100 dark:border-ink-700 bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-panel py-3 flex items-center gap-4">
          <Link
            href="/"
            className="font-display text-h4 tracking-tight text-ink-800 dark:text-ink-100"
          >
            Tor × FTC
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-card text-body text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-900"
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
          <div className="md:hidden ml-auto">
            <ThemeToggle />
          </div>
        </div>
        {/* Mobile bottom nav strip — tech-spec §7 mobile scale */}
        <nav
          aria-label="Mobile"
          className="md:hidden border-t border-ink-100 dark:border-ink-700 overflow-x-auto"
        >
          <ul className="flex gap-1 px-panel py-2 whitespace-nowrap">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex px-3 py-2 rounded-card text-caption text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink-100 dark:border-ink-700 bg-[var(--surface)] mt-12">
        <div className="mx-auto max-w-6xl px-panel py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-caption text-ink-500 dark:text-ink-400">
          <div>
            <strong className="font-medium text-ink-800 dark:text-ink-100">
              Tor Project, Inc.
            </strong>{' '}
            · a quadratic funding round with Funding the Commons
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="hover:text-ink-800 dark:hover:text-ink-100"
            >
              About the round
            </Link>
            <a
              href="https://www.torproject.org/"
              className="hover:text-ink-800 dark:hover:text-ink-100"
            >
              torproject.org
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
