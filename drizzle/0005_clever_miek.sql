ALTER TABLE `applications` ADD `cv_file_name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `cv_file_path` text NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `cv_file_type` text NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `cv_file_size` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` DROP COLUMN `applicant_name`;--> statement-breakpoint
ALTER TABLE `applications` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `applications` DROP COLUMN `phone_number`;--> statement-breakpoint
ALTER TABLE `applications` DROP COLUMN `cv_text`;