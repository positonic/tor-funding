import { useEffect, useState } from 'react';
import { resolveInitialTheme, setTheme, type Theme } from '@/lib/theme';

/**
 * Sun/moon theme toggle. Persists to sessionStorage (see CLAUDE.md #theme).
 *
 * Inline SVGs — no icon dep. Starts unrendered on SSR to avoid a hydration
 * mismatch (server HTML has no idea what the client session preference is).
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const initial = resolveInitialTheme();
    setThemeState(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    setTheme(next);
  }

  if (!mounted) {
    // Placeholder with the same width to prevent layout shift
    return <span className="inline-block w-touch h-touch" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="inline-flex items-center justify-center w-touch h-touch rounded-pill hover:bg-ink-50 dark:hover:bg-ink-900 text-ink-800 dark:text-ink-100"
    >
      {theme === 'dark' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
