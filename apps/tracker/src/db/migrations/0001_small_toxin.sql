PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_donations` (
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
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "donations_verification_method_check" CHECK("__new_donations"."verification_method" IN ('public', 'view_key'))
);
--> statement-breakpoint
INSERT INTO `__new_donations`("id", "project_id", "chain", "asset", "tx_hash", "block_height", "block_timestamp", "source_address", "amount_native", "amount_usd", "price_source", "verification_method", "included_in_match", "indexed_at") SELECT "id", "project_id", "chain", "asset", "tx_hash", "block_height", "block_timestamp", "source_address", "amount_native", "amount_usd", "price_source", "verification_method", "included_in_match", "indexed_at" FROM `donations`;--> statement-breakpoint
DROP TABLE `donations`;--> statement-breakpoint
ALTER TABLE `__new_donations` RENAME TO `donations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `donations_chain_tx_project_unique` ON `donations` (`chain`,`tx_hash`,`project_id`);--> statement-breakpoint
CREATE INDEX `idx_donations_project` ON `donations` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_donations_timestamp` ON `donations` (`block_timestamp`);--> statement-breakpoint
CREATE TABLE `__new_matching_contributions` (
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
	FOREIGN KEY (`sponsor_id`) REFERENCES `match_sponsors`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "matching_contributions_verification_method_check" CHECK("__new_matching_contributions"."verification_method" IN ('public', 'view_key'))
);
--> statement-breakpoint
INSERT INTO `__new_matching_contributions`("id", "chain", "asset", "tx_hash", "block_height", "block_timestamp", "source_address", "amount_native", "amount_usd", "price_source", "verification_method", "sponsor_id", "indexed_at") SELECT "id", "chain", "asset", "tx_hash", "block_height", "block_timestamp", "source_address", "amount_native", "amount_usd", "price_source", "verification_method", "sponsor_id", "indexed_at" FROM `matching_contributions`;--> statement-breakpoint
DROP TABLE `matching_contributions`;--> statement-breakpoint
ALTER TABLE `__new_matching_contributions` RENAME TO `matching_contributions`;--> statement-breakpoint
CREATE UNIQUE INDEX `matching_contributions_chain_tx_unique` ON `matching_contributions` (`chain`,`tx_hash`);--> statement-breakpoint
CREATE INDEX `idx_matching_timestamp` ON `matching_contributions` (`block_timestamp`);--> statement-breakpoint
CREATE TABLE `__new_watcher_state` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chain` text NOT NULL,
	`address` text NOT NULL,
	`watcher_kind` text NOT NULL,
	`last_processed_height` integer,
	`last_processed_timestamp` integer NOT NULL,
	`last_run_at` integer NOT NULL,
	`last_run_status` text NOT NULL,
	`last_error` text,
	CONSTRAINT "watcher_state_kind_check" CHECK("__new_watcher_state"."watcher_kind" IN ('project_donation', 'matching_pool')),
	CONSTRAINT "watcher_state_status_check" CHECK("__new_watcher_state"."last_run_status" IN ('ok', 'partial', 'error'))
);
--> statement-breakpoint
INSERT INTO `__new_watcher_state`("id", "chain", "address", "watcher_kind", "last_processed_height", "last_processed_timestamp", "last_run_at", "last_run_status", "last_error") SELECT "id", "chain", "address", "watcher_kind", "last_processed_height", "last_processed_timestamp", "last_run_at", "last_run_status", "last_error" FROM `watcher_state`;--> statement-breakpoint
DROP TABLE `watcher_state`;--> statement-breakpoint
ALTER TABLE `__new_watcher_state` RENAME TO `watcher_state`;--> statement-breakpoint
CREATE UNIQUE INDEX `watcher_state_chain_address_kind_unique` ON `watcher_state` (`chain`,`address`,`watcher_kind`);--> statement-breakpoint
CREATE INDEX `idx_watcher_state_chain` ON `watcher_state` (`chain`);