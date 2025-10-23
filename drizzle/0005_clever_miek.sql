PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`job_role_id` integer NOT NULL,
	`cv_file_name` text NOT NULL,
	`cv_file_path` text NOT NULL,
	`cv_file_type` text NOT NULL,
	`cv_file_size` integer NOT NULL,
	`status` text DEFAULT 'in progress' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_role_id`) REFERENCES `job_roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_applications`("id", "user_id", "job_role_id", "status", "created_at", "cv_file_name", "cv_file_path", "cv_file_type", "cv_file_size") 
SELECT a."id", a."user_id", a."job_role_id", a."status", a."created_at", 'legacy-cv.txt', '', 'text/plain', 0 
FROM `applications` a
WHERE EXISTS (SELECT 1 FROM `users` u WHERE u.id = a.user_id)
AND EXISTS (SELECT 1 FROM `job_roles` j WHERE j.id = a.job_role_id);--> statement-breakpoint
DROP TABLE `applications`;--> statement-breakpoint
ALTER TABLE `__new_applications` RENAME TO `applications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;