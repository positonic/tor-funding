/**
 * Idempotently seed the DB with rows derived from `config/projects.yaml`
 * and `config/matching-pool.yaml`. §17.2 task 12.
 *
 * All inserts use ON CONFLICT DO NOTHING. Rerunning at startup is a no-op
 * after the first run.
 *
 * We seed:
 *  - `projects`
 *  - `donation_addresses` (one per chain per project)
 *  - `matching_pool_addresses` (one per chain)
 *  - `watcher_state` (one per (chain, address, watcher_kind) pair)
 */

import type { Db } from '../db/client.js';
import {
  donation_addresses,
  matching_pool_addresses,
  projects,
} from '../db/schema.js';
import { logger } from '../logger.js';
import type { MatchingPoolConfig, ProjectsConfig } from './load.js';
import { seedWatcherState } from '../state/watcher-state.js';

export interface SeedResult {
  readonly watcher_targets: readonly {
    readonly chain: string;
    readonly address: string;
    readonly watcher_kind: 'project_donation' | 'matching_pool';
    readonly asset: string;
    /** Populated for project watchers only; undefined for pool watchers. */
    readonly project_id?: string;
    readonly view_key_secret_ref?: string | null;
  }[];
  readonly view_key_refs: readonly string[];
}

/**
 * Map from a config address entry to the asset string we store on
 * donations/contributions. For native tokens the asset matches the
 * ticker; for USDC on an EVM the config uses "USDC" and `chain` is
 * `usdc-eth` / `usdc-base`.
 */
function assetFromConfig(ticker: string): string {
  // Strip the "-t" / "-z" suffix used for display (e.g. ZEC-t -> ZEC).
  return ticker.replace(/-[tz]$/, '');
}

export function seedFromConfig(
  db: Db,
  projectsConfig: ProjectsConfig,
  poolConfig: MatchingPoolConfig
): SeedResult {
  const targets: SeedResult['watcher_targets'][number][] = [];
  const viewKeyRefs: string[] = [];
  const now = new Date(0);

  // -------------------------------------------------------------------------
  // Projects.
  // -------------------------------------------------------------------------
  for (const p of projectsConfig.projects) {
    db.insert(projects)
      .values({
        id: p.id,
        name: p.name,
        short_desc: p.short_desc,
        long_desc_md: p.long_desc_md,
        order_index: p.order_index,
        active: p.active,
      })
      .onConflictDoNothing({ target: projects.id })
      .run();

    for (const [chain, addr] of Object.entries(p.donation_addresses)) {
      if (addr === undefined) continue;
      const asset = assetFromConfig(addr.ticker);
      db.insert(donation_addresses)
        .values({
          project_id: p.id,
          chain,
          asset,
          address: addr.address,
          label: addr.label,
          is_matching_eligible: addr.is_matching_eligible,
          view_key_secret_ref: addr.view_key_secret_ref ?? null,
          active: true,
        })
        .onConflictDoNothing({
          target: [
            donation_addresses.chain,
            donation_addresses.asset,
            donation_addresses.address,
          ],
        })
        .run();

      if (addr.view_key_secret_ref !== undefined) {
        viewKeyRefs.push(addr.view_key_secret_ref);
      }

      seedWatcherState(db, {
        chain,
        address: addr.address,
        watcher_kind: 'project_donation',
        last_processed_height: null,
        last_processed_timestamp: now,
      });

      targets.push({
        chain,
        address: addr.address,
        watcher_kind: 'project_donation',
        asset,
        project_id: p.id,
        view_key_secret_ref: addr.view_key_secret_ref ?? null,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Matching pool.
  // -------------------------------------------------------------------------
  for (const [chain, addr] of Object.entries(poolConfig.pool.addresses)) {
    if (addr === undefined) continue;
    const asset = assetFromConfig(addr.ticker);
    db.insert(matching_pool_addresses)
      .values({
        chain,
        asset,
        address: addr.address,
        label: addr.label,
        is_matching_eligible: true,
        view_key_secret_ref: addr.view_key_secret_ref ?? null,
        active: true,
      })
      .onConflictDoNothing({
        target: [
          matching_pool_addresses.chain,
          matching_pool_addresses.asset,
          matching_pool_addresses.address,
        ],
      })
      .run();

    if (addr.view_key_secret_ref !== undefined) {
      viewKeyRefs.push(addr.view_key_secret_ref);
    }

    seedWatcherState(db, {
      chain,
      address: addr.address,
      watcher_kind: 'matching_pool',
      last_processed_height: null,
      last_processed_timestamp: now,
    });

    targets.push({
      chain,
      address: addr.address,
      watcher_kind: 'matching_pool',
      asset,
      view_key_secret_ref: addr.view_key_secret_ref ?? null,
    });
  }

  logger.info(
    {
      projects: projectsConfig.projects.length,
      watcher_targets: targets.length,
      view_key_refs: viewKeyRefs.length,
    },
    'seed complete'
  );

  return { watcher_targets: targets, view_key_refs: viewKeyRefs };
}
