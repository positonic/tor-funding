# Brief for Claude Design — Tor Project × Funding the Commons QF Campaign

## 1. What you're designing

A single-purpose campaign website for the **Tor Project's quadratic funding round**, run with Funding the Commons. The site lets donors:

- Pick a Tor sub-project and donate in any of ~8 supported crypto assets
- *Or* fund the campaign's **matching pool** directly
- Watch live totals and projected matches update on a leaderboard

Round runs **May 19 – June 19, 2026**. Site lives at `donate-match.torproject.org`.

**Deliverable**: a Next.js (Pages Router, static export) site exported as TSX + Tailwind components, props-driven for dynamic data, ready for a developer to wire to a live `snapshot.json` data source.

---

## 2. Audience and tone

**Audience**
- Privacy-conscious technical users (Tor's existing donor base — desktop/laptop heavy)
- Crypto-native individuals who will donate from a phone wallet (**mobile-dominant flow**)
- Match-fund sponsors evaluating where to put institutional money (desktop, expects polish)

**Tone**
- *Trustworthy and audit-friendly* over flashy. This is the Tor Project — donors expect the site to feel like it respects them.
- *Warm enough to encourage giving* — not bureaucratic. Closer to Tor's existing site personality (clean, technical-but-human) than typical web3 maximalism.
- *No marketing fluff* about "revolutionizing giving" or similar.

**Hard tone rules**
- No third-party trackers, no cookie banners, no pop-ups, no email-capture modals — anywhere.
- Never imply that donations are private from the campaign. The cooperative-transparency model is the whole point and is a feature.
- Never use casino-style urgency ("Hurry! Only 3 days left!"). A simple, accurate countdown is enough.

---

## 3. Visual direction and references

**Primary reference**: the Tor Project's existing site at `https://www.torproject.org`. The campaign site should feel like a natural extension of `torproject.org`, not a third-party microsite. Pull palette, typography, and spacing personality from there.

**Secondary references** (for QF mechanics, not visual style)
- Gitcoin Grants — leaderboard + projected-match pattern
- BTCPay Server donation pages — chain-tab + QR + address layout
- Geyser.fund — live donor-feed pattern

**Anti-references** (avoid this aesthetic)
- Glassmorphism, gradient mesh backgrounds, generic web3 neon
- Stock illustrations of "people connecting" or holding phones
- Aggressive hero animations, parallax, autoplay video

---

## 4. Pages

### `/` — Campaign landing
- Hero: one-line pitch, days remaining, total raised (USD), total matching pool (USD), **two equally-weighted CTAs**: "Support a project" and "Fund the matching pool".
- Match sponsor logo strip.
- Top-3 leaderboard preview with link to full `/projects`.
- "How it works" 3-step explainer: donate → community signal → quadratic match.

### `/projects` — All projects grid
- Card per project: name, one-line description, total raised, projected match, "Donate" button.
- Sort toggle: by raised, by projected match, by name.

### `/projects/[slug]` — Individual project (the heart of the site)
- Project name, longer description (rendered from markdown), team/links.
- **Donation panel** (see component spec): chain tabs showing only matching-eligible chains, address, QR, copy, wallet deep link.
- Live stats sidebar: raised so far, donor count, projected match, transparency badge.
- Recent donations feed scoped to this project.

### `/matching-pool` — Fund the pool
- Explainer block (use exact microcopy from §11).
- Same chain-tab/QR/address pattern as a project page, but **visually distinct** so users don't confuse the two flows.
- Live total + breakdown by chain.
- Recent contributions feed (separate from project donations).

### `/sponsors` — Match sponsors
- Logo wall: name, committed amount in USD, optional outbound link.

### `/about` — How it works
- Quadratic funding explainer with a simple diagram.
- Cooperative transparency model — why we ask for view keys, what it means, what it does *not* mean.
- Sybil review process.
- FAQ accordion.

### `/stats` — Full transparency
- Filterable table of every donation and matching contribution.
- CSV download button.
- Per-chain breakdown chart.

---

## 5. Key components

| Component | Behaviour notes |
|---|---|
| `<CampaignHero>` | Animated USD counter (must respect `prefers-reduced-motion`), days-remaining counter, dual CTA. |
| `<DonationPanel>` | Chain tabs → address + QR + copy + wallet deep link. **Only displays chains the project is matching-eligible on.** |
| `<ChainTab>` | Currency icon, address (monospace, full-length on every viewport), QR (≥240×240 on mobile), copy button, "Open in wallet" deep link for EVM/SOL. |
| `<MatchingPoolPanel>` | Same pattern as `<DonationPanel>` but for the pool. Use a distinct accent color or container treatment. |
| `<Leaderboard>` | Bar chart on desktop, sortable by raised vs projected match. **On mobile**: ranked list with inline bar fill — no chart library overhead. |
| `<RecentFeed>` | Auto-scrolling list of "$X to [project] via [chain], Y min ago". One line per entry on mobile. Reserves vertical space so new entries don't shift layout. |
| `<TransparencyBadge>` | Tiny pill — "Verified on-chain" (public) or "Verified via view key" (privacy). Tooltip explains both states. |
| `<SponsorStrip>` | Greyscale logo wall, hover/tap → color. |
| `<ChainBreakdown>` | Stacked bar (desktop) or legend + percentages (mobile, no donut). |
| `<FAQAccordion>` | Standard expand/collapse. Keyboard-navigable. |

---

## 6. Sample data shape (use this to render realistic mocks)

```json
{
  "totals": {
    "total_donated_usd": 42310.55,
    "total_matching_pool_usd": 87500.00,
    "unique_donors": 1247,
    "donation_count": 1389
  },
  "matching_pool": {
    "total_usd": 87500.00,
    "by_chain": {"btc": 30000, "eth": 40000, "sol": 5000, "zec": 7500, "xmr": 5000},
    "addresses": {
      "btc": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "eth": "0x742d35Cc6634C0532925a3b844Bc9e7595f0b1F8",
      "sol": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5vpesT",
      "zec": "t1RxY3vJq4kXSLGcqsqXAiqPGCbA8MsbCp2",
      "xmr": "44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A"
    }
  },
  "projects": [
    {
      "id": "anti-censorship",
      "name": "Anti-Censorship Team",
      "short_desc": "Bridges, pluggable transports, and circumvention tools",
      "matching_eligible_chains": ["btc", "eth", "sol", "zec_t", "xmr"],
      "total_donated_usd": 12450.22,
      "unique_donors": 412,
      "projected_match_usd": 28300.10
    },
    {
      "id": "tor-browser",
      "name": "Tor Browser",
      "short_desc": "The anonymous browser used by millions",
      "matching_eligible_chains": ["btc", "eth", "sol", "zec_t"],
      "total_donated_usd": 18200.00,
      "unique_donors": 689,
      "projected_match_usd": 35100.00
    },
    {
      "id": "arti",
      "name": "Arti — Tor in Rust",
      "short_desc": "Next-generation Tor implementation",
      "matching_eligible_chains": ["btc", "eth", "xmr"],
      "total_donated_usd": 6890.10,
      "unique_donors": 198,
      "projected_match_usd": 14200.00
    }
  ],
  "sponsors": [
    {"name": "Human Rights Foundation", "committed_usd": 25000},
    {"name": "Web3 Privacy Now", "committed_usd": 10000}
  ],
  "recent_donations": [
    {"project_id": "anti-censorship", "chain": "xmr", "amount_usd": 25, "verification_method": "view_key", "minutes_ago": 2},
    {"project_id": "tor-browser", "chain": "btc", "amount_usd": 50, "verification_method": "public", "minutes_ago": 4}
  ]
}
```

Components should accept this data as props — do not hardcode it. A developer will wire it to a polled `snapshot.json`.

---

## 7. Mobile-first requirements (CRITICAL)

Treat mobile as the primary viewport for the donation flow. A large share of crypto donors will arrive from a wallet app or social link on their phone, scan a QR with a second device, or tap a deep link to open their native wallet.

**Layout**
- Design at **390×844 (iPhone 14)** first, then scale up to tablet (768) and desktop (1280+).
- One column on mobile. Sidebars become stacked sections.
- **Sticky bottom CTA** on `/projects/[slug]` and `/matching-pool` so the donate action is always thumb-reachable.

**Touch targets**
- Minimum **44×44pt** for every tappable element (chain tabs, copy buttons, sort toggles, accordion headers).
- Generous spacing between interactive elements — no rage-tap proximity.

**Donation panel on mobile**
- Chain tabs: horizontally scrollable row with snap, **or** a tap-to-open dropdown if more than 5 chains. Selected chain prominently labelled.
- Address: monospace, **full string visible** — wrap to multiple lines, never truncate with `…`. Donors must verify the full address before sending.
- QR code: **minimum 240×240px** so it can be scanned by a second device.
- Copy button: full-width below the address, primary visual weight.
- "Open in wallet" deep link: secondary button below copy, with wallet icons (MetaMask, Phantom, etc.) where the chain supports it.

**Numbers and charts**
- Total counters: large enough to read at arm's length (≥32px on mobile).
- Leaderboard on mobile: ranked list with inline bar fill. No chart library.
- Per-chain breakdown on mobile: legend + percentages, skip the donut/pie.

**Live updates**
- The "X minutes ago" feed must not push layout when new entries arrive. Reserve vertical space.

---

## 8. Accessibility and performance

- **WCAG 2.1 AA**: contrast ratios pass for both light and dark theme.
- All interactions keyboard-navigable. Visible focus rings.
- Respect `prefers-reduced-motion` for the counter animation, recent-feed scroll, and any hover transitions.
- Screen-reader labels for chain icons, copy buttons, and the transparency badge.
- **Performance budget the dev will enforce**: <30KB initial HTML, <200KB hydration JS, FCP <1.0s on 3G. Design with this in mind — no decorative full-bleed video, no heavy hero illustrations.

---

## 9. Light and dark themes

Both required. Default to system preference; remember user override for the session. Match how `torproject.org` behaves.

---

## 10. SEO and social

Each page needs a distinct OG image, title, and meta description. Per-project pages especially — they will be shared on Twitter/Mastodon/Bluesky during the campaign. Design a **per-project OG image template (1200×630)** that takes a project name + projected-match USD as inputs.

---

## 11. Microcopy (use these or adapt)

- **Hero pitch (working draft)**: "31 days. 8 ways to give. Every donation to a Tor project gets matched from the community pool."
- **Matching pool explainer**: "Donations to the matching pool are distributed across all participating projects based on community support. Your contribution multiplies the impact of every donor."
- **Transparency badge tooltip — public**: "This donation was verified directly on a public blockchain."
- **Transparency badge tooltip — view key**: "This donation was verified via a view key the project shared with the campaign. Donor identity remains private."
- **Chain-not-eligible note** (if shown anywhere): "This project doesn't accept matching-eligible donations on this chain. To support them, donate via a chain shown above."

---

## 12. Out of scope (don't design these)

- Wallet-connect flows — donors send from their own wallets externally.
- Account creation, login, profile pages — there are no accounts.
- Comment, like, or reaction features.
- Recurring donation forms — handled by Tor's existing donation site.
- Tax-receipt UX — handled elsewhere.
- Admin/ops UI for the campaign team (separate internal tool).

---

## 13. Iteration plan

After your first pass, prioritize refining in this order:

1. `<DonationPanel>` and `<MatchingPoolPanel>` on mobile — these are load-bearing.
2. `/projects/[slug]` whole-page composition.
3. `/` hero and dual-CTA balance.
4. Leaderboard mobile rendering.
5. Light/dark theme parity.
6. Per-project OG image template.
