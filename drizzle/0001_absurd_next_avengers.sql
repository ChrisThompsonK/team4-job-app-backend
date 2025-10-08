CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_role_id` integer NOT NULL,
	`cv_text` text NOT NULL,
	`status` text DEFAULT 'in progress' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`job_role_id`) REFERENCES `job_roles`(`id`) ON UPDATE no action ON DELETE no action
);
