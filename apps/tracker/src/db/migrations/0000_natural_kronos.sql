CREATE TABLE `donation_addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`chain` text NOT NULL,
	`asset` text NOT NULL,
	`address` text NOT NULL,
	`label` text,
	`is_matching_eligible` integer DEFAULT false NOT NULL,
	`view_key_secret_ref` text,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`chain` text NOT NULL,
	`asset` text NOT NULL,
	`tx_hash` text,
	`block_height` integer,
	`block_timestamp` integer NOT NULL,
	`source_address` text,
	`amount_native` text NOT NULL,
	`amount_usd` real NOT NULL,
	`price_source` text NOT NULL,
	`verification_method` text NOT NULL,
	`included_in_match` integer DEFAULT true NOT NULL,
	`indexed_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `match_sponsors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`logo_url` text,
	`committed_usd` real,
	`source_address` text,
	`source_chain` text,
	`public` integer DEFAULT true NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matching_contributions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chain` text NOT NULL,
	`asset` text NOT NULL,
	`tx_hash` text,
	`block_height` integer,
	`block_timestamp` integer NOT NULL,
	`source_address` text,
	`amount_native` text NOT NULL,
	`amount_usd` real NOT NULL,
	`price_source` text NOT NULL,
	`verification_method` text NOT NULL,
	`sponsor_id` text,
	`indexed_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`sponsor_id`) REFERENCES `match_sponsors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `matching_pool_addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chain` text NOT NULL,
	`asset` text NOT NULL,
	`address` text NOT NULL,
	`label` text,
	`is_matching_eligible` integer DEFAULT true NOT NULL,
	`view_key_secret_ref` text,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `price_snapshots` (
	`chain` text NOT NULL,
	`asset` text NOT NULL,
	`timestamp_bucket` integer NOT NULL,
	`price_usd` real NOT NULL,
	`source` text NOT NULL,
	PRIMARY KEY(`chain`, `asset`, `timestamp_bucket`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_desc` text NOT NULL,
	`long_desc_md` text NOT NULL,
	`order_index` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `watcher_state` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chain` text NOT NULL,
	`address` text NOT NULL,
	`watcher_kind` text NOT NULL,
	`last_processed_height` integer,
	`last_processed_timestamp` integer NOT NULL,
	`last_run_at` integer NOT NULL,
	`last_run_status` text NOT NULL,
	`last_error` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `donation_addresses_chain_asset_address_unique` ON `donation_addresses` (`chain`,`asset`,`address`);--> statement-breakpoint
CREATE UNIQUE INDEX `donations_chain_tx_project_unique` ON `donations` (`chain`,`tx_hash`,`project_id`);--> statement-breakpoint
CREATE INDEX `idx_donations_project` ON `donations` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_donations_timestamp` ON `donations` (`block_timestamp`);--> statement-breakpoint
CREATE UNIQUE INDEX `matching_contributions_chain_tx_unique` ON `matching_contributions` (`chain`,`tx_hash`);--> statement-breakpoint
CREATE INDEX `idx_matching_timestamp` ON `matching_contributions` (`block_timestamp`);--> statement-breakpoint
CREATE UNIQUE INDEX `matching_pool_addresses_chain_asset_address_unique` ON `matching_pool_addresses` (`chain`,`asset`,`address`);--> statement-breakpoint
CREATE UNIQUE INDEX `watcher_state_chain_address_kind_unique` ON `watcher_state` (`chain`,`address`,`watcher_kind`);--> statement-breakpoint
CREATE INDEX `idx_watcher_state_chain` ON `watcher_state` (`chain`);