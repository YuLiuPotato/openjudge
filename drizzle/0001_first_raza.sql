CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`decision_id` text NOT NULL,
	`review_id` text NOT NULL,
	`author_id` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`decision_id`) REFERENCES `decisions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversation_by_review` ON `conversations` (`review_id`);--> statement-breakpoint
CREATE INDEX `conversations_by_author` ON `conversations` (`author_id`);--> statement-breakpoint
CREATE INDEX `conversations_by_reviewer` ON `conversations` (`reviewer_id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_by_conversation` ON `messages` (`conversation_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `reviews` ADD `allow_contact` integer DEFAULT 0 NOT NULL;