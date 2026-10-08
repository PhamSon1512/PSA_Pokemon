CREATE TABLE `products` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`description` text,
	`price` integer NOT NULL,
	`compare_price` integer,
	`image` text,
	`images` text,
	`category` text,
	`type` text DEFAULT 'NORMAL' NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	CONSTRAINT `fk_products_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY,
	`order_id` text NOT NULL,
	`product_id` text,
	`product_name` text NOT NULL,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL,
	CONSTRAINT `fk_order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
	CONSTRAINT `fk_order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY,
	`order_number` text NOT NULL UNIQUE,
	`user_id` text,
	`customer_name` text NOT NULL,
	`customer_email` text,
	`customer_phone` text,
	`address` text,
	`note` text,
	`subtotal` integer NOT NULL,
	`discount` integer DEFAULT 0,
	`shipping` integer DEFAULT 0,
	`total` integer NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`payment_method` text DEFAULT 'COD',
	`paid_at` integer,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text,
	`cover_image` text,
	`category` text DEFAULT 'NEWS',
	`tags` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`published_at` integer,
	`author_id` text,
	`seo_title` text,
	`seo_description` text,
	`view_count` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	CONSTRAINT `fk_posts_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE INDEX `posts_slug_idx` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_idx` ON `posts` (`status`);