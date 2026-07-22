CREATE TABLE `student_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`contentType` enum('video','image') NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` varchar(1024) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100),
	`description` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` varchar(255),
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `student_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `student_content` ADD CONSTRAINT `student_content_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;