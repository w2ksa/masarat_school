CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setting_key` varchar(100) NOT NULL,
	`setting_value` varchar(255) NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_setting_key_unique` UNIQUE(`setting_key`)
);
