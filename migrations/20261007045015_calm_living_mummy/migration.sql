ALTER TABLE `products` ADD `badges` text;--> statement-breakpoint
ALTER TABLE `products` ADD `sold` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `deleted_at` integer;