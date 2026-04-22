/**
 * Drizzle schema for the donation tracker.
 *
 * Mirrors the SQL in `docs/tech-spec-v3.1.md` §8 exactly. When this file
 * changes, regenerate migration SQL:
 *
 *     npm run db:generate
 *
 * Design choices worth flagging:
 *  - `amount_native` is stored as TEXT so chain-native atomic units
 *    (satoshis, wei, piconero, lamports) keep full precision. JS
 *    numbers lose precision above 2^53 — wei routinely exceeds that.
 *  - `amount_usd` is REAL — cents-level precision is fine for display /
 *    matching math.
 *  - `timestamp` columns are stored as Unix-second INTEGERs rather than
 *    SQLite's TEXT timestamp format. Easier to do arithmetic on, and the
 *    snapshot writer renders ISO strings at publish time.
 *  - UNIQUE constraints on (chain, tx_hash, project_id) and (chain, tx_hash)
 *    are the dedupe primitive — watchers insert blindly and catch UNIQUE
 *    violations as "already processed." See §14.4.
 */

import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// ---------------------------------------------------------------------------
// §8.1 projects
// ---------------------------------------------------------------------------

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  short_desc: text('short_desc').notNull(),
  long_desc_md: text('long_desc_md').notNull(),
  order_index: integer('order_index').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// §8.2 donation_addresses
// ---------------------------------------------------------------------------

export const donation_addresses = sqliteTable(
  'donation_addresses',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    project_id: text('project_id')
      .notNull()
      .references(() => projects.id),
    chain: text('chain').notNull(),
    asset: text('asset').notNull(),
    address: text('address').notNull(),
    label: text('label'),
    is_matching_eligible: integer('is_matching_eligible', { mode: 'boolean' })
      .notNull()
      .default(false),
    /** Opaque reference (vault://...) — never the key itself. */
    view_key_secret_ref: text('view_key_secret_ref'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => ({
    unique_chain_asset_address: uniqueIndex(
      'donation_addresses_chain_asset_address_unique'
    ).on(t.chain, t.asset, t.address),
  })
);

// ---------------------------------------------------------------------------
// §8.3 matching_pool_addresses
// ---------------------------------------------------------------------------

export const matching_pool_addresses = sqliteTable(
  'matching_pool_addresses',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chain: text('chain').notNull(),
    asset: text('asset').notNull(),
    address: text('address').notNull(),
    label: text('label'),
    is_matching_eligible: integer('is_matching_eligible', { mode: 'boolean' })
      .notNull()
      .default(true),
    view_key_secret_ref: text('view_key_secret_ref'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => ({
    unique_chain_asset_address: uniqueIndex(
      'matching_pool_addresses_chain_asset_address_unique'
    ).on(t.chain, t.asset, t.address),
  })
);

// ---------------------------------------------------------------------------
// §8.4 donations
// ---------------------------------------------------------------------------

export const donations = sqliteTable(
  'donations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    project_id: text('project_id')
      .notNull()
      .references(() => projects.id),
    chain: text('chain').notNull(),
    asset: text('asset').notNull(),
    /** Nullable for some XMR cases (aggregated scan results). */
    tx_hash: text('tx_hash'),
    block_height: integer('block_height'),
    block_timestamp: integer('block_timestamp', { mode: 'timestamp' }).notNull(),
    /** Nullable for XMR / shielded ZEC — no source visible. */
    source_address: text('source_address'),
    /** Atomic units as string — see header comment. */
    amount_native: text('amount_native').notNull(),
    amount_usd: real('amount_usd').notNull(),
    price_source: text('price_source').notNull(),
    verification_method: text('verification_method', {
      enum: ['public', 'view_key'],
    }).notNull(),
    included_in_match: integer('included_in_match', { mode: 'boolean' })
      .notNull()
      .default(true),
    indexed_at: integer('indexed_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    /** §14.4 dedupe primitive. */
    unique_chain_tx_project: uniqueIndex(
      'donations_chain_tx_project_unique'
    ).on(t.chain, t.tx_hash, t.project_id),
    idx_donations_project: index('idx_donations_project').on(t.project_id),
    idx_donations_timestamp: index('idx_donations_timestamp').on(
      t.block_timestamp
    ),
    verification_check: check(
      'donations_verification_method_check',
      sql`${t.verification_method} IN ('public', 'view_key')`
    ),
  })
);

// ---------------------------------------------------------------------------
// §8.5 matching_contributions
// ---------------------------------------------------------------------------

export const matching_contributions = sqliteTable(
  'matching_contributions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chain: text('chain').notNull(),
    asset: text('asset').notNull(),
    tx_hash: text('tx_hash'),
    block_height: integer('block_height'),
    block_timestamp: integer('block_timestamp', { mode: 'timestamp' }).notNull(),
    source_address: text('source_address'),
    amount_native: text('amount_native').notNull(),
    amount_usd: real('amount_usd').notNull(),
    price_source: text('price_source').notNull(),
    verification_method: text('verification_method', {
      enum: ['public', 'view_key'],
    }).notNull(),
    /** Nullable until a sponsor is credited (§11.6). */
    sponsor_id: text('sponsor_id').references(() => match_sponsors.id),
    indexed_at: integer('indexed_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    unique_chain_tx: uniqueIndex('matching_contributions_chain_tx_unique').on(
      t.chain,
      t.tx_hash
    ),
    idx_matching_timestamp: index('idx_matching_timestamp').on(
      t.block_timestamp
    ),
    verification_check: check(
      'matching_contributions_verification_method_check',
      sql`${t.verification_method} IN ('public', 'view_key')`
    ),
  })
);

// ---------------------------------------------------------------------------
// §8.6 watcher_state — THE cursor table. See §14.4.
// ---------------------------------------------------------------------------

export const watcher_state = sqliteTable(
  'watcher_state',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chain: text('chain').notNull(),
    address: text('address').notNull(),
    watcher_kind: text('watcher_kind', {
      enum: ['project_donation', 'matching_pool'],
    }).notNull(),
    /** Nullable for chains without per-block cursors (e.g. Monero scan height). */
    last_processed_height: integer('last_processed_height'),
    last_processed_timestamp: integer('last_processed_timestamp', {
      mode: 'timestamp',
    }).notNull(),
    last_run_at: integer('last_run_at', { mode: 'timestamp' }).notNull(),
    last_run_status: text('last_run_status', {
      enum: ['ok', 'partial', 'error'],
    }).notNull(),
    last_error: text('last_error'),
  },
  (t) => ({
    unique_chain_address_kind: uniqueIndex(
      'watcher_state_chain_address_kind_unique'
    ).on(t.chain, t.address, t.watcher_kind),
    idx_watcher_state_chain: index('idx_watcher_state_chain').on(t.chain),
    kind_check: check(
      'watcher_state_kind_check',
      sql`${t.watcher_kind} IN ('project_donation', 'matching_pool')`
    ),
    status_check: check(
      'watcher_state_status_check',
      sql`${t.last_run_status} IN ('ok', 'partial', 'error')`
    ),
  })
);

// ---------------------------------------------------------------------------
// §8.7 match_sponsors
// ---------------------------------------------------------------------------

export const match_sponsors = sqliteTable('match_sponsors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  logo_url: text('logo_url'),
  committed_usd: real('committed_usd'),
  source_address: text('source_address'),
  source_chain: text('source_chain'),
  public: integer('public', { mode: 'boolean' }).notNull().default(true),
  order_index: integer('order_index').notNull().default(0),
});

// ---------------------------------------------------------------------------
// §8.8 price_snapshots — 5-min-rounded historical USD price cache.
// Spec says "unchanged from v2/v3" — shape defined here.
// ---------------------------------------------------------------------------

export const price_snapshots = sqliteTable(
  'price_snapshots',
  {
    chain: text('chain').notNull(),
    asset: text('asset').notNull(),
    /** Unix seconds floored to a 5-min (300s) bucket. */
    timestamp_bucket: integer('timestamp_bucket').notNull(),
    price_usd: real('price_usd').notNull(),
    source: text('source').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.chain, t.asset, t.timestamp_bucket] }),
  })
);

// ---------------------------------------------------------------------------
// Inferred row types for the rest of the app.
// ---------------------------------------------------------------------------

export type ProjectRow = typeof projects.$inferSelect;
export type DonationAddressRow = typeof donation_addresses.$inferSelect;
export type MatchingPoolAddressRow =
  typeof matching_pool_addresses.$inferSelect;
export type DonationRow = typeof donations.$inferSelect;
export type MatchingContributionRow =
  typeof matching_contributions.$inferSelect;
export type WatcherStateRow = typeof watcher_state.$inferSelect;
export type MatchSponsorRow = typeof match_sponsors.$inferSelect;
export type PriceSnapshotRow = typeof price_snapshots.$inferSelect;

export type DonationInsert = typeof donations.$inferInsert;
export type MatchingContributionInsert =
  typeof matching_contributions.$inferInsert;
export type WatcherStateInsert = typeof watcher_state.$inferInsert;
