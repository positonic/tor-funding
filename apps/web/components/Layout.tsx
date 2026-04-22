import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { TorLogo } from './TorLogo';

export interface LayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

const NAV: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/matching-pool', label: 'Matching pool' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/about', label: 'About' },
  { href: '/stats', label: 'Stats' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Layout({ title, description, children }: LayoutProps) {
  const router = useRouter();
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
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={meta} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <header className="border-b border-ink-100 dark:border-ink-700 bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-panel md:px-8 h-16 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <TorLogo size={26} className="text-purple-500" />
            <span className="leading-[1.05]">
              <span className="block font-sans text-[15px] font-bold tracking-tight text-ink-800 dark:text-ink-100">
                Tor Project
              </span>
              <span className="block font-mono text-[10px] tracking-wider text-ink-500 dark:text-ink-400">
                × FTC · QF 2026
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 ml-5">
            {NAV.map((item) => {
              const active = isActive(router.pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'px-3 py-2 rounded-md text-[13px] transition-colors ' +
                    (active
                      ? 'font-semibold text-ink-800 dark:text-ink-100 bg-ink-50 dark:bg-ink-900'
                      : 'font-medium text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100')
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          <div
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-pill bg-ink-50 dark:bg-ink-900 font-mono text-[11px] text-ink-500 dark:text-ink-400"
            aria-label="Live data indicator"
          >
            <span
              className="w-1.5 h-1.5 rounded-pill bg-success animate-pulse-slow"
              aria-hidden="true"
            />
            Live · updates every 60s
          </div>

          <ThemeToggle />

          <Link
            href="/projects/"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-card bg-purple-500 hover:bg-purple-600 text-white text-[13px] font-semibold shadow-cta transition-colors"
          >
            Donate
            <svg
              width="12"
              height="12"
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
          </Link>
        </div>

        {/* Mobile nav strip */}
        <nav
          aria-label="Mobile"
          className="md:hidden border-t border-ink-100 dark:border-ink-700 overflow-x-auto"
        >
          <ul className="flex gap-1 px-panel py-2 whitespace-nowrap">
            {NAV.map((item) => {
              const active = isActive(router.pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={
                      'inline-flex px-3 py-2 rounded-card text-caption transition-colors ' +
                      (active
                        ? 'font-semibold text-ink-800 dark:text-ink-100 bg-ink-50 dark:bg-ink-900'
                        : 'text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100')
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink-100 dark:border-ink-700 bg-[var(--surface)] mt-12">
        <div className="mx-auto max-w-7xl px-panel md:px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-caption text-ink-500 dark:text-ink-400">
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
