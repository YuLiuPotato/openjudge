CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`context` text NOT NULL,
	`option_a` text NOT NULL,
	`option_b` text NOT NULL,
	`category` text NOT NULL,
	`goal` text NOT NULL,
	`risk` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`decision_id` text NOT NULL,
	`author_id` text NOT NULL,
	`choice` text NOT NULL,
	`angle` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`decision_id`) REFERENCES `decisions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_one_per_person` ON `reviews` (`decision_id`,`author_id`);--> statement-breakpoint
CREATE INDEX `reviews_by_decision` ON `reviews` (`decision_id`);