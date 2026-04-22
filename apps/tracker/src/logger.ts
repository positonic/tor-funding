/**
 * Process-wide pino logger.
 *
 * CRITICAL (CLAUDE.md contract §3 + spec §10.3): view keys, secret
 * values, and API keys MUST NEVER appear in log output. The redaction
 * config below censors the well-known key names we use. Any new sensitive
 * field name MUST be added to `REDACT_PATHS`.
 *
 * Redaction uses pino's path syntax — it matches at any depth via `*`.
 */

import { pino } from 'pino';

/** Field names that must never be logged as values. */
const REDACT_PATHS = [
  'view_key',
  'private_view_key',
  'viewKey',
  'secret',
  'secrets',
  'api_key',
  'apiKey',
  'password',
  'authorization',
  // Nested (e.g. `config.addresses.xmr.view_key_secret_ref` is OK — it's a
  // ref, not the key — but resolved values must never land under any
  // `view_key*` or `secret*` field).
  '*.view_key',
  '*.private_view_key',
  '*.viewKey',
  '*.secret',
  '*.api_key',
  '*.apiKey',
  '*.password',
  '*.authorization',
];

const level = process.env.LOG_LEVEL ?? 'info';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level,
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
    remove: false,
  },
  base: {
    service: 'tor-tracker',
  },
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname,service',
          },
        },
      }
    : {}),
});

export type Logger = typeof logger;
