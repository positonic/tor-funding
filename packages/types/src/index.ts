/**
 * `@tor/types` — shared contract between the tracker (writer of
 * `snapshot.json`) and the web app (reader). See spec §13.1.
 *
 * Any change here must ship in one PR that updates both consumers; both
 * sides typecheck against this package.
 */

import type { Chain } from './chains.js';

export type { Chain } from './chains.js';
export { CHAINS, CHAIN_LABELS, CHAIN_VERIFICATION } from './chains.js';

/**
 * A single on-chain address the campaign can receive to, plus enough
 * metadata for the UI to build a wallet URI, render a QR, and show a
 * transparency badge without having to know the chain's idiosyncrasies.
 */
export interface ChainAddress {
  /** Human-readable chain label, e.g. "Bitcoin". */
  readonly label: string;
  /** Short ticker for buttons, e.g. "BTC", "ZEC-t". */
  readonly ticker: string;
  /**
   * Full address string. NEVER truncate with ellipsis anywhere in the UI —
   * donors verify the full string before sending (see CLAUDE.md contract 1).
   */
  readonly address: string;
  /**
   * Optional wallet-intercepted URI (BIP21 / EIP-681 / solana: / etc).
   * Present only when the chain has a widely-supported URI scheme.
   */
  readonly uri?: string;
  /**
   * Some chains (BNB, Cosmos) require a memo alongside the address —
   * surface a warning if true.
   */
  readonly memoRequired?: boolean;
  /** Drives the `<TransparencyBadge>` copy and icon. */
  readonly verification: 'public' | 'view_key';
}

/**
 * A "deep link" entry for a known wallet app. Populated client-side by
 * the donation panel, not stored in the snapshot.
 */
export interface WalletDeepLink {
  readonly walletName: string;
  readonly href: string;
}

/**
 * A single project (funding recipient) inside the round.
 *
 * Superset of the design-handoff type: adds `long_desc_md`,
 * `donation_addresses`, and `by_chain` that the spec §13.1 JSON example
 * requires but the handoff types.ts omitted.
 */
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly short_desc: string;
  /** Markdown body rendered on the project detail page. Baked at build time. */
  readonly long_desc_md?: string;
  /** Chains where donations contribute to the QF match calculation. */
  readonly matching_eligible_chains: readonly Chain[];
  /** Addresses the donation panel renders tabs for. */
  readonly donation_addresses: Readonly<Partial<Record<Chain, ChainAddress>>>;
  /** USD raised so far across all chains. */
  readonly total_donated_usd: number;
  /** Distinct donors across all chains. */
  readonly unique_donors: number;
  /** Projected QF match given the current pool + contributions. */
  readonly projected_match_usd: number;
  /** USD raised per chain for this project (used by `<ChainBreakdown>`). */
  readonly by_chain: Readonly<Partial<Record<Chain, number>>>;
}

/**
 * The matching pool itself — total, per-chain balance, and public
 * receiving addresses so the `/matching-pool` page can render the same
 * donation panel UI as a project page.
 *
 * NOTE on shape: spec §13.1 shows a flatter `Record<string, string>` for
 * `addresses`, but the web app needs `uri`, `label`, `ticker`, and
 * `verification` to render QR codes and the TransparencyBadge. We use
 * the richer `ChainAddress` form; the tracker writer emits this form.
 */
export interface MatchingPool {
  readonly total_usd: number;
  readonly by_chain: Readonly<Partial<Record<Chain, number>>>;
  readonly addresses: Readonly<Partial<Record<Chain, ChainAddress>>>;
}

/** A single recent donation entry for the `<RecentFeed>`. */
export interface RecentDonation {
  readonly project_id: string;
  readonly chain: Chain;
  readonly amount_usd: number;
  readonly verification_method: 'public' | 'view_key';
  /** Minutes since the donation was observed on-chain. */
  readonly minutes_ago: number;
}

/**
 * A single recent matching-pool contribution entry. Distinct from
 * `RecentDonation` because matching contributions are pool-funding
 * (not project-funding) and may carry an attributed sponsor name.
 */
export interface RecentMatchingContribution {
  readonly chain: Chain;
  readonly amount_usd: number;
  readonly verification_method: 'public' | 'view_key';
  /** Attributed sponsor when the contribution came from a known source. */
  readonly sponsor_name?: string;
  /** Minutes since the contribution was observed on-chain. */
  readonly minutes_ago: number;
}

/** A sponsor organization committed to the matching pool. */
export interface Sponsor {
  readonly name: string;
  readonly logo_url?: string;
  readonly committed_usd: number;
  readonly outbound_url?: string;
}

/** Top-level totals surfaced in `<CampaignHero>` and `<MatchingPoolCard>`. */
export interface Totals {
  readonly total_donated_usd: number;
  readonly total_matching_pool_usd: number;
  readonly unique_donors: number;
  /** Count of project donations. */
  readonly donation_count: number;
  /** Count of matching-pool contributions (separate from `donation_count`). */
  readonly matching_contribution_count: number;
}

/** Campaign window — rendered in the hero and used for the countdown. */
export interface Campaign {
  readonly name?: string;
  /** ISO 8601 timestamp. */
  readonly starts_at: string;
  /** ISO 8601 timestamp. */
  readonly ends_at: string;
}

/**
 * The full `snapshot.json` contract. Written by the tracker every 60s,
 * consumed by the web app via TanStack Query with a 60s refresh.
 *
 * Keep this shape stable — any change is a coordinated deploy of
 * `@tor/tracker` and `@tor/web`.
 */
export interface Snapshot {
  /** ISO 8601 timestamp of snapshot generation. Used for "last updated" chip. */
  readonly generated_at: string;
  readonly campaign: Campaign;
  readonly totals: Totals;
  readonly matching_pool: MatchingPool;
  readonly projects: readonly Project[];
  readonly sponsors: readonly Sponsor[];
  readonly recent_donations: readonly RecentDonation[];
  readonly recent_matching_contributions: readonly RecentMatchingContribution[];
}
