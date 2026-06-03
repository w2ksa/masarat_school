import { eq, and, or, desc, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, teachers, InsertTeacher, educationalFiles, InsertEducationalFile, notifications, InsertNotification, students, InsertStudent, teacherNames, teacherVotes, votingPeriods, activityLog, InsertActivityLog, studentContent, InsertStudentContent, systemSettings, InsertSystemSetting, scoreCategories, InsertScoreCategory, scoreHistory, InsertScoreHistory } from "../drizzle/schema";
import { ENV } from './_core/env';
import { STUDENTS_SEED } from '@shared/studentsSeed';

let _db: ReturnType<typeof drizzle> | null = null;

// ===== In-Memory Student Store (fallback when no database) =====
type InMemoryStudent = {
  id: number;
  fullName: string;
  grade: string;
  section: number | null;
  score: number;
  rank: number | null;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

let _inMemoryStudents: InMemoryStudent[] = [];
let _nextStudentId = 1;
let _inMemoryInitialized = false;

type InMemoryActivityLog = {
  id: number;
  activityType: string;
  performedBy: string;
  studentId: number | null;
  studentName: string | null;
  pointsChange: number | null;
  previousScore: number | null;
  newScore: number | null;
  details: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  votingPeriodId: number | null;
  createdAt: Date;
};
let _inMemoryActivityLog: InMemoryActivityLog[] = [];
let _nextActivityLogId = 1;

type InMemoryScoreHistory = {
  id: number;
  studentId: number;
  studentName: string | null;
  categoryId: number;
  categoryName: string;
  pointsChange: number;
  previousScore: number;
  newScore: number;
  performedBy: string;
  comment: string | null;
  createdAt: Date;
};
let _inMemoryScoreHistory: InMemoryScoreHistory[] = [];
let _nextScoreHistoryId = 1;

type InMemoryVotingPeriod = {
  id: number;
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
};
let _inMemoryVotingPeriods: InMemoryVotingPeriod[] = [];
let _nextVotingPeriodId = 1;

type InMemoryVote = {
  id: number;
  teacherNameId: number;
  votingPeriodId: number;
  studentId: number;
  voteRank: number;
  createdAt: Date;
};
let _inMemoryVotes: InMemoryVote[] = [];
let _nextVoteId = 1;

type InMemoryTeacherName = {
  id: number;
  fullName: string;
  createdAt: Date;
};
let _inMemoryTeacherNames: InMemoryTeacherName[] = [];
let _teacherNamesInitialized = false;

function initInMemoryTeacherNames() {
  if (_teacherNamesInitialized) return;
  _teacherNamesInitialized = true;
  const names = [
    "عيسى علي عسيري", "عصام سمير حسن عاشور", "فكري فكري شحاتة عبدالعاطي",
    "أحمد جمعة محمود علي", "أحمد إبراهيم يحيى عايض شويل", "فارس محمد آل الشيخ",
    "ريان مسفر جبران القحطاني", "عبدالله بن محمد الزهراني", "سمير نبيل عبد الفتاح",
    "احمد يحيى عوض الباز", "محمد حامد عبد الكريم", "محمود حمدي محمود",
    "السيد عبد الرازق البلتاجي", "محمد علاء السيد", "أشرف إسماعيل عبد الرحمن",
    "عبدالمجيد الحسين سليمان الحفظي", "أحمد محمود صابر محمود", "ناصر محمد عبد العليم علي",
    "هاني محمد عبد البصير", "أحمد سامي أحمد النجار", "محمد ربيع يونس عبدالغني",
    "محمد عاشور السيد أحمد", "محمد المتولي البارودي", "محمد حلمي محمد عبده",
    "سراج الرحمن كمال فاضل", "احمد محمد جلال جمعه", "عبد الحميد ظريف عبدالمجيد ضبون",
    "السيد رضا عبده ابراهيم", "السيد منصور فكري محمد", "عصام الدين محمد علي",
    "علي عبد الله فرحان عسيري", "عبد الصادق شورى عبدالصادق", "محمد السيد اليماني بسيوني",
    "ياسر عزت عبدالمعطي جميل", "رضا السيد رضا عبده", "خالد أبو المجد أحمد",
    "ياسر أحمد محمد الشهري", "بدر فريد سعد عسيري", "خليل عبدالله سعيد حدري",
    "سعود آل زايد", "حسام محمد الشقيقي", "ابراهيم الشهراني",
    "عبدالعزيز شايع علي اليزيدي",
  ];
  _inMemoryTeacherNames = names.map((name, i) => ({
    id: i + 1,
    fullName: name,
    createdAt: new Date(),
  }));
}

let _inMemoryContentEnabled = true;

type InMemoryContent = {
  id: number;
  studentId: number;
  contentType: "video" | "image";
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
};
let _inMemoryContent: InMemoryContent[] = [];
let _nextContentId = 1;

function initInMemoryStudents() {
  if (_inMemoryInitialized) return;
  _inMemoryInitialized = true;
  const now = new Date();
  const rawStudents = STUDENTS_SEED;

  _inMemoryStudents = rawStudents.map((s, i) => ({
    id: i + 1,
    fullName: s.fullName,
    grade: s.grade,
    section: s.section,
    score: s.score,
    rank: null,
    comment: null,
    createdAt: now,
    updatedAt: now,
  }));
  _nextStudentId = _inMemoryStudents.length + 1;
  console.log(`[InMemory] Initialized ${_inMemoryStudents.length} students`);
}

function getInMemoryStudents(grade?: string, section?: number): InMemoryStudent[] {
  initInMemoryStudents();
  let result = [..._inMemoryStudents];
  if (grade && grade !== "all" && grade !== "__all__") {
    result = result.filter(s => s.grade === grade);
  }
  if (section !== undefined) {
    result = result.filter(s => s.section === section);
  }
  result.sort((a, b) => {
    if ((a.section ?? 0) !== (b.section ?? 0)) return (a.section ?? 0) - (b.section ?? 0);
    return a.fullName.localeCompare(b.fullName, 'ar');
  });
  return result;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
// استخراج رابط قاعدة البيانات من المتغيرات الشائعة.
// Railway قد يوفّر الرابط باسم MYSQL_URL أو كمتغيرات منفصلة (MYSQLHOST...)
// بدل DATABASE_URL، وهذا سبب شائع لعدم الاتصال وفقدان البيانات.
export function resolveDatabaseUrl(): string {
  const direct =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    process.env.DATABASE_PUBLIC_URL;
  if (direct) return direct;

  const host = process.env.MYSQLHOST || process.env.MYSQL_HOST;
  const user = process.env.MYSQLUSER || process.env.MYSQL_USER;
  const password = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE;
  const port = process.env.MYSQLPORT || process.env.MYSQL_PORT || "3306";
  if (host && user && database) {
    const pass = password ? `:${encodeURIComponent(password)}` : "";
    return `mysql://${user}${pass}@${host}:${port}/${database}`;
  }
  return "";
}

export async function getDb() {
  if (!_db) {
    const url = resolveDatabaseUrl();
    if (url) {
      try {
        _db = drizzle(url);
      } catch (error) {
        console.warn("[Database] Failed to connect:", error);
        _db = null;
      }
    }
  }
  return _db;
}

// التحقق من حالة الاتصال بقاعدة البيانات فعلياً (وليس فقط وجود الرابط)
// يُستخدم لتنبيه المدير عند تشغيل الموقع بدون قاعدة بيانات (البيانات مؤقتة وتُفقد عند إعادة التشغيل)
let _dbStatusCache: { connected: boolean; checkedAt: number } | null = null;
export async function getDbStatus(): Promise<{ connected: boolean; hasUrl: boolean; reason?: string }> {
  const hasUrl = !!resolveDatabaseUrl();
  // كاش لمدة 30 ثانية لتفادي فحص الاتصال في كل طلب
  if (_dbStatusCache && Date.now() - _dbStatusCache.checkedAt < 30000) {
    return { connected: _dbStatusCache.connected, hasUrl };
  }

  if (!hasUrl) {
    _dbStatusCache = { connected: false, checkedAt: Date.now() };
    return { connected: false, hasUrl: false, reason: "DATABASE_URL غير مضبوط" };
  }

  try {
    const db = await getDb();
    if (!db) {
      _dbStatusCache = { connected: false, checkedAt: Date.now() };
      return { connected: false, hasUrl: true, reason: "تعذّر إنشاء الاتصال" };
    }
    await db.execute(sql`SELECT 1`);
    _dbStatusCache = { connected: true, checkedAt: Date.now() };
    return { connected: true, hasUrl: true };
  } catch (error: any) {
    _dbStatusCache = { connected: false, checkedAt: Date.now() };
    return { connected: false, hasUrl: true, reason: error?.message || "فشل الاتصال" };
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Teachers queries
export async function createTeacher(teacher: InsertTeacher) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create teacher: database not available");
    return undefined;
  }
  const result = await db.insert(teachers).values(teacher);
  return result;
}

export async function getTeacherByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get teacher: database not available");
    return undefined;
  }
  const result = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTeachers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get teachers: database not available");
    return [];
  }
  return await db.select({
    teacher: teachers,
    user: users,
  }).from(teachers).leftJoin(users, eq(teachers.userId, users.id)).orderBy(desc(teachers.createdAt));
}

export async function updateTeacherStatus(teacherId: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update teacher status: database not available");
    return undefined;
  }
  return await db.update(teachers).set({ status }).where(eq(teachers.id, teacherId));
}

// Educational files queries
export async function createEducationalFile(file: InsertEducationalFile) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create file: database not available");
    return undefined;
  }
  const result = await db.insert(educationalFiles).values(file);
  return result;
}

export async function getFilesByTeacherId(teacherId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get files: database not available");
    return [];
  }
  return await db.select().from(educationalFiles).where(eq(educationalFiles.teacherId, teacherId)).orderBy(desc(educationalFiles.createdAt));
}

export async function getAllFiles() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get files: database not available");
    return [];
  }
  return await db.select({
    file: educationalFiles,
    teacher: teachers,
    user: users,
  }).from(educationalFiles)
    .leftJoin(teachers, eq(educationalFiles.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .orderBy(desc(educationalFiles.createdAt));
}

export async function deleteFile(fileId: number, teacherId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete file: database not available");
    return undefined;
  }
  return await db.delete(educationalFiles).where(and(eq(educationalFiles.id, fileId), eq(educationalFiles.teacherId, teacherId)));
}

// Notifications queries
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create notification: database not available");
    return undefined;
  }
  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function deleteNotification(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete notification: database not available");
    return;
  }

  await db.delete(notifications).where(eq(notifications.id, notificationId));
}

// Students queries
export async function getAllStudents(grade?: string, section?: number) {
  const db = await getDb();
  if (!db) {
    return getInMemoryStudents(grade, section);
  }

  let query = db.select().from(students);

  const conditions = [];
  if (grade && grade !== "all" && grade !== "__all__") {
    conditions.push(eq(students.grade, grade));
  }
  if (section !== undefined) {
    conditions.push(eq(students.section, section));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query.orderBy(students.section, students.fullName);
  return result;
}

export async function getTopStudents(limit: number = 5, grade?: string, gradeGroup?: "primary" | "upper") {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    let filtered = [..._inMemoryStudents];
    if (grade && grade !== "all" && grade !== "__all__") {
      filtered = filtered.filter(s => s.grade === grade);
    } else if (gradeGroup) {
      const primaryGrades = ["أول", "ثاني", "ثالث"];
      const upperGrades = ["رابع", "خامس", "سادس"];
      const grades = gradeGroup === "primary" ? primaryGrades : upperGrades;
      filtered = filtered.filter(s => grades.includes(s.grade));
    }
    return filtered.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  let query = db.select().from(students);

  if (grade && grade !== "all" && grade !== "__all__") {
    query = query.where(eq(students.grade, grade)) as any;
  } else if (gradeGroup) {
    // Filter by grade group
    const primaryGrades = ["أول", "ثاني", "ثالث"];
    const upperGrades = ["رابع", "خامس", "سادس"];
    const grades = gradeGroup === "primary" ? primaryGrades : upperGrades;

    const conditions = grades.map(g => eq(students.grade, g));
    query = query.where(or(...conditions)) as any;
  }

  const result = await query
    .orderBy(desc(students.score))
    .limit(limit);
  return result;
}

export async function getLevelStats() {
  const db = await getDb();

  let allStudents: { score: number;[key: string]: any }[];

  if (!db) {
    initInMemoryStudents();
    allStudents = _inMemoryStudents;
  } else {
    allStudents = await db.select().from(students);
  }

  const qudwaStudents = allStudents.filter(s => s.score >= 500).sort((a, b) => b.score - a.score);
  const mutamayizStudents = allStudents.filter(s => s.score >= 400 && s.score <= 499).sort((a, b) => b.score - a.score);
  const mundabitStudents = allStudents.filter(s => s.score >= 300 && s.score <= 399).sort((a, b) => b.score - a.score);
  const mujtahidStudents = allStudents.filter(s => s.score >= 200 && s.score <= 299).sort((a, b) => b.score - a.score);
  const qadirStudents = allStudents.filter(s => s.score >= 100 && s.score <= 199).sort((a, b) => b.score - a.score);
  const mubtadiStudents = allStudents.filter(s => s.score >= 0 && s.score <= 99).sort((a, b) => b.score - a.score);

  const stats = {
    qudwa: { count: qudwaStudents.length, students: qudwaStudents },
    mutamayiz: { count: mutamayizStudents.length, students: mutamayizStudents },
    mundabit: { count: mundabitStudents.length, students: mundabitStudents },
    mujtahid: { count: mujtahidStudents.length, students: mujtahidStudents },
    qadir: { count: qadirStudents.length, students: qadirStudents },
    mubtadi: { count: mubtadiStudents.length, students: mubtadiStudents },
  };

  return stats;
}

export async function addStudent(student: InsertStudent) {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    const now = new Date();
    const newStudent: InMemoryStudent = {
      id: _nextStudentId++,
      fullName: student.fullName,
      grade: student.grade ?? "أول",
      section: student.section ?? 1,
      score: student.score ?? 0,
      rank: null,
      comment: (student as any).comment ?? null,
      createdAt: now,
      updatedAt: now,
    };
    _inMemoryStudents.push(newStudent);
    console.log(`[InMemory] Added student: ${newStudent.fullName}`);
    return;
  }

  await db.insert(students).values(student);
}

export async function updateStudentScore(studentId: number, score: number, comment?: string) {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    const student = _inMemoryStudents.find(s => s.id === studentId);
    if (student) {
      student.score = score;
      if (comment !== undefined) student.comment = comment;
      student.updatedAt = new Date();
      console.log(`[InMemory] Updated score for ${student.fullName}: ${score}`);
    }
    return;
  }

  const updateData: any = { score };
  if (comment !== undefined) {
    updateData.comment = comment;
  }

  await db
    .update(students)
    .set(updateData)
    .where(eq(students.id, studentId));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark notification as read: database not available");
    return undefined;
  }
  return await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, notificationId));
}

export async function getUnreadNotificationsCount(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get unread count: database not available");
    return 0;
  }
  const result = await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
  return result.length;
}

export async function getAllAdmins() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admins: database not available");
    return [];
  }
  return await db.select().from(users).where(eq(users.role, "admin"));
}

// Voting system functions

export async function getCurrentVotingPeriod() {
  const db = await getDb();
  if (!db) {
    // اختر أحدث فترة مفتوحة (وليس أول فترة) لضمان الاتساق مع العرض
    const openPeriods = _inMemoryVotingPeriods.filter(p => p.status === "open");
    if (openPeriods.length === 0) return null;
    return [...openPeriods].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  const { votingPeriods } = await import("../drizzle/schema");
  // الترتيب حسب الأحدث لتفادي إرجاع فترة مفتوحة قديمة بشكل عشوائي
  const result = await db
    .select()
    .from(votingPeriods)
    .where(eq(votingPeriods.status, "open"))
    .orderBy(desc(votingPeriods.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getLatestVotingPeriod() {
  const db = await getDb();
  if (!db) {
    if (_inMemoryVotingPeriods.length === 0) return null;
    const open = _inMemoryVotingPeriods.find(p => p.status === "open");
    if (open) return open;
    return [..._inMemoryVotingPeriods].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null;
  }

  const { votingPeriods } = await import("../drizzle/schema");
  const openResult = await db
    .select()
    .from(votingPeriods)
    .where(eq(votingPeriods.status, "open"))
    .orderBy(desc(votingPeriods.createdAt))
    .limit(1);
  if (openResult.length > 0) return openResult[0];

  const latestResult = await db.select().from(votingPeriods).orderBy(desc(votingPeriods.createdAt)).limit(1);
  return latestResult.length > 0 ? latestResult[0] : null;
}

// إرجاع جميع فترات التصويت (الأحدث أولاً) مع عدد الأصوات في كل فترة
// تُستخدم لاسترجاع وعرض بيانات التصويتات السابقة في الموقع.
export async function getAllVotingPeriods() {
  const db = await getDb();
  if (!db) {
    return [..._inMemoryVotingPeriods]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(p => ({
        ...p,
        voteCount: _inMemoryVotes.filter(v => v.votingPeriodId === p.id).length,
      }));
  }

  const { votingPeriods } = await import("../drizzle/schema");
  const periods = await db.select().from(votingPeriods).orderBy(desc(votingPeriods.createdAt));

  // عدد الأصوات لكل فترة عبر تجميع واحد بدل استعلام لكل فترة
  const counts = await db
    .select({
      votingPeriodId: teacherVotes.votingPeriodId,
      voteCount: sql<number>`count(*)`,
    })
    .from(teacherVotes)
    .groupBy(teacherVotes.votingPeriodId);

  const countMap = new Map<number, number>();
  for (const row of counts) {
    countMap.set(row.votingPeriodId, Number(row.voteCount));
  }

  return periods.map(p => ({ ...p, voteCount: countMap.get(p.id) || 0 }));
}

export async function getVotingPeriodById(periodId: number) {
  const db = await getDb();
  if (!db) {
    return _inMemoryVotingPeriods.find(p => p.id === periodId) || null;
  }

  const { votingPeriods } = await import("../drizzle/schema");
  const result = await db.select().from(votingPeriods).where(eq(votingPeriods.id, periodId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createVotingPeriod(data: {
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
}) {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const period: InMemoryVotingPeriod = {
      id: _nextVotingPeriodId++,
      ...data,
      status: "open",
      createdAt: now,
      updatedAt: now,
    };
    _inMemoryVotingPeriods.push(period);
    return period;
  }

  const { votingPeriods } = await import("../drizzle/schema");
  return await db.insert(votingPeriods).values({ ...data, status: "open" });
}

export async function closeVotingPeriod(periodId: number) {
  const db = await getDb();
  if (!db) {
    const period = _inMemoryVotingPeriods.find(p => p.id === periodId);
    if (period) {
      period.status = "closed";
      period.updatedAt = new Date();
    }
    return;
  }

  const { votingPeriods } = await import("../drizzle/schema");
  return await db.update(votingPeriods).set({ status: "closed" }).where(eq(votingPeriods.id, periodId));
}

// إغلاق جميع الفترات المفتوحة دفعة واحدة لمنع تراكم أكثر من فترة مفتوحة
export async function closeAllOpenVotingPeriods() {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    _inMemoryVotingPeriods.forEach(p => {
      if (p.status === "open") {
        p.status = "closed";
        p.updatedAt = now;
      }
    });
    return;
  }

  const { votingPeriods } = await import("../drizzle/schema");
  return await db.update(votingPeriods).set({ status: "closed" }).where(eq(votingPeriods.status, "open"));
}

export async function getTeacherVotes(teacherNameId: number, periodId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get teacher votes: database not available");
    return [];
  }

  const { teacherVotes } = await import("../drizzle/schema");
  return await db
    .select()
    .from(teacherVotes)
    .where(
      and(
        eq(teacherVotes.teacherNameId, teacherNameId),
        eq(teacherVotes.votingPeriodId, periodId)
      )
    );
}

export async function submitTeacherVote(data: {
  teacherNameId: number;
  votingPeriodId: number;
  studentId: number;
  voteRank: number;
}) {
  const db = await getDb();
  if (!db) {
    const vote: InMemoryVote = {
      id: _nextVoteId++,
      ...data,
      createdAt: new Date(),
    };
    _inMemoryVotes.push(vote);
    return vote;
  }

  const { teacherVotes } = await import("../drizzle/schema");
  return await db.insert(teacherVotes).values(data);
}

export async function deleteTeacherVotes(teacherNameId: number, periodId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete votes: database not available");
    return undefined;
  }

  const { teacherVotes } = await import("../drizzle/schema");
  return await db
    .delete(teacherVotes)
    .where(
      and(
        eq(teacherVotes.teacherNameId, teacherNameId),
        eq(teacherVotes.votingPeriodId, periodId)
      )
    );
}

export async function getAllVotesForPeriod(periodId: number) {
  const db = await getDb();
  if (!db) {
    return _inMemoryVotes.filter(v => v.votingPeriodId === periodId);
  }

  const { teacherVotes } = await import("../drizzle/schema");
  return await db.select().from(teacherVotes).where(eq(teacherVotes.votingPeriodId, periodId));
}

export async function getTeacherVotesForPeriod(teacherNameId: number, periodId: number) {
  const db = await getDb();
  if (!db) {
    return _inMemoryVotes.filter(v => v.teacherNameId === teacherNameId && v.votingPeriodId === periodId);
  }

  const { teacherVotes } = await import("../drizzle/schema");
  return await db.select().from(teacherVotes).where(
    and(eq(teacherVotes.teacherNameId, teacherNameId), eq(teacherVotes.votingPeriodId, periodId))
  );
}


// ===== Teacher Names Functions =====

export async function getAllTeacherNames() {
  const db = await getDb();
  if (!db) {
    initInMemoryTeacherNames();
    return [..._inMemoryTeacherNames].sort((a, b) => a.fullName.localeCompare(b.fullName, 'ar'));
  }

  return await db.select().from(teacherNames).orderBy(teacherNames.fullName);
}

export async function getTeacherNameByName(fullName: string) {
  const db = await getDb();
  if (!db) {
    initInMemoryTeacherNames();
    const exact = _inMemoryTeacherNames.find(t => t.fullName === fullName);
    if (exact) return exact;
    const lastWord = fullName.trim().split(/\s+/).pop() || '';
    if (lastWord) {
      return _inMemoryTeacherNames.find(t => t.fullName.trim().split(/\s+/).pop() === lastWord) || null;
    }
    return null;
  }

  let results = await db.select().from(teacherNames).where(eq(teacherNames.fullName, fullName)).limit(1);
  if (results.length > 0) return results[0];

  const lastWord = fullName.trim().split(/\s+/).pop() || '';
  if (lastWord) {
    const allTeachers = await db.select().from(teacherNames);
    const matched = allTeachers.find(t => t.fullName.trim().split(/\s+/).pop() === lastWord);
    if (matched) return matched;
  }

  return null;
}

export async function getStudentById(studentId: number) {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    return _inMemoryStudents.find(s => s.id === studentId);
  }

  const result = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteStudent(studentId: number) {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    _inMemoryStudents = _inMemoryStudents.filter(s => s.id !== studentId);
    return;
  }

  await db.delete(students).where(eq(students.id, studentId));
}

export async function updateStudentName(studentId: number, fullName: string) {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    const student = _inMemoryStudents.find(s => s.id === studentId);
    if (student) {
      student.fullName = fullName;
      student.updatedAt = new Date();
    }
    return;
  }

  await db.update(students)
    .set({ fullName })
    .where(eq(students.id, studentId));
}

export async function getVotingReport(periodId: number) {
  const db = await getDb();
  if (!db) {
    initInMemoryTeacherNames();
    initInMemoryStudents();
    const periodVotes = _inMemoryVotes.filter(v => v.votingPeriodId === periodId);
    return _inMemoryTeacherNames
      .slice()
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "ar"))
      .map(teacher => {
        const votes = periodVotes
          .filter(v => v.teacherNameId === teacher.id)
          .sort((a, b) => a.voteRank - b.voteRank);
        return {
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          hasVoted: votes.length > 0,
          votedStudents: votes.map(v => {
            const s = _inMemoryStudents.find(st => st.id === v.studentId);
            return s ? s.fullName : `#${v.studentId}`;
          }),
          votedAt: votes.length > 0 ? votes[0].createdAt : null,
        };
      });
  }

  // Get all teacher names
  const allTeachers = await db.select().from(teacherNames);

  // Get all votes for this period with student details
  const votes = await db
    .select({
      teacherNameId: teacherVotes.teacherNameId,
      studentId: teacherVotes.studentId,
      voteRank: teacherVotes.voteRank,
      createdAt: teacherVotes.createdAt,
      studentName: students.fullName,
    })
    .from(teacherVotes)
    .leftJoin(students, eq(teacherVotes.studentId, students.id))
    .where(eq(teacherVotes.votingPeriodId, periodId));

  // Group votes by teacher
  const teacherVotesMap = new Map<number, any[]>();
  for (const vote of votes) {
    if (!teacherVotesMap.has(vote.teacherNameId)) {
      teacherVotesMap.set(vote.teacherNameId, []);
    }
    teacherVotesMap.get(vote.teacherNameId)!.push(vote);
  }

  // Build report
  const report = allTeachers.map(teacher => {
    const votes = teacherVotesMap.get(teacher.id) || [];
    const hasVoted = votes.length > 0;
    const votedStudents = votes
      .sort((a, b) => a.voteRank - b.voteRank)
      .map(v => v.studentName);
    const votedAt = votes.length > 0 ? votes[0].createdAt : null;

    return {
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      hasVoted,
      votedStudents,
      votedAt,
    };
  });

  return report;
}

// ===== Teacher Names Management Functions =====

export async function addTeacherName(fullName: string) {
  const db = await getDb();
  if (!db) {
    initInMemoryTeacherNames();
    const maxId = _inMemoryTeacherNames.length > 0 ? Math.max(..._inMemoryTeacherNames.map(t => t.id)) : 0;
    const newTeacher: InMemoryTeacherName = { id: maxId + 1, fullName, createdAt: new Date() };
    _inMemoryTeacherNames.push(newTeacher);
    return newTeacher;
  }

  return await db.insert(teacherNames).values({ fullName });
}

export async function deleteTeacherName(teacherId: number) {
  const db = await getDb();
  if (!db) {
    initInMemoryTeacherNames();
    _inMemoryTeacherNames = _inMemoryTeacherNames.filter(t => t.id !== teacherId);
    return;
  }

  return await db.delete(teacherNames).where(eq(teacherNames.id, teacherId));
}

// ===== Bulk Score Operations =====

export async function bulkUpdateScores(studentIds: number[], pointsDelta: number) {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    let updatedCount = 0;
    for (const s of _inMemoryStudents) {
      if (studentIds.includes(s.id)) {
        s.score = Math.max(0, s.score + pointsDelta);
        s.updatedAt = new Date();
        updatedCount++;
      }
    }
    return updatedCount;
  }

  // Get all students at once
  const allStudents = await db.select().from(students);
  const studentsToUpdate = allStudents.filter(s => studentIds.includes(s.id));

  // Update each student's score
  let updatedCount = 0;
  for (const student of studentsToUpdate) {
    const newScore = Math.max(0, (student.score || 0) + pointsDelta);
    await db.update(students).set({ score: newScore }).where(eq(students.id, student.id));
    updatedCount++;
  }

  return updatedCount;
}

export async function bulkAddScoresByFilter(points: number, grade?: string, section?: number) {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    let count = 0;
    for (const s of _inMemoryStudents) {
      const matchGrade = !grade || s.grade === grade;
      const matchSection = section === undefined || s.section === section;
      if (matchGrade && matchSection) {
        s.score += points;
        s.updatedAt = new Date();
        count++;
      }
    }
    return count;
  }

  // Build conditions
  const conditions = [];
  if (grade) {
    conditions.push(eq(students.grade, grade));
  }
  if (section !== undefined) {
    conditions.push(eq(students.section, section));
  }

  // Use single SQL UPDATE with increment for better performance
  // This is much faster than updating each student individually
  const { sql } = await import('drizzle-orm');

  if (conditions.length > 0) {
    // Count matching students first
    let countQuery = db.select().from(students);
    countQuery = countQuery.where(and(...conditions)) as any;
    const matchingStudents = await countQuery;
    const count = matchingStudents.length;

    // Update all matching students in one query using raw SQL increment
    await db.update(students)
      .set({ score: sql`score + ${points}` })
      .where(and(...conditions));

    return count;
  } else {
    // Count all students
    const allStudents = await db.select().from(students);
    const count = allStudents.length;

    // Update all students
    await db.update(students)
      .set({ score: sql`score + ${points}` });

    return count;
  }
}

export async function bulkDeductScoresByFilter(points: number, grade?: string, section?: number) {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    let count = 0;
    for (const s of _inMemoryStudents) {
      const matchGrade = !grade || s.grade === grade;
      const matchSection = section === undefined || s.section === section;
      if (matchGrade && matchSection) {
        s.score = Math.max(0, s.score - points);
        s.updatedAt = new Date();
        count++;
      }
    }
    return count;
  }

  // Build conditions
  const conditions = [];
  if (grade) {
    conditions.push(eq(students.grade, grade));
  }
  if (section !== undefined) {
    conditions.push(eq(students.section, section));
  }

  // Use single SQL UPDATE with GREATEST for better performance
  // GREATEST(0, score - points) ensures score doesn't go below 0
  const { sql } = await import('drizzle-orm');

  if (conditions.length > 0) {
    // Count matching students first
    let countQuery = db.select().from(students);
    countQuery = countQuery.where(and(...conditions)) as any;
    const matchingStudents = await countQuery;
    const count = matchingStudents.length;

    // Update all matching students in one query
    await db.update(students)
      .set({ score: sql`GREATEST(0, score - ${points})` })
      .where(and(...conditions));

    return count;
  } else {
    // Count all students
    const allStudents = await db.select().from(students);
    const count = allStudents.length;

    // Update all students
    await db.update(students)
      .set({ score: sql`GREATEST(0, score - ${points})` });

    return count;
  }
}


// Batch update scores for multiple students - optimized for performance
export async function batchUpdateScores(
  studentIds: number[],
  pointsChange: number,
  action: "add" | "deduct"
) {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    for (const s of _inMemoryStudents) {
      if (studentIds.includes(s.id)) {
        if (action === "add") {
          s.score += pointsChange;
        } else {
          s.score = Math.max(0, s.score - pointsChange);
        }
        s.updatedAt = new Date();
      }
    }
    return studentIds.length;
  }

  if (studentIds.length === 0) {
    return 0;
  }

  const { sql, inArray } = await import('drizzle-orm');

  if (action === "add") {
    // Add points to all selected students in one query
    await db.update(students)
      .set({ score: sql`score + ${pointsChange}` })
      .where(inArray(students.id, studentIds));
  } else {
    // Deduct points (ensure score doesn't go below 0)
    await db.update(students)
      .set({ score: sql`GREATEST(0, score - ${pointsChange})` })
      .where(inArray(students.id, studentIds));
  }

  return studentIds.length;
}


// ===== Activity Log Functions =====

export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) {
    const entry: InMemoryActivityLog = {
      id: _nextActivityLogId++,
      activityType: data.activityType,
      performedBy: data.performedBy,
      studentId: data.studentId ?? null,
      studentName: data.studentName ?? null,
      pointsChange: data.pointsChange ?? null,
      previousScore: data.previousScore ?? null,
      newScore: data.newScore ?? null,
      details: data.details ?? null,
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
      votingPeriodId: data.votingPeriodId ?? null,
      createdAt: new Date(),
    };
    _inMemoryActivityLog.unshift(entry);
    return entry;
  }

  return await db.insert(activityLog).values(data);
}

export async function getActivityLogs(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    return _inMemoryActivityLog.slice(offset, offset + limit);
  }

  return await db
    .select()
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getActivityLogsByType(activityType: string, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    return _inMemoryActivityLog.filter(l => l.activityType === activityType).slice(0, limit);
  }

  return await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.activityType, activityType))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

export async function getActivityLogsCount() {
  const db = await getDb();
  if (!db) {
    return _inMemoryActivityLog.length;
  }

  const result = await db.select().from(activityLog);
  return result.length;
}

export async function getTeacherVotingDetails(periodId: number) {
  const db = await getDb();
  if (!db) {
    initInMemoryTeacherNames();
    initInMemoryStudents();
    const periodVotes = _inMemoryVotes.filter(v => v.votingPeriodId === periodId);
    const votesByTeacher = new Map<number, InMemoryVote[]>();
    for (const v of periodVotes) {
      if (!votesByTeacher.has(v.teacherNameId)) votesByTeacher.set(v.teacherNameId, []);
      votesByTeacher.get(v.teacherNameId)!.push(v);
    }
    return _inMemoryTeacherNames.map(teacher => {
      const tvotes = votesByTeacher.get(teacher.id) || [];
      return {
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        hasVoted: tvotes.length > 0,
        votedStudents: tvotes.sort((a, b) => a.voteRank - b.voteRank).map(v => {
          const s = _inMemoryStudents.find(s => s.id === v.studentId);
          return { name: s?.fullName || "غير معروف", grade: s?.grade || "", rank: v.voteRank };
        }),
        votedAt: tvotes.length > 0 ? tvotes[0].createdAt : null,
      };
    });
  }

  // Get all teacher names
  const allTeachers = await db.select().from(teacherNames);

  // Get all votes for this period with student details
  const votes = await db
    .select({
      teacherNameId: teacherVotes.teacherNameId,
      studentId: teacherVotes.studentId,
      voteRank: teacherVotes.voteRank,
      createdAt: teacherVotes.createdAt,
      studentName: students.fullName,
      studentGrade: students.grade,
    })
    .from(teacherVotes)
    .leftJoin(students, eq(teacherVotes.studentId, students.id))
    .where(eq(teacherVotes.votingPeriodId, periodId));

  // Group votes by teacher
  const teacherVotesMap = new Map<number, any[]>();
  for (const vote of votes) {
    if (!teacherVotesMap.has(vote.teacherNameId)) {
      teacherVotesMap.set(vote.teacherNameId, []);
    }
    teacherVotesMap.get(vote.teacherNameId)!.push(vote);
  }

  // Build detailed report
  const report = allTeachers.map(teacher => {
    const teacherVotesList = teacherVotesMap.get(teacher.id) || [];
    const hasVoted = teacherVotesList.length > 0;
    const votedStudents = teacherVotesList
      .sort((a, b) => a.voteRank - b.voteRank)
      .map(v => ({
        name: v.studentName,
        grade: v.studentGrade,
        rank: v.voteRank,
      }));
    const votedAt = teacherVotesList.length > 0 ? teacherVotesList[0].createdAt : null;

    return {
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      hasVoted,
      votedStudents,
      votedAt,
    };
  });

  return report;
}


// Student Content queries

/** Get how many uploads a student has made in the last 24 hours */
export async function getStudentUploadCountLast24h(studentId: number): Promise<number> {
  const db = await getDb();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  if (!db) {
    return _inMemoryContent.filter(c => c.studentId === studentId && c.createdAt >= cutoff).length;
  }

  const result = await db.select().from(studentContent)
    .where(and(
      eq(studentContent.studentId, studentId),
      sql`${studentContent.createdAt} >= ${cutoff}`
    ));
  return result.length;
}

export async function createStudentContent(content: InsertStudentContent) {
  const db = await getDb();
  if (!db) {
    const entry: InMemoryContent = {
      id: _nextContentId++,
      studentId: content.studentId,
      contentType: content.contentType as "video" | "image",
      fileKey: content.fileKey,
      fileUrl: content.fileUrl,
      fileName: content.fileName,
      fileSize: content.fileSize,
      mimeType: content.mimeType ?? null,
      description: content.description ?? null,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
    };
    _inMemoryContent.push(entry);
    return entry;
  }
  return await db.insert(studentContent).values(content);
}

export async function getAllStudentContent(status?: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) {
    initInMemoryStudents();
    let filtered = [..._inMemoryContent];
    if (status) filtered = filtered.filter(c => c.status === status);
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return filtered.map(c => {
      const s = _inMemoryStudents.find(s => s.id === c.studentId);
      return { content: c, student: s || null };
    });
  }

  let query = db.select({
    content: studentContent,
    student: students,
  }).from(studentContent)
    .leftJoin(students, eq(studentContent.studentId, students.id));

  if (status) {
    query = query.where(eq(studentContent.status, status)) as any;
  }

  const result = await query.orderBy(desc(studentContent.createdAt));
  return result;
}

export async function getPendingContentCount() {
  const db = await getDb();
  if (!db) {
    return _inMemoryContent.filter(c => c.status === "pending").length;
  }

  const result = await db.select()
    .from(studentContent)
    .where(eq(studentContent.status, "pending"));
  return result.length;
}

export async function getStudentContentById(contentId: number) {
  const db = await getDb();
  if (!db) {
    return _inMemoryContent.find(c => c.id === contentId) || null;
  }

  const result = await db.select().from(studentContent).where(eq(studentContent.id, contentId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateContentStatus(
  contentId: number,
  status: "approved" | "rejected",
  reviewedBy: string
) {
  const db = await getDb();
  if (!db) {
    const content = _inMemoryContent.find(c => c.id === contentId);
    if (!content) return undefined;
    content.status = status;
    content.reviewedBy = reviewedBy;
    content.reviewedAt = new Date();

    if (status === "approved") {
      initInMemoryStudents();
      const student = _inMemoryStudents.find(s => s.id === content.studentId);
      if (student) {
        const previousScore = student.score;
        student.score += 10;
        student.updatedAt = new Date();

        _inMemoryActivityLog.unshift({
          id: _nextActivityLogId++,
          activityType: "content_approved",
          performedBy: reviewedBy,
          studentId: student.id,
          studentName: student.fullName,
          pointsChange: 10,
          previousScore,
          newScore: student.score,
          details: JSON.stringify({ contentId, contentType: content.contentType }),
          userAgent: null, ipAddress: null, votingPeriodId: null,
          createdAt: new Date(),
        });
      }
    }
    return { success: true };
  }

  await db.update(studentContent)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date()
    })
    .where(eq(studentContent.id, contentId));

  // If approved, add 10 points to the student
  if (status === "approved") {
    const content = await db.select()
      .from(studentContent)
      .where(eq(studentContent.id, contentId))
      .limit(1);

    if (content.length > 0) {
      const studentId = content[0].studentId;
      const student = await db.select()
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);

      if (student.length > 0) {
        const newScore = student[0].score + 10;
        await db.update(students)
          .set({ score: newScore })
          .where(eq(students.id, studentId));

        // Log the activity
        await db.insert(activityLog).values({
          activityType: "content_approved",
          performedBy: reviewedBy,
          studentId: studentId,
          studentName: student[0].fullName,
          pointsChange: 10,
          previousScore: student[0].score,
          newScore: newScore,
          details: JSON.stringify({ contentId, contentType: content[0].contentType }),
        });
      }
    }
  }

  return { success: true };
}

// ==================== System Settings ====================

/** Get a system setting by key */
export async function getSystemSetting(key: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/** Update a system setting */
export async function updateSystemSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return false;

  await db.update(systemSettings)
    .set({ settingValue: value })
    .where(eq(systemSettings.settingKey, key));
  return true;
}

/** Check if content submission is enabled */
export async function isContentSubmissionEnabled() {
  const db = await getDb();
  if (!db) return _inMemoryContentEnabled;
  const setting = await getSystemSetting('content_submission_enabled');
  return setting?.settingValue === 'true';
}

/** Toggle content submission */
export async function toggleContentSubmission(enabled: boolean) {
  const db = await getDb();
  if (!db) {
    _inMemoryContentEnabled = enabled;
    return true;
  }
  return await updateSystemSetting('content_submission_enabled', enabled ? 'true' : 'false');
}


// ==================== Score Categories (البنود) ====================

const _inMemoryCategories = [
  { id: 1, name: "حضور", points: 2, isCustom: 0, sortOrder: 1, isActive: 1, createdAt: new Date() },
  { id: 2, name: "غياب", points: -2, isCustom: 0, sortOrder: 2, isActive: 1, createdAt: new Date() },
  { id: 3, name: "مشاركة", points: 10, isCustom: 0, sortOrder: 3, isActive: 1, createdAt: new Date() },
  { id: 4, name: "مبادرة", points: 10, isCustom: 0, sortOrder: 4, isActive: 1, createdAt: new Date() },
  { id: 5, name: "درجة عامة", points: 0, isCustom: 1, sortOrder: 5, isActive: 1, createdAt: new Date() },
];

/** Get all active score categories */
export async function getScoreCategories() {
  const db = await getDb();
  if (!db) return _inMemoryCategories;

  return await db.select().from(scoreCategories)
    .where(eq(scoreCategories.isActive, 1))
    .orderBy(scoreCategories.sortOrder);
}

// ==================== Score History (السجل التاريخي) ====================

/** Add a score history entry */
export async function addScoreHistoryEntry(entry: InsertScoreHistory) {
  const db = await getDb();
  if (!db) return undefined;

  return await db.insert(scoreHistory).values(entry);
}

/** Get score history for a specific student */
export async function getStudentScoreHistory(studentId: number) {
  const db = await getDb();
  if (!db) {
    return _inMemoryScoreHistory.filter(h => h.studentId === studentId);
  }

  return await db.select().from(scoreHistory)
    .where(eq(scoreHistory.studentId, studentId))
    .orderBy(desc(scoreHistory.createdAt));
}

/** Apply category score to selected students (bulk) with history logging */
export async function applyCategoryToStudents(
  studentIds: number[],
  categoryId: number,
  categoryName: string,
  pointsChange: number,
  performedBy: string,
  comment?: string
) {
  const db = await getDb();

  if (studentIds.length === 0) return 0;

  if (!db) {
    let count = 0;
    for (const s of _inMemoryStudents) {
      if (studentIds.includes(s.id)) {
        const previousScore = s.score || 0;
        const newScore = Math.max(0, previousScore + pointsChange);
        s.score = newScore;
        s.updatedAt = new Date();
        count++;

        _inMemoryScoreHistory.unshift({
          id: _nextScoreHistoryId++,
          studentId: s.id,
          studentName: s.fullName,
          categoryId,
          categoryName,
          pointsChange,
          previousScore,
          newScore,
          performedBy,
          comment: comment || null,
          createdAt: new Date(),
        });

        _inMemoryActivityLog.unshift({
          id: _nextActivityLogId++,
          activityType: pointsChange >= 0 ? "add_score" : "deduct_score",
          performedBy,
          studentId: s.id,
          studentName: s.fullName,
          pointsChange,
          previousScore,
          newScore,
          details: JSON.stringify({ categoryId, categoryName, comment: comment || null }),
          userAgent: null,
          ipAddress: null,
          votingPeriodId: null,
          createdAt: new Date(),
        });
      }
    }
    return count;
  }

  const selectedStudents = await db.select().from(students)
    .where(inArray(students.id, studentIds));

  if (selectedStudents.length === 0) return 0;

  if (pointsChange >= 0) {
    await db.update(students)
      .set({ score: sql`GREATEST(0, COALESCE(${students.score}, 0) + ${pointsChange})` })
      .where(inArray(students.id, studentIds));
  } else {
    await db.update(students)
      .set({ score: sql`GREATEST(0, COALESCE(${students.score}, 0) + ${pointsChange})` })
      .where(inArray(students.id, studentIds));
  }

  const historyEntries = selectedStudents.map((student) => {
    const previousScore = student.score || 0;
    const newScore = Math.max(0, previousScore + pointsChange);
    return {
      studentId: student.id,
      studentName: student.fullName,
      categoryId,
      categoryName,
      pointsChange,
      previousScore,
      newScore,
      performedBy,
      comment: comment || null,
    };
  });

  const CHUNK_SIZE = 100;
  for (let i = 0; i < historyEntries.length; i += CHUNK_SIZE) {
    const chunk = historyEntries.slice(i, i + CHUNK_SIZE);
    await db.insert(scoreHistory).values(chunk);
  }

  return selectedStudents.length;
}

/** Apply category score to a single student with history logging */
export async function applyCategoryToStudent(
  studentId: number,
  categoryId: number,
  categoryName: string,
  pointsChange: number,
  performedBy: string,
  comment?: string
) {
  const db = await getDb();

  if (!db) {
    const s = _inMemoryStudents.find(s => s.id === studentId);
    if (!s) return null;
    const previousScore = s.score || 0;
    const newScore = Math.max(0, previousScore + pointsChange);
    s.score = newScore;
    s.updatedAt = new Date();

    _inMemoryScoreHistory.unshift({
      id: _nextScoreHistoryId++,
      studentId: s.id,
      studentName: s.fullName,
      categoryId,
      categoryName,
      pointsChange,
      previousScore,
      newScore,
      performedBy,
      comment: comment || null,
      createdAt: new Date(),
    });

    _inMemoryActivityLog.unshift({
      id: _nextActivityLogId++,
      activityType: pointsChange >= 0 ? "add_score" : "deduct_score",
      performedBy,
      studentId: s.id,
      studentName: s.fullName,
      pointsChange,
      previousScore,
      newScore,
      details: JSON.stringify({ categoryId, categoryName, comment: comment || null }),
      userAgent: null,
      ipAddress: null,
      votingPeriodId: null,
      createdAt: new Date(),
    });

    return { previousScore, newScore };
  }

  const student = await db.select().from(students)
    .where(eq(students.id, studentId)).limit(1);

  if (student.length === 0) return null;

  const previousScore = student[0].score || 0;
  const newScore = Math.max(0, previousScore + pointsChange);

  await db.update(students)
    .set({ score: newScore })
    .where(eq(students.id, studentId));

  await db.insert(scoreHistory).values({
    studentId,
    studentName: student[0].fullName,
    categoryId,
    categoryName,
    pointsChange,
    previousScore,
    newScore,
    performedBy,
    comment: comment || null,
  });

  return { previousScore, newScore };
}
