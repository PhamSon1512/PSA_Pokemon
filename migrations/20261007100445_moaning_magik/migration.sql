CREATE TABLE `categories` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`description` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	CONSTRAINT `fk_categories_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `badges` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`color` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	CONSTRAINT `fk_badges_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `seo_keywords` text;