CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text(50) NOT NULL,
	`lastName` text(50) NOT NULL,
	`email` text(100) NOT NULL,
	`isActive` integer DEFAULT false NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`isAdmin` integer DEFAULT false NOT NULL,
	`password` text NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`deletedAt` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);