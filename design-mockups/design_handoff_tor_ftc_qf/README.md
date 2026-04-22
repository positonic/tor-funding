# Handoff: Tor × Funding the Commons — QF Campaign Site

**Target URL**: `donate-match.torproject.org`
**Campaign window**: May 19 – June 19, 2026
**Stack target**: Next.js (Pages Router, static export) + TypeScript + Tailwind CSS

---

## Overview

This is the campaign website for the Tor Project's quadratic funding round, run in partnership with Funding the Commons. The site lets donors:

1. Pick a Tor sub-project and donate in any of ~8 crypto assets (BTC, ETH, USDC, SOL, ZEC-t, ZEC-z, XMR)
2. Fund the campaign's matching pool directly
3. Watch a live leaderboard refresh every 60 seconds with projected quadratic matches

It's a single-purpose campaign microsite with **no accounts, no wallet-connect SDK, no comments, no recurring donations.** Donors copy an address or scan a QR and send from their own wallet externally. Simplicity is a feature.

## About the design files in this bundle

**The files in `design-reference/` are HTML prototypes built for design review — not production code to copy.** They use inline JSX via Babel standalone so the designer could iterate fast. Your task is to **recreate these designs in a real Next.js + TypeScript + Tailwind codebase** (the stack the brief calls for), using idiomatic React patterns, a proper build system, and an honest QR/icon library.

Treat the HTML as the single source of visual truth — pixel-level colors, spacing, typography, component composition, interaction behavior. Do not ship the HTML. Do not import from `design-reference/lib/*.jsx` at runtime.

The `tokens/` and `reference-components/` folders ARE meant for you — they're ready to drop into your project with minor adjustments.

## Fidelity

**High-fidelity.** Colors, typography, spacing, component shapes, and interactions are all final. Recreate pixel-perfectly. Specifically:

- All colors are tokenized in `tokens/tailwind.config.ts` — use those, don't eyeball from screenshots.
- Typography scale is final. Don't improvise new sizes.
- Spacing respects a 4px base grid with named semantic steps.
- Min tap target is 44×44 on touch devices — the `globals.css` enforces this globally.
- Addresses **never** truncate with ellipsis. This is a hard contract. See "Anti-ellipsis rule" below.

## Folder structure of this handoff

```
design_handoff_tor_ftc_qf/
├── README.md                       ← you are here
├── original-brief.md               ← the full design brief (12 sections)
├── tokens/
│   ├── tailwind.config.ts          ← drop into your Next.js project root
│   ├── globals.css                 ← app-wide CSS (focus rings, reduced-motion, address rule)
│   └── types.ts                    ← TypeScript types for snapshot.json
├── reference-components/
│   └── DonationPanel.tsx           ← reference implementation of the load-bearing component
├── sample-data/
│   └── snapshot.json               ← realistic sample data — use for storybook/dev
└── design-reference/               ← HTML prototypes — visual truth, NOT production code
    ├── index.html
    ├── lib/                        ← JSX modules the canvas composes
    └── assets/
```

## Pages to build (priority order)

The brief (`original-brief.md` §13) prioritizes in this order. Match it.

| # | Route | Priority | Notes |
|---|---|---|---|
| 1 | `/projects/[slug]` | **Critical** — load-bearing | Donation panel, sidebar stats, recent-feed. Sticky bottom CTA on mobile. |
| 2 | `/matching-pool` | **Critical** | Same chain-tab/QR pattern as a project page BUT visually distinct (orange accent, not purple). |
| 3 | `/` | High | Hero with animated USD counter, dual CTA, top-3 leaderboard, sponsor strip. |
| 4 | `/projects` | High | Grid with sort toggle (raised · projected match · name). |
| 5 | `/sponsors`, `/about`, `/stats` | Medium | Lighter passes OK — see design-reference for layouts. |

## Design system — brand tokens

Colors come from the Tor Brand Kit. All final values live in `tokens/tailwind.config.ts`.

### Primary palette

- **Purple `#9338C1`** — primary brand color. Project donation flows, primary CTAs, links, focus rings, leaderboard bars.
  - Hover/pressed: `#792CA2`
  - Soft surface (chain-tab hover, badges): `#F5E3FF`
  - Bright/dark-theme links: `#C272FF`

- **Pool orange `#C96A12`** — **reserved for the `/matching-pool` flow only.** Gives it a distinct surface so users never confuse the two donation flows. Never used on `/projects/*`.
  - Hover: `#D87717`
  - Soft surface: `#FFE9CC`
  - Dark-theme variant: `#E8932C`

- **Tor red `#CC474E`** — error/destructive only. From the brand kit.

### Neutrals (warm-cool ink)

Derived from Tor's text color `rgb(34,35,43)` and muted `rgb(85,100,114)`.

| Token | Light | Dark |
|---|---|---|
| Page bg | `#F2F5F8` (`ink-50`) | `#0B1017` (`ink-950`) — NOT pure black |
| Surface (card) | `#FFFFFF` | `#0F1822` (`ink-900`) |
| Text primary | `#18242F` (`ink-800`) | `#E4EAF0` |
| Text muted | `#556472` (`ink-500`) | `#8A98A6` (`ink-400`) |
| Hairline / border | `#E4EAF0` (`ink-100`) | `#2A3744` (`ink-700`) |

Both pairs exceed WCAG 2.1 AA 7:1 for body text.

### Typography

- **Inter** — UI + body. Regular / Medium / SemiBold. (Matches brand kit usage counts of 129 / 115 / 97.)
- **Space Grotesk Bold** — display numerals and hero headlines only (counter, stat cards, big page titles).
- **Space Mono Regular** — all on-chain addresses, tickers, code, monospace labels. **Never substitute with a proportional font.**

Scale (mobile-first):

| Token | px / line-height / letter-spacing |
|---|---|
| `text-micro` | 11 / 1.3 / 0.04em |
| `text-caption` | 13 / 1.4 |
| `text-body` | 15 / 1.55 |
| `text-body-lg` | 17 / 1.55 |
| `text-h4` | 18 / 1.3 / -0.01em |
| `text-h3` | 22 / 1.2 / -0.02em |
| `text-h2` | 28 / 1.15 / -0.03em |
| `text-h1` | 40 / 1.05 / -0.03em |
| `text-display-s` | 56 / 1 / -0.04em |
| `text-display-m` | 72 / 0.98 / -0.04em |
| `text-display-l` | 92 / 0.96 / -0.045em |

Mobile body min is 15px. Counters on mobile are ≥32px per brief §7. No 12px body text anywhere.

### Spacing, radii, shadows

- 4px base grid. Named: `spacing.touch = 44px` (WCAG), `spacing.panel = 16px` (mobile panel padding), `spacing.panel-lg = 24px`.
- Radii: `rounded-card = 12px`, `rounded-panel = 16px`, `rounded-pill = 999px`.
- Shadows: `shadow-cta` (purple-tinted for primary buttons), `shadow-cta-pool` (orange-tinted for pool button), `shadow-card` (flat neutral).

### Theme switching

Class-based: `.dark` on `<html>`. Default from `prefers-color-scheme`; user override persists in `sessionStorage` (not localStorage — matches torproject.org behavior). Reference snippet in `tokens/README` and `globals.css` defines the full CSS-variable surface.

## Components to build

From brief §5. Build in this order.

### Load-bearing

- **`<DonationPanel>`** — Chain tabs → address + QR + copy + wallet deep link. Only renders chains the project is matching-eligible on. Reference implementation in `reference-components/DonationPanel.tsx` — start from this and adapt.
- **`<ChainTab>`** — Currency icon, ticker, selected state. Mobile: horizontal-scroll with snap. Tap-to-open dropdown if >5 chains. ≥44px tap target.
- **`<MatchingPoolPanel>`** — Same shape as `<DonationPanel>` but orange-accented. Expose `accent="pool"` prop on the shared panel instead of duplicating; `DonationPanel` already supports this.

### Live / data

- **`<CampaignHero>`** — Animated USD counter (ease-out over 1.2s, respects `prefers-reduced-motion`), days-remaining counter, dual CTA.
- **`<Leaderboard>`** — Desktop: bar chart. Mobile: ranked list with inline bar fill (no chart library — CSS `width:` on a div). Sort toggle.
- **`<RecentFeed>`** — Auto-scrolling list. One line per entry on mobile. **Reserves vertical space** so new entries don't shift layout (fixed-height container with `overflow: hidden` + CSS `translateY` animation).

### Chrome

- **`<TransparencyBadge>`** — Pill with two states ("Verified on-chain" / "Verified via view key"). Tooltip copy lifted verbatim from brief §11.
- **`<SponsorStrip>`** — Greyscale logos, hover/tap → color.
- **`<ChainBreakdown>`** — Desktop: stacked bar. Mobile: legend + percentages (skip the donut).
- **`<FAQAccordion>`** — Standard expand/collapse, keyboard-navigable, `aria-expanded`.

## Interactions & behavior

### Animated USD counter

- Ease-out from 0 to target over 1.2s on mount.
- On snapshot update: ease from previous value to new value over 0.8s.
- `prefers-reduced-motion: reduce` → snap to final value instantly.

### Chain tab switcher

- `role="tablist"` on container, `role="tab"` on each tab, `role="tabpanel"` on the revealed address+QR region.
- Arrow-key left/right cycles tabs (desktop). Horizontal-scroll snap on mobile.
- Switching tab re-renders QR + address; no animation (instant).

### Copy-to-clipboard

- Uses `navigator.clipboard.writeText()`.
- Button text swaps to "Copied ✓" for 1.8s, then reverts.
- `aria-live="polite"` announces the state change.

### Sticky bottom CTA (mobile)

- On `/projects/[slug]` and `/matching-pool` only.
- Appears below viewport fold, stays thumb-reachable. Scroll-linked — hides when the donation panel is fully in view (IntersectionObserver).

### Recent-feed scroll

- New entry slides in from top; older entries push down; oldest falls off bottom.
- Container has fixed max-height with `overflow: hidden` so new entries **do not** push the rest of the page layout.
- Reduced-motion: swap instantly without the slide animation.

### Sort toggle on `/projects`

- Three radio-group buttons: "Raised", "Projected match", "Name".
- Changing sort re-orders the grid with a FLIP animation (300ms). Reduced-motion: no animation.

### Leaderboard refresh

- Poll `/snapshot.json` every 60s (setInterval). On update, animate bar widths to new values with 800ms ease-out. Reduced-motion: snap.
- Show a tiny `aria-live="polite"` "Updated Xs ago" chip.

## State management

Keep it minimal. Next.js Pages Router with static export.

```
pages/_app.tsx
  └─ <SnapshotProvider>              // polls /snapshot.json every 60s, broadcasts via context
       └─ <ThemeProvider>            // reads sessionStorage, applies .dark class
            └─ <Component {...pageProps} />
```

- `useSnapshot()` — returns `{ snapshot, isStale, updatedAt }`.
- Components are **pure** — receive data as props or via `useSnapshot()`. No component fetches directly.
- No global store (Redux/Zustand/etc.) needed.

## The anti-ellipsis rule for addresses

**This is a blocker-level contract.** Donors verify the full address before sending. Any ellipsis on an address is a bug.

- Use the `.address-mono` class (defined in `tokens/globals.css`) on any element rendering an address.
- Forbidden on `code[data-address]` elements: `truncate`, `line-clamp-*`, `text-overflow: ellipsis`, `white-space: nowrap` + `overflow: hidden`.
- The QR payload is the full address (or the full BIP21 URI like `bitcoin:bc1...?amount=0.001`), regardless of display width.
- The rule is testable: add a Playwright check that asserts no rendered address contains `…` or U+2026.

## Accessibility contract

- **WCAG 2.1 AA** for all text pairs in both themes.
- All tap targets ≥44×44 on touch devices (enforced globally via `globals.css`).
- Visible focus rings: 2px purple outline, 2px offset.
- `prefers-reduced-motion: reduce` disables: counter animation, recent-feed slide-in, bar-width transitions, all hover transitions.
- Chain icons: `aria-label={label}`.
- Copy buttons: `aria-live="polite"`.
- Transparency badge tooltip: fully keyboard-operable (focus to reveal, Esc to dismiss).
- FAQ accordion: `aria-expanded`, `aria-controls`, `<button>` not `<div role="button">`.

## Performance budget

Dev will enforce. Design is compliant; keep it that way during implementation.

- Initial HTML: <30KB
- Hydration JS: <200KB
- FCP on 3G: <1.0s
- **No** decorative video, no heavy hero illustrations, no Lottie, no chart library on mobile.

Icons are inline SVG. The QR library (`qrcode.react`) adds ~8KB gzipped — acceptable.

## SEO / OG images

Each page needs distinct OG image, title, meta description.

- `/projects/[slug]` especially — these get shared on Twitter/Mastodon/Bluesky.
- Per-project OG image template in the design reference renders in the DOM for preview. For production, use `@vercel/og` (Satori) at `/api/og?slug=<id>` to generate real 1200×630 PNGs at request time.
- Template takes `{ project_name, projected_match_usd }` as inputs.
- Non-project pages use the generic OG template (also in design-reference).

## Microcopy

Use these verbatim from brief §11 — they were negotiated with Tor's comms team.

- **Hero pitch**: "31 days. 8 ways to give. Every donation to a Tor project gets matched from the community pool."
- **Matching pool explainer**: "Donations to the matching pool are distributed across all participating projects based on community support. Your contribution multiplies the impact of every donor."
- **Transparency badge — public**: "This donation was verified directly on a public blockchain."
- **Transparency badge — view key**: "This donation was verified via a view key the project shared with the campaign. Donor identity remains private."
- **Chain not eligible**: "This project doesn't accept matching-eligible donations on this chain. To support them, donate via a chain shown above."

## Out of scope (don't build these)

Per brief §12:

- Wallet-connect SDK / WalletConnect integration
- Account creation, login, profile pages
- Comments, likes, reactions
- Recurring donation forms (handled by Tor's existing donation site)
- Tax receipt UX (handled elsewhere)
- Admin / ops UI

## Known decisions to confirm with the designer

1. **ZEC split** — transparent (`zec_t`) and shielded (`zec_z`) are currently separate chain tabs with different verification badges. Alternative: single "ZEC" tab with a shielded/transparent toggle. Confirm before building.
2. **Cookie-free analytics** — brief says no third-party trackers. If Tor wants basic page metrics, use a self-hosted Plausible-style endpoint that strips IPs.
3. **Countdown timer on hero** — should it count down to the end of the campaign, or to the next leaderboard snapshot? Currently designed as campaign-end.

## Files in `design-reference/` to open first

1. `design-reference/index.html` — open in a browser. The canvas lays out every screen at mobile / tablet / desktop widths side-by-side. Toggle Tweaks (top-right) to flip theme, switch donation panel variant, preview end-of-campaign state.
2. `design-reference/lib/donation-panel.jsx` — the three variants of the donation panel the designer explored. Variant A (tabs on top) is the recommended one — but read the comments for the tradeoffs.
3. `design-reference/lib/landing.jsx` — hero, leaderboard preview, sponsor strip, OG template.
4. `design-reference/lib/desktop.jsx` — desktop two-column layouts.
5. `design-reference/lib/tokens.jsx` — color + type token JSX (cross-reference with `tokens/tailwind.config.ts`).

## Suggested build order

1. Scaffold Next.js app, drop in `tokens/tailwind.config.ts` and `tokens/globals.css`.
2. Build `<Button>`, `<ChainTab>`, `<TransparencyBadge>` primitives.
3. Build `<DonationPanel>` from `reference-components/DonationPanel.tsx`. Get it working at 390px width FIRST.
4. Build `/projects/[slug]` around it.
5. Build `/matching-pool` (mostly prop-variant of the project page).
6. Build `/` landing — hero, counter, top-3 leaderboard preview.
7. Build `/projects` grid.
8. `/sponsors`, `/about`, `/stats` last.
9. OG image route.
10. Playwright pass: anti-ellipsis check, tap-target check, theme-switch check, reduced-motion check.
