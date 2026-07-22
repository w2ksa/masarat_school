CREATE TABLE `score_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`points` int NOT NULL,
	`isCustom` int NOT NULL DEFAULT 0,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `score_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `score_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`studentName` varchar(255) NOT NULL,
	`categoryId` int,
	`categoryName` varchar(100) NOT NULL,
	`pointsChange` int NOT NULL,
	`previousScore` int NOT NULL,
	`newScore` int NOT NULL,
	`performedBy` varchar(255) NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `score_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `score_history` ADD CONSTRAINT `score_history_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `score_history` ADD CONSTRAINT `score_history_categoryId_score_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `score_categories`(`id`) ON DELETE no action ON UPDATE no action;