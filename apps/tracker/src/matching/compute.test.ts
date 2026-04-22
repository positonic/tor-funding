import { describe, expect, it } from 'vitest';

import { computeMatching, type MatchingDonationInput } from './compute.js';

function pubDonation(
  project_id: string,
  source_address: string,
  amount_usd: number
): MatchingDonationInput {
  return {
    project_id,
    amount_usd,
    verification_method: 'public',
    source_address,
    included_in_match: true,
  };
}

function privDonation(
  project_id: string,
  amount_usd: number
): MatchingDonationInput {
  return {
    project_id,
    amount_usd,
    verification_method: 'view_key',
    source_address: null,
    included_in_match: true,
  };
}

describe('computeMatching', () => {
  it('allocates the full pool to a single project when it is alone', () => {
    const result = computeMatching({
      donations: [pubDonation('solo', '0xA', 100)],
      matchingPoolUsd: 10_000,
    });
    const solo = result.get('solo');
    expect(solo).toBeDefined();
    expect(solo?.projected_match_usd).toBeCloseTo(10_000, 6);
  });

  it('splits the pool 50/50 when two projects have identical donor sets', () => {
    const result = computeMatching({
      donations: [
        pubDonation('a', '0xA', 50),
        pubDonation('a', '0xB', 50),
        pubDonation('b', '0xC', 50),
        pubDonation('b', '0xD', 50),
      ],
      matchingPoolUsd: 1000,
    });
    expect(result.get('a')?.projected_match_usd).toBeCloseTo(500, 6);
    expect(result.get('b')?.projected_match_usd).toBeCloseTo(500, 6);
  });

  it('QF: many small donors beat few big donors for the same total', () => {
    // Project "many": 10 donors × $10 each  → total $100
    // Project "few":   1 donor  × $100      → total $100
    const manyDonations: MatchingDonationInput[] = Array.from(
      { length: 10 },
      (_, i) => pubDonation('many', `0xMany${i}`, 10)
    );
    const fewDonations: MatchingDonationInput[] = [
      pubDonation('few', '0xFew', 100),
    ];

    const result = computeMatching({
      donations: [...manyDonations, ...fewDonations],
      matchingPoolUsd: 1000,
    });

    const many = result.get('many');
    const few = result.get('few');
    expect(many).toBeDefined();
    expect(few).toBeDefined();
    // QF property: (sum sqrt)^2 for 10×$10 = (10*sqrt(10))^2 = 1000
    //              (sum sqrt)^2 for 1×$100 = (sqrt(100))^2 = 100
    // So "many" should get ~10x the match of "few".
    expect(many?.score).toBeCloseTo(1000, 6);
    expect(few?.score).toBeCloseTo(100, 6);
    expect(many!.projected_match_usd).toBeGreaterThan(
      few!.projected_match_usd * 9
    );
  });

  it('dedupes public-chain donors by source_address (same donor → one bucket)', () => {
    // Two $50 donations from the same address should behave like one $100
    // donation (sqrt(100))^2 = 100, not (sqrt(50)+sqrt(50))^2 = 200.
    const result = computeMatching({
      donations: [
        pubDonation('p', '0xA', 50),
        pubDonation('p', '0xA', 50),
      ],
      matchingPoolUsd: 1000,
    });
    expect(result.get('p')?.score).toBeCloseTo(100, 6);
    expect(result.get('p')?.unique_donors).toBe(1);
  });

  it('treats each privacy-chain donation as a unique donor (§12.4)', () => {
    const result = computeMatching({
      donations: [privDonation('p', 50), privDonation('p', 50)],
      matchingPoolUsd: 1000,
    });
    // Two "unique" donors of $50 each:
    // (sqrt(50) + sqrt(50))^2 = 200
    expect(result.get('p')?.score).toBeCloseTo(200, 6);
    expect(result.get('p')?.unique_donors).toBe(2);
  });

  it('skips rows where included_in_match is false', () => {
    const result = computeMatching({
      donations: [
        pubDonation('p', '0xA', 100),
        {
          project_id: 'p',
          amount_usd: 1000000,
          verification_method: 'public',
          source_address: '0xB',
          included_in_match: false,
        },
      ],
      matchingPoolUsd: 1000,
    });
    expect(result.get('p')?.total_donated_usd).toBe(100);
    expect(result.get('p')?.unique_donors).toBe(1);
  });

  it('returns zero-match entries when the pool is empty', () => {
    const result = computeMatching({
      donations: [pubDonation('p', '0xA', 100)],
      matchingPoolUsd: 0,
    });
    expect(result.get('p')?.projected_match_usd).toBe(0);
    expect(result.get('p')?.total_donated_usd).toBe(100);
  });
});
