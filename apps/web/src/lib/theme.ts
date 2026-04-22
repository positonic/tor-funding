/**
 * Theme helpers. Class-based `.dark` on <html>.
 *
 * Persistence uses sessionStorage (not localStorage) to match
 * torproject.org's privacy posture — preferences don't survive a
 * browser restart, matching what a Tor Browser user expects.
 */

const STORAGE_KEY = 'tor-qf-theme';

export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // sessionStorage disabled (Tor Browser strict) — no-op, fall back
    // to system preference on next navigation.
  }
}

export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}
