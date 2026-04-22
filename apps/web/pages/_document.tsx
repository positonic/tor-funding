import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Static document.
 *
 * The inline script runs BEFORE React hydrates so the `.dark` class is
 * applied on the server-rendered HTML — no flash of the wrong theme.
 * It reads sessionStorage (not localStorage, per torproject.org privacy
 * posture) and falls back to `prefers-color-scheme`.
 *
 * Keep this script short, cookie-free, and dependency-free — no third
 * parties may be introduced here.
 */
const themeBootstrap = `
try {
  var s = window.sessionStorage.getItem('tor-qf-theme');
  var t = (s === 'light' || s === 'dark')
    ? s
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (t === 'dark') document.documentElement.classList.add('dark');
} catch (_) { /* sessionStorage blocked — default to system preference on next paint */ }
`.trim();

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
