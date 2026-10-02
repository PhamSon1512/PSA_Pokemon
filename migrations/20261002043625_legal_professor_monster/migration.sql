ALTER TABLE `users` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `province_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `district_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `ward_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `detailed_address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `address_type` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_active_udx` ON `users` (`phone`) WHERE "users"."deleted_at" IS NULL;