CREATE TABLE `identity_keys` (
	`user_id` text PRIMARY KEY NOT NULL,
	`backup` text NOT NULL,
	`fingerprint` text NOT NULL
);
