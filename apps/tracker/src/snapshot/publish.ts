/**
 * Atomic snapshot publisher.
 *
 * Writes JSON to `$SNAPSHOT_OUTPUT_PATH + ".tmp"` and then renames it
 * into place. Rename is atomic on POSIX, so readers (the TPA CDN sync
 * sidecar, or `next dev` during local testing) never observe a
 * partially-written file.
 *
 * The transport from `$SNAPSHOT_OUTPUT_PATH` to the static CDN is a TPA
 * concern (§17.1 tasks 6 and 8). We just drop a well-formed file on
 * disk at a predictable location.
 */

import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { Snapshot } from '@tor/types';

import { logger } from '../logger.js';

export function publishSnapshot(
  snapshot: Snapshot,
  outputPath?: string
): string {
  const target = resolve(
    outputPath ?? process.env.SNAPSHOT_OUTPUT_PATH ?? './out/snapshot.json'
  );
  mkdirSync(dirname(target), { recursive: true });

  const tmp = `${target}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  renameSync(tmp, target);

  logger.info(
    {
      path: target,
      projects: snapshot.projects.length,
      total_usd: snapshot.totals.total_donated_usd,
      pool_usd: snapshot.totals.total_matching_pool_usd,
    },
    'snapshot published'
  );
  return target;
}
