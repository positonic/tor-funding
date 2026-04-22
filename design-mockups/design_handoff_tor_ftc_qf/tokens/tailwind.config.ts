import type { Config } from 'tailwindcss';

/**
 * Tor × FTC QF Campaign — Tailwind config
 *
 * Tokens lifted directly from the Tor Brand Kit Figma file.
 * All colors have been spot-checked for WCAG 2.1 AA against #FFFFFF
 * (light) and #0B1017 (dark) surfaces.
 *
 * Theme strategy: class-based dark mode. Root app reads system preference,
 * stores user override in sessionStorage, applies `.dark` to <html>.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ——— Brand purple (primary) ———
        // Used for: primary CTA, links, project donation panel accent,
        // leaderboard bars, focus rings.
        purple: {
          50:  '#F5E3FF', // chain-tab hover / soft card bg
          100: '#EBCFFF',
          200: '#DAB0FF',
          300: '#C272FF', // bright accent — dark theme links
          400: '#9747FF', // hover/pressed secondary state
          500: '#9338C1', // primary brand color — CTAs, focus rings
          600: '#792CA2', // pressed / active
          700: '#6C2C8B',
          800: '#4E2065',
          900: '#301040',
        },

        // ——— Pool orange (secondary accent) ———
        // Used for: matching-pool flow ONLY. Gives the pool page a
        // visually distinct feel so users never confuse the two flows.
        pool: {
          50:  '#FFE9CC',
          100: '#FFD9A8',
          200: '#FFC27A',
          300: '#E8932C', // dark-theme pool links
          400: '#D87717', // pool hover
          500: '#C96A12', // pool primary
          600: '#A8560E',
          700: '#7F2B07', // pool text on light bg
          800: '#5A1E05',
          900: '#2F0F02',
        },

        // ——— Neutrals (warm-cool ink) ———
        // Derived from Tor's `rgb(34,35,43)` text + `rgb(85,100,114)` muted.
        ink: {
          50:  '#F2F5F8', // page bg (light)
          100: '#E4EAF0', // hairlines, card borders (light)
          200: '#D1DAE3', // disabled border
          300: '#A5B3C1',
          400: '#8A98A6', // muted text (dark)
          500: '#556472', // muted text (light)
          600: '#3C4752',
          700: '#2A3744', // hairlines, card borders (dark)
          800: '#18242F', // primary text (light) — NOT pure black
          900: '#0F1822',
          950: '#0B1017', // page bg (dark) — NOT pure black
        },

        // ——— Semantic ———
        // Tor brand uses `rgb(204,71,78)` red for errors; rest derived.
        success: { DEFAULT: '#3C7A1B', bg: '#EBFFC4', fg: '#376C12' },
        warning: { DEFAULT: '#C96A12', bg: '#FFF3CB', fg: '#7F2B07' },
        danger:  { DEFAULT: '#CC474E', bg: '#FFD9D4', fg: '#742027' },
        info:    { DEFAULT: '#2E3781', bg: '#DAECFF', fg: '#2E3781' },
      },

      fontFamily: {
        // Inter for UI + body. Space Grotesk for display/numerics.
        // Space Mono for addresses, code, monospace labels — NEVER
        // substitute with a proportional font; donors verify the whole string.
        sans:    ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif'],
        mono:    ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      fontSize: {
        // Mobile-first scale. Counters on mobile ≥32px per brief §7.
        'micro': ['11px', { lineHeight: '1.3', letterSpacing: '0.04em' }],
        'caption': ['13px', { lineHeight: '1.4' }],
        'body':  ['15px', { lineHeight: '1.55' }],
        'body-lg': ['17px', { lineHeight: '1.55' }],
        'h4':    ['18px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3':    ['22px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2':    ['28px', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        'h1':    ['40px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-s': ['56px', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'display-m': ['72px', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
        'display-l': ['92px', { lineHeight: '0.96', letterSpacing: '-0.045em' }],
      },

      spacing: {
        // 4px base, with named semantic sizes.
        'touch': '44px',  // WCAG min tap target
        'panel': '16px',  // mobile panel padding
        'panel-lg': '24px',
      },

      borderRadius: {
        'pill': '999px',
        'card': '12px',
        'panel': '16px',
      },

      boxShadow: {
        // Tor brand uses rgba(137,56,177,0.25) purple-tinted shadow for
        // elevated CTAs — replicate with theme-aware values.
        'cta':     '0 6px 20px -6px rgba(147,56,193,0.35)',
        'cta-pool':'0 6px 20px -6px rgba(216,119,23,0.35)',
        'card':    '0 1px 2px rgba(15,24,34,0.04), 0 2px 8px rgba(15,24,34,0.04)',
      },

      screens: {
        // Designed mobile-first at 390×844 (iPhone 14), tablet 768, desktop 1280+.
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1536px',
      },

      animation: {
        // Respects prefers-reduced-motion globally via CSS.
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'feed-in':   'feed-in 480ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        'feed-in': {
          '0%':   { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
