import type { Config } from 'tailwindcss';

/**
 * Tor × FTC QF Campaign — Tailwind config
 *
 * Tokens lifted directly from the Tor Brand Kit Figma file
 * (copied verbatim from design-mockups/.../tokens/tailwind.config.ts).
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
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ——— Brand purple (primary) ———
        purple: {
          50:  '#F5E3FF',
          100: '#EBCFFF',
          200: '#DAB0FF',
          300: '#C272FF',
          400: '#9747FF',
          500: '#9338C1',
          600: '#792CA2',
          700: '#6C2C8B',
          800: '#4E2065',
          900: '#301040',
        },

        // ——— Pool orange (secondary accent — /matching-pool only) ———
        pool: {
          50:  '#FFE9CC',
          100: '#FFD9A8',
          200: '#FFC27A',
          300: '#E8932C',
          400: '#D87717',
          500: '#C96A12',
          600: '#A8560E',
          700: '#7F2B07',
          800: '#5A1E05',
          900: '#2F0F02',
        },

        // ——— Neutrals (warm-cool ink) ———
        ink: {
          50:  '#F2F5F8',
          100: '#E4EAF0',
          200: '#D1DAE3',
          300: '#A5B3C1',
          400: '#8A98A6',
          500: '#556472',
          600: '#3C4752',
          700: '#2A3744',
          800: '#18242F',
          900: '#0F1822',
          950: '#0B1017',
        },

        // ——— Semantic ———
        success: { DEFAULT: '#3C7A1B', bg: '#EBFFC4', fg: '#376C12' },
        warning: { DEFAULT: '#C96A12', bg: '#FFF3CB', fg: '#7F2B07' },
        danger:  { DEFAULT: '#CC474E', bg: '#FFD9D4', fg: '#742027' },
        info:    { DEFAULT: '#2E3781', bg: '#DAECFF', fg: '#2E3781' },
      },

      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif'],
        mono:    ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      fontSize: {
        'micro':     ['11px', { lineHeight: '1.3', letterSpacing: '0.04em' }],
        'caption':   ['13px', { lineHeight: '1.4' }],
        'body':      ['15px', { lineHeight: '1.55' }],
        'body-lg':   ['17px', { lineHeight: '1.55' }],
        'h4':        ['18px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3':        ['22px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2':        ['28px', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
        'h1':        ['40px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-s': ['56px', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'display-m': ['72px', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
        'display-l': ['92px', { lineHeight: '0.96', letterSpacing: '-0.045em' }],
      },

      spacing: {
        'touch': '44px',
        'panel': '16px',
        'panel-lg': '24px',
      },

      borderRadius: {
        'pill': '999px',
        'card': '12px',
        'panel': '16px',
      },

      boxShadow: {
        'cta':      '0 6px 20px -6px rgba(147,56,193,0.35)',
        'cta-pool': '0 6px 20px -6px rgba(216,119,23,0.35)',
        'card':     '0 1px 2px rgba(15,24,34,0.04), 0 2px 8px rgba(15,24,34,0.04)',
      },

      screens: {
        sm:   '640px',
        md:   '768px',
        lg:   '1024px',
        xl:   '1280px',
        '2xl':'1536px',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'feed-in':    'feed-in 480ms cubic-bezier(0.2, 0.8, 0.2, 1)',
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
