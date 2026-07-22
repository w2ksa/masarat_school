import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "teacher", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Teachers table - stores teacher-specific information
 */
export const teachers = mysqlTable("teachers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  specialization: varchar("specialization", { length: 255 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = typeof teachers.$inferInsert;

/**
 * Educational files table - stores metadata for files uploaded to S3
 */
export const educationalFiles = mysqlTable("educational_files", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EducationalFile = typeof educationalFiles.$inferSelect;
export type InsertEducationalFile = typeof educationalFiles.$inferInsert;

/**
 * Notifications table - stores system notifications for admins
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["teacher_registration", "file_upload", "system", "other"]).default("other").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Students table - stores student information and scores
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 50 }).default("الرابع الابتدائي").notNull(),
  section: int("section").default(1),
  score: int("score").default(0).notNull(),
  rank: int("rank"),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Teacher names table - stores teacher names for selection
 */
export const teacherNames = mysqlTable("teacher_names", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeacherName = typeof teacherNames.$inferSelect;
export type InsertTeacherName = typeof teacherNames.$inferInsert;

/**
 * Weekly voting periods table - stores voting period information
 */
export const votingPeriods = mysqlTable("voting_periods", {
  id: int("id").autoincrement().primaryKey(),
  weekNumber: int("weekNumber").notNull(),
  year: int("year").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: mysqlEnum("status", ["open", "closed"]).default("closed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VotingPeriod = typeof votingPeriods.$inferSelect;
export type InsertVotingPeriod = typeof votingPeriods.$inferInsert;

/**
 * Teacher votes table - stores teacher votes for students
 */
export const teacherVotes = mysqlTable("teacher_votes", {
  id: int("id").autoincrement().primaryKey(),
  teacherNameId: int("teacherNameId").notNull().references(() => teacherNames.id, { onDelete: "cascade" }),
  votingPeriodId: int("votingPeriodId").notNull().references(() => votingPeriods.id, { onDelete: "cascade" }),
  studentId: int("studentId").notNull().references(() => students.id, { onDelete: "cascade" }),
  voteRank: int("voteRank").notNull(), // 1, 2, or 3
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeacherVote = typeof teacherVotes.$inferSelect;
export type InsertTeacherVote = typeof teacherVotes.$inferInsert;

/**
 * Activity log table - stores all system activities for audit trail
 * Records votes, score changes, and other important actions
 */
export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  /** Type of activity: vote, add_score, deduct_score, add_student, delete_student */
  activityType: varchar("activityType", { length: 50 }).notNull(),
  /** Who performed the action (teacher name or admin name) */
  performedBy: varchar("performedBy", { length: 255 }).notNull(),
  /** Target student ID (if applicable) */
  studentId: int("studentId"),
  /** Target student name (for historical reference) */
  studentName: varchar("studentName", { length: 255 }),
  /** Points added or deducted (if applicable) */
  pointsChange: int("pointsChange"),
  /** Previous score before change */
  previousScore: int("previousScore"),
  /** New score after change */
  newScore: int("newScore"),
  /** Additional details in JSON format */
  details: text("details"),
  /** Device/browser information */
  userAgent: text("userAgent"),
  /** IP address */
  ipAddress: varchar("ipAddress", { length: 45 }),
  /** Voting period ID (if vote) */
  votingPeriodId: int("votingPeriodId"),
  /** Timestamp of the activity */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;


/**
 * Student content table - stores uploaded content (videos, images) from students
 * Content is reviewed by admin before points are awarded
 */
export const studentContent = mysqlTable("student_content", {
  id: int("id").autoincrement().primaryKey(),
  /** Student who uploaded the content */
  studentId: int("studentId").notNull().references(() => students.id, { onDelete: "cascade" }),
  /** Type of content: video, image */
  contentType: mysqlEnum("contentType", ["video", "image"]).notNull(),
  /** S3 file key */
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  /** S3 file URL */
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  /** Original file name */
  fileName: varchar("fileName", { length: 255 }).notNull(),
  /** File size in bytes */
  fileSize: int("fileSize").notNull(),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 100 }),
  /** Description or title of the content */
  description: text("description"),
  /** Status: pending (waiting for review), approved (10 points added), rejected (no points) */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  /** Admin who reviewed the content */
  reviewedBy: varchar("reviewedBy", { length: 255 }),
  /** Review timestamp */
  reviewedAt: timestamp("reviewedAt"),
  /** Upload timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudentContent = typeof studentContent.$inferSelect;
export type InsertStudentContent = typeof studentContent.$inferInsert;


/**
 * System settings table - stores system-wide configuration
 */
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  /** Setting key (unique identifier) */
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  /** Setting value */
  settingValue: varchar("setting_value", { length: 255 }).notNull(),
  /** Description of the setting */
  description: text("description"),
  /** Last updated timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

/**
 * Score categories table - predefined scoring criteria (بنود)
 * Each category has a fixed point value (positive for rewards, negative for penalties)
 */
export const scoreCategories = mysqlTable("score_categories", {
  id: int("id").autoincrement().primaryKey(),
  /** Category name in Arabic (e.g., حضور, غياب, مشاركة, مبادرة, درجة عامة) */
  name: varchar("name", { length: 100 }).notNull(),
  /** Points value: positive for rewards, negative for penalties */
  points: int("points").notNull(),
  /** Whether this category allows custom point input (e.g., درجة عامة) */
  isCustom: int("isCustom").default(0).notNull(),
  /** Display order */
  sortOrder: int("sortOrder").default(0).notNull(),
  /** Whether this category is active */
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScoreCategory = typeof scoreCategories.$inferSelect;
export type InsertScoreCategory = typeof scoreCategories.$inferInsert;

/**
 * Score history table - detailed log of every score change per student
 * Records who added/deducted, which category, and the resulting balance
 */
export const scoreHistory = mysqlTable("score_history", {
  id: int("id").autoincrement().primaryKey(),
  /** Student who received the score change */
  studentId: int("studentId").notNull().references(() => students.id, { onDelete: "cascade" }),
  /** Student name (for historical reference) */
  studentName: varchar("studentName", { length: 255 }).notNull(),
  /** Category ID (which بند was applied) */
  categoryId: int("categoryId").references(() => scoreCategories.id),
  /** Category name at time of action (for historical reference) */
  categoryName: varchar("categoryName", { length: 100 }).notNull(),
  /** Points added or deducted */
  pointsChange: int("pointsChange").notNull(),
  /** Score before this change */
  previousScore: int("previousScore").notNull(),
  /** Score after this change */
  newScore: int("newScore").notNull(),
  /** Who performed this action (admin name or system) */
  performedBy: varchar("performedBy", { length: 255 }).notNull(),
  /** Optional comment */
  comment: text("comment"),
  /** Timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScoreHistory = typeof scoreHistory.$inferSelect;
export type InsertScoreHistory = typeof scoreHistory.$inferInsert;
