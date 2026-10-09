CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`price` integer NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`image` text,
	`condition` text,
	`language` text,
	`finish` text,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	CONSTRAINT `fk_product_variants_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_product_variants_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `has_variants` integer DEFAULT false NOT NULL;