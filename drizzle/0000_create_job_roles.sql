CREATE TABLE `job_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`capability` text NOT NULL,
	`band` text NOT NULL,
	`closing_date` text NOT NULL,
	`summary` text NOT NULL,
	`key_responsibilities` text NOT NULL,
	`status` text NOT NULL,
	`number_of_open_positions` integer NOT NULL
);
