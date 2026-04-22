/** Shared prop / data types. Align exactly with snapshot.json. */

export type Chain =
  | 'btc'
  | 'eth'
  | 'usdc-eth'
  | 'usdc-base'
  | 'sol'
  | 'zec_t'   // transparent — publicly verifiable
  | 'zec_z'   // shielded — verified via view key
  | 'xmr';    // verified via view key

export interface ChainAddress {
  /** Human-readable label, e.g. "Bitcoin" */
  label: string;
  /** Ticker for buttons, e.g. "BTC" */
  ticker: string;
  /** Full address — NEVER truncate with ellipsis anywhere in UI. */
  address: string;
  /** Optional BIP21 / wallet URI (bitcoin:..., ethereum:..., solana:...). */
  uri?: string;
  /** Some chains (BNB, Cosmos) require memos; surface a warning. */
  memoRequired?: boolean;
  /** Verification model for the transparency badge. */
  verification: 'public' | 'view_key';
}

export interface WalletDeepLink {
  walletName: string;   // "MetaMask" | "Phantom" | "Cake Wallet" …
  href: string;         // full URI the wallet will intercept
}

export interface Project {
  id: string;
  name: string;
  short_desc: string;
  long_desc_md?: string;
  matching_eligible_chains: Chain[];
  total_donated_usd: number;
  unique_donors: number;
  projected_match_usd: number;
}

export interface MatchingPool {
  total_usd: number;
  by_chain: Partial<Record<Chain, number>>;
  addresses: Record<Chain, ChainAddress>;
}

export interface RecentDonation {
  project_id: string;
  chain: Chain;
  amount_usd: number;
  verification_method: 'public' | 'view_key';
  minutes_ago: number;
}

export interface Sponsor {
  name: string;
  logo_url?: string;
  committed_usd: number;
  outbound_url?: string;
}

export interface Snapshot {
  totals: {
    total_donated_usd: number;
    total_matching_pool_usd: number;
    unique_donors: number;
    donation_count: number;
  };
  matching_pool: MatchingPool;
  projects: Project[];
  sponsors: Sponsor[];
  recent_donations: RecentDonation[];
  /** ISO timestamp of snapshot generation — used for "last updated" chip. */
  generated_at: string;
  campaign: {
    starts_at: string;
    ends_at: string;
  };
}
