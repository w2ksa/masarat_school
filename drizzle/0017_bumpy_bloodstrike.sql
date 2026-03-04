CREATE TABLE `class_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`grade` varchar(50) NOT NULL,
	`section` varchar(10) NOT NULL,
	`code` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `class_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_teacher_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`periodId` int NOT NULL,
	`studentId` int NOT NULL,
	`studentName` varchar(255) NOT NULL,
	`studentGrade` varchar(50) NOT NULL,
	`studentSection` varchar(10) NOT NULL,
	`teacherNameId` int NOT NULL,
	`teacherName` varchar(255) NOT NULL,
	`voteRank` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_teacher_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacher_eval_periods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`status` enum('open','closed') NOT NULL DEFAULT 'closed',
	`totalVotes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	CONSTRAINT `teacher_eval_periods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `student_teacher_votes` ADD CONSTRAINT `student_teacher_votes_periodId_teacher_eval_periods_id_fk` FOREIGN KEY (`periodId`) REFERENCES `teacher_eval_periods`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_teacher_votes` ADD CONSTRAINT `student_teacher_votes_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_teacher_votes` ADD CONSTRAINT `student_teacher_votes_teacherNameId_teacher_names_id_fk` FOREIGN KEY (`teacherNameId`) REFERENCES `teacher_names`(`id`) ON DELETE cascade ON UPDATE no action;