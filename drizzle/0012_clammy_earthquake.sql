CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityType` varchar(50) NOT NULL,
	`performedBy` varchar(255) NOT NULL,
	`studentId` int,
	`studentName` varchar(255),
	`pointsChange` int,
	`previousScore` int,
	`newScore` int,
	`details` text,
	`userAgent` text,
	`ipAddress` varchar(45),
	`votingPeriodId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
