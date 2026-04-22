/**
 * Small Fastify admin/diagnostics HTTP server — spec §14.3 / §17.3 task 24.
 *
 * Internal-only endpoints for ops. Bound to 127.0.0.1 by default. Not
 * the public-facing snapshot transport — that's a static JSON on the CDN.
 *
 * Scaffold endpoint only: `GET /admin/watcher-state`. Auth + the rest of
 * §14.3 lands in §17.10.
 */

import Fastify, { type FastifyInstance } from 'fastify';

import type { Db } from '../db/client.js';
import { logger } from '../logger.js';
import { readAllWatcherState } from '../state/watcher-state.js';

export interface AdminServerOptions {
  readonly db: Db;
  readonly port?: number;
  readonly host?: string;
}

export async function startAdminServer(
  opts: AdminServerOptions
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // we pipe through the process-wide pino
  });

  app.get('/admin/watcher-state', async () => {
    const rows = readAllWatcherState(opts.db);
    // Serialise Date → ISO for JSON.
    return rows.map((r) => ({
      ...r,
      last_processed_timestamp: r.last_processed_timestamp.toISOString(),
      last_run_at: r.last_run_at.toISOString(),
    }));
  });

  app.get('/healthz', async () => ({ ok: true }));

  const port = opts.port ?? Number(process.env.ADMIN_PORT ?? 8080);
  const host = opts.host ?? '127.0.0.1';
  await app.listen({ port, host });
  logger.info({ port, host }, 'admin server listening');
  return app;
}
