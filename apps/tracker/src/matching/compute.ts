/**
 * Square-root matching (quadratic funding) allocator — spec §12.1, §12.2,
 * §12.4.
 *
 *   project_score_P = ( Σ sqrt(total_d_P) for d ∈ donors_P )^2
 *   total_score      = Σ project_score_P
 *   match_P          = (project_score_P / total_score) * TotalMatchingPoolUSD
 *
 * Donor deduplication:
 *   - Public-chain donations: dedupe by `source_address` (per project).
 *   - Privacy-chain donations (no source visible): each donation counts
 *     as its own donor (§12.4).
 *
 * Filters:
 *   - Only rows with `included_in_match = 1` are considered. Sybil-flagged
 *     rows (§12.3) set this to 0 post-review.
 */

export interface MatchingDonationInput {
  readonly project_id: string;
  readonly amount_usd: number;
  readonly verification_method: 'public' | 'view_key';
  readonly source_address: string | null;
  readonly included_in_match: boolean;
}

export interface ProjectMatch {
  readonly score: number;
  readonly projected_match_usd: number;
  readonly unique_donors: number;
  readonly total_donated_usd: number;
}

export interface ComputeArgs {
  readonly donations: readonly MatchingDonationInput[];
  readonly matchingPoolUsd: number;
}

/**
 * Compute the QF allocation against the current matching pool.
 *
 * Returns a map keyed by project_id. Projects with no eligible
 * contributions are absent from the map.
 */
export function computeMatching(args: ComputeArgs): Map<string, ProjectMatch> {
  // Bucket: project -> (donor-key -> summed-USD).
  // Donor-key:
  //   `pub:${source_address}` for public-chain, dedupeable donations
  //   `priv:${i}` for each individual privacy-chain donation (unique)
  const perProject = new Map<string, Map<string, number>>();

  let privacyCounter = 0;
  for (const d of args.donations) {
    if (!d.included_in_match) continue;
    if (d.amount_usd <= 0) continue;

    const donorKey =
      d.verification_method === 'public' && d.source_address !== null
        ? `pub:${d.source_address}`
        : `priv:${privacyCounter++}`;

    let bucket = perProject.get(d.project_id);
    if (bucket === undefined) {
      bucket = new Map<string, number>();
      perProject.set(d.project_id, bucket);
    }
    bucket.set(donorKey, (bucket.get(donorKey) ?? 0) + d.amount_usd);
  }

  // Per-project scores, total score, total USD per project.
  const scores = new Map<
    string,
    { score: number; unique_donors: number; total_donated_usd: number }
  >();
  let totalScore = 0;
  for (const [projectId, donors] of perProject) {
    let sumSqrt = 0;
    let totalUsd = 0;
    for (const amount of donors.values()) {
      sumSqrt += Math.sqrt(amount);
      totalUsd += amount;
    }
    const score = sumSqrt * sumSqrt;
    scores.set(projectId, {
      score,
      unique_donors: donors.size,
      total_donated_usd: totalUsd,
    });
    totalScore += score;
  }

  const out = new Map<string, ProjectMatch>();
  if (totalScore === 0 || args.matchingPoolUsd <= 0) {
    for (const [id, s] of scores) {
      out.set(id, {
        score: s.score,
        projected_match_usd: 0,
        unique_donors: s.unique_donors,
        total_donated_usd: s.total_donated_usd,
      });
    }
    return out;
  }

  for (const [id, s] of scores) {
    const projected = (s.score / totalScore) * args.matchingPoolUsd;
    out.set(id, {
      score: s.score,
      projected_match_usd: projected,
      unique_donors: s.unique_donors,
      total_donated_usd: s.total_donated_usd,
    });
  }
  return out;
}
