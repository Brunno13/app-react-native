CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`theme` text DEFAULT 'system',
	`is_offline_mode_enabled` integer DEFAULT false,
	`updated_at` integer
);
