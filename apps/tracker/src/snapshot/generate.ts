/**
 * Snapshot generator — spec §13.1 + §17.3 task 19.
 *
 * Reads the database, computes QF projections via
 * `matching/compute.ts`, and emits an object matching the `Snapshot`
 * contract from `@tor/types`. Atomic write happens in `publish.ts`.
 */

import { desc, eq } from 'drizzle-orm';

import type {
  Chain,
  ChainAddress,
  MatchingPool,
  Project,
  RecentDonation,
  RecentMatchingContribution,
  Snapshot,
  Sponsor,
  Totals,
} from '@tor/types';

import type { Db } from '../db/client.js';
import {
  donations,
  match_sponsors,
  matching_contributions,
} from '../db/schema.js';
import { computeMatching } from '../matching/compute.js';
import type { MatchingPoolConfig, ProjectsConfig } from '../config/load.js';

export interface GenerateSnapshotArgs {
  readonly db: Db;
  readonly projectsConfig: ProjectsConfig;
  readonly poolConfig: MatchingPoolConfig;
  readonly campaign: { readonly starts_at: string; readonly ends_at: string };
  readonly now?: Date;
}

const KNOWN_CHAINS = new Set<Chain>([
  'btc',
  'eth',
  'usdc-eth',
  'usdc-base',
  'sol',
  'zec_t',
  'zec_z',
  'xmr',
]);

function asChain(value: string): Chain | null {
  return KNOWN_CHAINS.has(value as Chain) ? (value as Chain) : null;
}

function minutesAgo(ts: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - ts.getTime()) / 60_000));
}

export function generateSnapshot(args: GenerateSnapshotArgs): Snapshot {
  const { db, projectsConfig, poolConfig } = args;
  const now = args.now ?? new Date();

  // -------------------------------------------------------------------------
  // 1. Pull donations + matching contributions from the DB.
  // -------------------------------------------------------------------------
  const donationRows = db.select().from(donations).all();
  const contributionRows = db.select().from(matching_contributions).all();
  const sponsorRows = db
    .select()
    .from(match_sponsors)
    .where(eq(match_sponsors.public, true))
    .all();

  // -------------------------------------------------------------------------
  // 2. Matching pool totals (§11.5).
  // -------------------------------------------------------------------------
  const poolByChain: Partial<Record<Chain, number>> = {};
  let poolTotal = 0;
  for (const c of contributionRows) {
    const chain = asChain(c.chain);
    if (chain === null) continue;
    poolTotal += c.amount_usd;
    poolByChain[chain] = (poolByChain[chain] ?? 0) + c.amount_usd;
  }

  // -------------------------------------------------------------------------
  // 3. Matching pool addresses from config.
  // -------------------------------------------------------------------------
  const poolAddresses: Partial<Record<Chain, ChainAddress>> = {};
  for (const [chainStr, addr] of Object.entries(poolConfig.pool.addresses)) {
    const chain = asChain(chainStr);
    if (chain === null || addr === undefined) continue;
    poolAddresses[chain] = {
      label: addr.label,
      ticker: addr.ticker,
      address: addr.address,
      verification: addr.verification,
      uri: addr.uri_scheme
        ? `${addr.uri_scheme}:${addr.address}`
        : undefined,
    };
  }

  const matching_pool: MatchingPool = {
    total_usd: poolTotal,
    by_chain: poolByChain,
    addresses: poolAddresses,
  };

  // -------------------------------------------------------------------------
  // 4. QF match projection per project.
  // -------------------------------------------------------------------------
  const qf = computeMatching({
    donations: donationRows.map((d) => ({
      project_id: d.project_id,
      amount_usd: d.amount_usd,
      verification_method: d.verification_method,
      source_address: d.source_address,
      included_in_match: d.included_in_match,
    })),
    matchingPoolUsd: poolTotal,
  });

  // -------------------------------------------------------------------------
  // 5. Per-project snapshots.
  // -------------------------------------------------------------------------
  const byProjectTotals = new Map<string, Partial<Record<Chain, number>>>();
  for (const d of donationRows) {
    const chain = asChain(d.chain);
    if (chain === null) continue;
    let m = byProjectTotals.get(d.project_id);
    if (m === undefined) {
      m = {};
      byProjectTotals.set(d.project_id, m);
    }
    m[chain] = (m[chain] ?? 0) + d.amount_usd;
  }

  const projectAddressesByProject = new Map<
    string,
    Partial<Record<Chain, ChainAddress>>
  >();
  for (const p of projectsConfig.projects) {
    const inner: Partial<Record<Chain, ChainAddress>> = {};
    for (const [chainStr, addr] of Object.entries(p.donation_addresses)) {
      const chain = asChain(chainStr);
      if (chain === null || addr === undefined) continue;
      inner[chain] = {
        label: addr.label,
        ticker: addr.ticker,
        address: addr.address,
        verification: addr.verification,
        uri: addr.uri_scheme
          ? `${addr.uri_scheme}:${addr.address}`
          : undefined,
      };
    }
    projectAddressesByProject.set(p.id, inner);
  }

  const projectSnapshots: Project[] = projectsConfig.projects
    .filter((p) => p.active)
    .sort((a, b) => a.order_index - b.order_index)
    .map((p) => {
      const match = qf.get(p.id);
      const eligible = p.matching_eligible_chains.filter((c) =>
        asChain(c)
      ) as readonly Chain[];
      const addresses = projectAddressesByProject.get(p.id) ?? {};
      return {
        id: p.id,
        name: p.name,
        short_desc: p.short_desc,
        long_desc_md: p.long_desc_md,
        matching_eligible_chains: eligible,
        donation_addresses: addresses,
        total_donated_usd: match?.total_donated_usd ?? 0,
        unique_donors: match?.unique_donors ?? 0,
        projected_match_usd: match?.projected_match_usd ?? 0,
        by_chain: byProjectTotals.get(p.id) ?? {},
      };
    });

  // -------------------------------------------------------------------------
  // 6. Totals (project donations only; pool stays separate per §13.1).
  // -------------------------------------------------------------------------
  const totalDonatedUsd = donationRows.reduce(
    (acc, d) => acc + d.amount_usd,
    0
  );
  const uniqueDonors = countUniqueDonors(donationRows);

  const totals: Totals = {
    total_donated_usd: totalDonatedUsd,
    total_matching_pool_usd: poolTotal,
    unique_donors: uniqueDonors,
    donation_count: donationRows.length,
    matching_contribution_count: contributionRows.length,
  };

  // -------------------------------------------------------------------------
  // 7. Recent feeds (top 20 DESC by block_timestamp).
  // -------------------------------------------------------------------------
  const recentDonationRows = db
    .select()
    .from(donations)
    .orderBy(desc(donations.block_timestamp))
    .limit(20)
    .all();
  const recent_donations: RecentDonation[] = recentDonationRows
    .map((d) => {
      const chain = asChain(d.chain);
      if (chain === null) return null;
      return {
        project_id: d.project_id,
        chain,
        amount_usd: d.amount_usd,
        verification_method: d.verification_method,
        minutes_ago: minutesAgo(d.block_timestamp, now),
      } satisfies RecentDonation;
    })
    .filter((x): x is RecentDonation => x !== null);

  const recentContribRows = db
    .select({
      row: matching_contributions,
      sponsor_name: match_sponsors.name,
    })
    .from(matching_contributions)
    .leftJoin(
      match_sponsors,
      eq(matching_contributions.sponsor_id, match_sponsors.id)
    )
    .orderBy(desc(matching_contributions.block_timestamp))
    .limit(20)
    .all();

  const recent_matching_contributions: RecentMatchingContribution[] =
    recentContribRows.flatMap((r): RecentMatchingContribution[] => {
      const chain = asChain(r.row.chain);
      if (chain === null) return [];
      const entry: RecentMatchingContribution = {
        chain,
        amount_usd: r.row.amount_usd,
        verification_method: r.row.verification_method,
        minutes_ago: minutesAgo(r.row.block_timestamp, now),
        ...(r.sponsor_name !== null ? { sponsor_name: r.sponsor_name } : {}),
      };
      return [entry];
    });

  // -------------------------------------------------------------------------
  // 8. Sponsors.
  // -------------------------------------------------------------------------
  const sponsors: Sponsor[] = sponsorRows
    .sort((a, b) => a.order_index - b.order_index)
    .map((s) => ({
      name: s.name,
      committed_usd: s.committed_usd ?? 0,
      logo_url: s.logo_url ?? undefined,
    }));

  const snap: Snapshot = {
    generated_at: now.toISOString(),
    campaign: {
      starts_at: args.campaign.starts_at,
      ends_at: args.campaign.ends_at,
    },
    totals,
    matching_pool,
    projects: projectSnapshots,
    sponsors,
    recent_donations,
    recent_matching_contributions,
  };
  return snap;
}

function countUniqueDonors(
  rows: readonly { source_address: string | null; verification_method: string }[]
): number {
  const seen = new Set<string>();
  let privacyCount = 0;
  for (const r of rows) {
    if (r.verification_method === 'public' && r.source_address !== null) {
      seen.add(r.source_address);
    } else {
      privacyCount++;
    }
  }
  return seen.size + privacyCount;
}

