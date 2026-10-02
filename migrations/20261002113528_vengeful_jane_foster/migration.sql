CREATE TABLE `cards` (
	`id` text PRIMARY KEY,
	`cert_number` text NOT NULL,
	`card_name` text NOT NULL,
	`front_image` text,
	`back_image` text,
	`item_grade` text,
	`label_type` text,
	`reverse_cert_barcode` text,
	`year` text,
	`brand_title` text,
	`subject` text,
	`card_number` text,
	`category` text,
	`variety_pedigree` text,
	`psa_estimate` text,
	`psa_population` integer,
	`psa_population_higher` integer,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	CONSTRAINT `fk_cards_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_cards_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_cards_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE INDEX `cards_cert_number_idx` ON `cards` (`cert_number`);--> statement-breakpoint
CREATE INDEX `cards_status_idx` ON `cards` (`status`);--> statement-breakpoint
CREATE INDEX `cards_deleted_at_idx` ON `cards` (`deleted_at`);