/**
 * Tracker entry point. Long-running process.
 *
 * Startup sequence (spec §14):
 *   1. Load config YAMLs (projects + matching pool), validate with zod.
 *   2. Open DB, apply migrations.
 *   3. Seed projects / donation_addresses / matching_pool_addresses /
 *      watcher_state (idempotent).
 *   4. Resolve view-key secret refs into memory — fail fast on missing.
 *   5. Construct one EVM watcher per EVM (chain, address) target. Other
 *      chains are TODO per §17.4 tasks 29–35.
 *   6. Register node-cron jobs:
 *        - snapshot:write every 60s (spec §14.2)
 *   7. Start the Fastify admin server on $ADMIN_PORT (default 8080).
 *   8. Log a structured startup line.
 */

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import cron from 'node-cron';

import {
  loadMatchingPoolConfig,
  loadProjectsConfig,
} from './config/load.js';
import { seedFromConfig, type SeedResult } from './config/seed.js';
import { openDatabase } from './db/client.js';
import { runMigrations } from './db/migrate.js';
import { logger } from './logger.js';
import { CoinGeckoClient } from './prices/coingecko.js';
import { createSecretStore } from './secrets/store.js';
import { generateSnapshot } from './snapshot/generate.js';
import { publishSnapshot } from './snapshot/publish.js';
import { startAdminServer } from './admin/server.js';
import { EvmWatcher, type EvmChain } from './watchers/evm.js';
import type { BaseWatcher } from './watchers/base-watcher.js';

const EVM_CHAINS = new Set<string>(['eth', 'arb', 'base', 'op']);

function resolveConfigPath(envVar: string, fallback: string): string {
  const envVal = process.env[envVar];
  if (envVal !== undefined && envVal !== '') {
    return resolve(envVal);
  }
  // From src/index.ts (tsx) or dist/index.js (build), walk up to the
  // app root and then to the repo-root `config/`.
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, fallback);
}

async function main(): Promise<void> {
  logger.info('tracker starting');

  // 1. Load config.
  // Fallbacks are relative to this module:
  //   tsx dev:     apps/tracker/src/index.ts     → ../../../config/...
  //   built dist:  apps/tracker/dist/index.js    → ../../../config/...
  // Both land at the repo-root `config/` directory.
  const projectsPath = resolveConfigPath(
    'PROJECTS_CONFIG_PATH',
    '../../../config/projects.yaml'
  );
  const poolPath = resolveConfigPath(
    'MATCHING_POOL_CONFIG_PATH',
    '../../../config/matching-pool.yaml'
  );
  const projectsConfig = loadProjectsConfig(projectsPath);
  const poolConfig = loadMatchingPoolConfig(poolPath);
  logger.info(
    {
      projects: projectsConfig.projects.length,
      pool_chains: Object.keys(poolConfig.pool.addresses).length,
    },
    'config loaded'
  );

  // 2. DB + migrations.
  const { db } = openDatabase();
  runMigrations();

  // 3. Seed. Wrapped because the very first `npm run dev:tracker` after a
  //    fresh clone has no generated migrations — we want a clear hint
  //    instead of a stack trace.
  let seed: SeedResult;
  try {
    seed = seedFromConfig(db, projectsConfig, poolConfig);
  } catch (err) {
    const msg = (err as Error).message;
    if (/no such table/i.test(msg)) {
      logger.fatal(
        'no DB tables found — run `npm run db:generate` once to produce migration SQL from src/db/schema.ts, then restart'
      );
      process.exit(2);
    }
    throw err;
  }

  // 4. Secrets (view keys, etc).
  const secrets = createSecretStore();
  if (seed.view_key_refs.length > 0) {
    secrets.resolveAllAtStartup(seed.view_key_refs);
  } else {
    logger.info('no view-key refs in config — skipping secret resolution');
  }

  // 5. Watchers.
  const priceClient = new CoinGeckoClient();
  const watchers: BaseWatcher[] = [];
  let evmCount = 0;
  let stubbedCount = 0;
  for (const t of seed.watcher_targets) {
    if (EVM_CHAINS.has(t.chain)) {
      const w = new EvmWatcher({
        db,
        chain: t.chain as EvmChain,
        address: t.address,
        watcherKind: t.watcher_kind,
        priceClient,
        confirmationDepth: 2, // spec §9.2 — ≥ 2 blocks
        projectId: t.project_id,
      });
      watchers.push(w);
      evmCount++;
    } else {
      // Other chains: BTC (§9.1), Solana (§9.3), Zcash (§9.4/§9.5),
      // Monero (§9.6) — TODO §17.4 tasks 29–35.
      stubbedCount++;
    }
  }
  for (const w of watchers) w.start();
  logger.info(
    {
      evm_watchers: evmCount,
      stubbed_targets: stubbedCount,
    },
    'watchers started'
  );

  // 6. Cron.
  const campaign = {
    // Placeholder window until it is surfaced through config.
    // Spec §16: round runs May 19 – Jun 19, 2026.
    starts_at: '2026-05-19T12:00:00Z',
    ends_at: '2026-06-19T12:00:00Z',
  };

  const writeSnapshotNow = (): void => {
    try {
      const snap = generateSnapshot({
        db,
        projectsConfig,
        poolConfig,
        campaign,
      });
      publishSnapshot(snap);
    } catch (err) {
      logger.error({ err: (err as Error).message }, 'snapshot write failed');
    }
  };

  // Every 60s per §14.2 (5-field cron — every minute).
  cron.schedule('* * * * *', writeSnapshotNow);
  // And once at boot so consumers see initial state.
  writeSnapshotNow();

  // 7. Admin server.
  await startAdminServer({ db });

  // 8. Ready.
  logger.info('tracker ready');
}

main().catch((err: unknown) => {
  logger.fatal({ err: (err as Error).message }, 'tracker failed to start');
  process.exit(1);
});
