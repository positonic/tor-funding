/**
 * Applies any pending Drizzle migrations.
 *
 * Idempotent — drizzle keeps a `__drizzle_migrations` table that tracks
 * which SQL files have already run. Called from `src/index.ts` on startup
 * and available as a standalone entrypoint via `npm run db:migrate`.
 *
 * If the `src/db/migrations/` directory is empty (scaffold state before
 * `npm run db:generate` is run), this is a no-op and logs a hint.
 */

import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { logger } from '../logger.js';
import { openDatabase } from './client.js';

export function runMigrations(): void {
  const { db } = openDatabase();

  // __dirname equivalent under NodeNext ESM.
  const here = dirname(fileURLToPath(import.meta.url));
  const migrationsFolder = resolve(here, 'migrations');

  if (!existsSync(migrationsFolder)) {
    logger.warn(
      { migrationsFolder },
      'migrations folder does not exist — run `npm run db:generate` to create it; continuing with an empty DB'
    );
    return;
  }

  const hasSqlFiles = readdirSync(migrationsFolder).some((f) =>
    f.endsWith('.sql')
  );
  if (!hasSqlFiles) {
    logger.warn(
      'no migration SQL files found in src/db/migrations/ — run `npm run db:generate` to produce them from schema.ts; continuing with an empty DB'
    );
    return;
  }

  migrate(db, { migrationsFolder });
  logger.info('migrations applied');
}

// When invoked directly (`tsx src/db/migrate.ts`), run and exit.
const invokedPath = process.argv[1];
if (invokedPath !== undefined && invokedPath.endsWith('migrate.ts')) {
  runMigrations();
  process.exit(0);
}
