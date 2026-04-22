import type { Config } from 'drizzle-kit';

/**
 * Drizzle Kit config.
 *
 * Regenerate SQL after any change to `src/db/schema.ts`:
 *   npm run db:generate
 *
 * Apply migrations at runtime via:
 *   npm run db:migrate
 */
export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'data/tor-campaign.sqlite',
  },
  strict: true,
  verbose: true,
} satisfies Config;
