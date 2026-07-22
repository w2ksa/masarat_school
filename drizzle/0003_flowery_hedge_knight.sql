CREATE TABLE `teacher_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`votingPeriodId` int NOT NULL,
	`studentId` int NOT NULL,
	`voteRank` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teacher_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voting_periods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`status` enum('open','closed') NOT NULL DEFAULT 'closed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voting_periods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `teacher_votes` ADD CONSTRAINT `teacher_votes_teacherId_teachers_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_votes` ADD CONSTRAINT `teacher_votes_votingPeriodId_voting_periods_id_fk` FOREIGN KEY (`votingPeriodId`) REFERENCES `voting_periods`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_votes` ADD CONSTRAINT `teacher_votes_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;