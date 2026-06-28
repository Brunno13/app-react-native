CREATE TABLE `local_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`expires_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
