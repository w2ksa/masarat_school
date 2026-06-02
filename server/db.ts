import { eq, and, or, desc, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, teachers, InsertTeacher, educationalFiles, InsertEducationalFile, notifications, InsertNotification, students, InsertStudent, teacherNames, teacherVotes, votingPeriods, activityLog, InsertActivityLog, studentContent, InsertStudentContent, systemSettings, InsertSystemSetting, scoreCategories, InsertScoreCategory, scoreHistory, InsertScoreHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

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
  const rawStudents = [
    // أول أ (section 1)
    { fullName: "أحمد حسام الوادعي", grade: "أول", section: 1, score: 54 },
    { fullName: "أوس علي الشهري", grade: "أول", section: 1, score: 58 },
    { fullName: "بسام محمد القرني", grade: "أول", section: 1, score: 50 },
    { fullName: "تركي عبدالعزيز القحطاني", grade: "أول", section: 1, score: 58 },
    { fullName: "ثنيان محمد آل صالح", grade: "أول", section: 1, score: 62 },
    { fullName: "خالد هادي عسيري", grade: "أول", section: 1, score: 58 },
    { fullName: "سعود يحيى محمد", grade: "أول", section: 1, score: 62 },
    { fullName: "عبدالسلام محمد", grade: "أول", section: 1, score: 64 },
    { fullName: "عمر إبراهيم عسيري", grade: "أول", section: 1, score: 62 },
    { fullName: "فارس عبدالإله الحنيشي", grade: "أول", section: 1, score: 64 },
    { fullName: "محمد عبدالكريم أحمد خالد", grade: "أول", section: 1, score: 64 },
    { fullName: "مصعب عبدالكريم آل جبران", grade: "أول", section: 1, score: 60 },
    { fullName: "نواف ظافر العلياني", grade: "أول", section: 1, score: 62 },
    { fullName: "نواف عبدالرحمن السفياني", grade: "أول", section: 1, score: 64 },
    { fullName: "هيثم علي القحطاني", grade: "أول", section: 1, score: 56 },
    { fullName: "ياسر مشهور عسيري", grade: "أول", section: 1, score: 64 },
    // أول ب (section 2)
    { fullName: "أصيل صالح القحطاني", grade: "أول", section: 2, score: 62 },
    { fullName: "بدر فيصل طبيقي", grade: "أول", section: 2, score: 56 },
    { fullName: "بندر حمد القحطاني", grade: "أول", section: 2, score: 60 },
    { fullName: "تركي محمد الزهراني", grade: "أول", section: 2, score: 60 },
    { fullName: "تركي محمد العمري", grade: "أول", section: 2, score: 60 },
    { fullName: "حسن فارس علي", grade: "أول", section: 2, score: 56 },
    { fullName: "راكان يحيى عسيري", grade: "أول", section: 2, score: 62 },
    { fullName: "سلطان عبدالله مخفور", grade: "أول", section: 2, score: 60 },
    { fullName: "عبدالعزيز عبدالله آل حمود", grade: "أول", section: 2, score: 60 },
    { fullName: "عبدالعزيز محمد آل ناجي", grade: "أول", section: 2, score: 58 },
    { fullName: "عماد إبراهيم عسيري", grade: "أول", section: 2, score: 58 },
    { fullName: "عمر محمد عبدالله", grade: "أول", section: 2, score: 60 },
    { fullName: "فارس عبدالعزيز الشهراني", grade: "أول", section: 2, score: 56 },
    { fullName: "محمد عبدالله عسيري", grade: "أول", section: 2, score: 54 },
    { fullName: "هيثم عبدالله آل حنش", grade: "أول", section: 2, score: 62 },
    { fullName: "يحيى عبدالرحمن يحيى عسيري", grade: "أول", section: 2, score: 60 },
    // أول ج (section 3)
    { fullName: "أحمد سلطان عسيري", grade: "أول", section: 3, score: 60 },
    { fullName: "إلياس أسامة المصطفى", grade: "أول", section: 3, score: 62 },
    { fullName: "باسل سعود الزهراني", grade: "أول", section: 3, score: 60 },
    { fullName: "جابر علي جابر", grade: "أول", section: 3, score: 56 },
    { fullName: "حاتم محمد الراقدي", grade: "أول", section: 3, score: 58 },
    { fullName: "سعود ناصر الشهري", grade: "أول", section: 3, score: 62 },
    { fullName: "عبدالله سعيد القحطاني", grade: "أول", section: 3, score: 62 },
    { fullName: "علي أحمد الربعي", grade: "أول", section: 3, score: 58 },
    { fullName: "عمار محمد المهجري", grade: "أول", section: 3, score: 62 },
    { fullName: "فهد حسن عسيري", grade: "أول", section: 3, score: 52 },
    { fullName: "فيصل فهد القيسي", grade: "أول", section: 3, score: 62 },
    { fullName: "لؤي سلطان الفيفي", grade: "أول", section: 3, score: 60 },
    { fullName: "محمد عبدالعزيز القحطاني", grade: "أول", section: 3, score: 58 },
    { fullName: "معن صالح الجواهرة", grade: "أول", section: 3, score: 62 },
    { fullName: "مهند أيمن آل مطاعن", grade: "أول", section: 3, score: 56 },
    { fullName: "يوسف محمد عسيري", grade: "أول", section: 3, score: 62 },
    // ثاني أ (section 1)
    { fullName: "أسامه احمد ابراهيم عسيري", grade: "ثاني", section: 1, score: 60 },
    { fullName: "أسر سليمان بن محمد الشرقي", grade: "ثاني", section: 1, score: 60 },
    { fullName: "أنس عبدالله محمد عوض", grade: "ثاني", section: 1, score: 62 },
    { fullName: "ثامر محمد قاسم عسيري", grade: "ثاني", section: 1, score: 60 },
    { fullName: "ريان علي احمد الأسمري", grade: "ثاني", section: 1, score: 62 },
    { fullName: "سعد محمد سعد عسيري", grade: "ثاني", section: 1, score: 60 },
    { fullName: "سعيد محمد سعيد العكاسي", grade: "ثاني", section: 1, score: 56 },
    { fullName: "عبدالله احمد حسن الهيزعي", grade: "ثاني", section: 1, score: 60 },
    { fullName: "عزام يحي رشيد آل فرحان", grade: "ثاني", section: 1, score: 56 },
    { fullName: "علي عبدالرحمن محمد آل سليم", grade: "ثاني", section: 1, score: 56 },
    { fullName: "عماد عبدالرحمن محمد آل قهيب", grade: "ثاني", section: 1, score: 62 },
    { fullName: "فيصل فايز عوض بن ظفره", grade: "ثاني", section: 1, score: 60 },
    { fullName: "محمد أحمد محمد الشهري", grade: "ثاني", section: 1, score: 58 },
    { fullName: "ناصر خالد علي عسيري", grade: "ثاني", section: 1, score: 58 },
    { fullName: "نهار نايف عبد الله عسيري", grade: "ثاني", section: 1, score: 60 },
    // ثاني ب (section 2)
    { fullName: "أبان عبدالله سعيد عسيري", grade: "ثاني", section: 2, score: 58 },
    { fullName: "أحمد رائد احمد الزهراني", grade: "ثاني", section: 2, score: 68 },
    { fullName: "أحمد عبدالكريم احمد هيجان", grade: "ثاني", section: 2, score: 66 },
    { fullName: "باسل علي عوض آل عيسى", grade: "ثاني", section: 2, score: 64 },
    { fullName: "بدر عبدالكريم احمد هيجان", grade: "ثاني", section: 2, score: 66 },
    { fullName: "جسار عائض محمد عسيري", grade: "ثاني", section: 2, score: 64 },
    { fullName: "حاتم علي حنبص آل موسى", grade: "ثاني", section: 2, score: 50 },
    { fullName: "خالد سعيد بن عبدالله الاسمري", grade: "ثاني", section: 2, score: 66 },
    { fullName: "رائد خالد علي عسيري", grade: "ثاني", section: 2, score: 60 },
    { fullName: "سطام محمد عبدالله القحطاني", grade: "ثاني", section: 2, score: 66 },
    { fullName: "سعد سعيد ابن عبدالله القحطاني", grade: "ثاني", section: 2, score: 64 },
    { fullName: "عبدالرحمن ريان عبدالرحمن اليحيا", grade: "ثاني", section: 2, score: 60 },
    { fullName: "علي محمد علي آل منيف", grade: "ثاني", section: 2, score: 62 },
    { fullName: "عمر حسين سفر آل ثابت", grade: "ثاني", section: 2, score: 60 },
    { fullName: "فيصل مشبب الأحمري", grade: "ثاني", section: 2, score: 62 },
    { fullName: "محمد مريع سعد", grade: "ثاني", section: 2, score: 64 },
    { fullName: "مشعل توفيق سعيد الاحمري", grade: "ثاني", section: 2, score: 66 },
    { fullName: "ناصر عبدالله ناصر الشهراني", grade: "ثاني", section: 2, score: 66 },
    { fullName: "ناصر محمد ناصر الشهراني", grade: "ثاني", section: 2, score: 62 },
    { fullName: "يزن محمد عبدالرحمن عسيري", grade: "ثاني", section: 2, score: 68 },
    { fullName: "يزيد محمد سعيد الشطفان", grade: "ثاني", section: 2, score: 58 },
    // ثاني ج (section 3)
    { fullName: "اياس احمد سليمان الجابري", grade: "ثاني", section: 3, score: 60 },
    { fullName: "تركي هادي بن علي القحطاني", grade: "ثاني", section: 3, score: 62 },
    { fullName: "راكان محمد سعد الوادعي", grade: "ثاني", section: 3, score: 64 },
    { fullName: "رياض علي يحي الزيادي", grade: "ثاني", section: 3, score: 64 },
    { fullName: "زياد علي بن سعود عسيري", grade: "ثاني", section: 3, score: 40 },
    { fullName: "عارف علي احمد آل نيران", grade: "ثاني", section: 3, score: 58 },
    { fullName: "علي صالح خلوفه الاحمري", grade: "ثاني", section: 3, score: 54 },
    { fullName: "علي عبدالله علي ال هماس", grade: "ثاني", section: 3, score: 62 },
    { fullName: "فارس سعيد عبدالله القحطاني", grade: "ثاني", section: 3, score: 62 },
    { fullName: "كنان علي محمد عسيري", grade: "ثاني", section: 3, score: 60 },
    { fullName: "محمد علي بن حسن عسيري", grade: "ثاني", section: 3, score: 64 },
    { fullName: "نواف عادل بن ناصر العسيري", grade: "ثاني", section: 3, score: 52 },
    { fullName: "هتان محمد بن علي زامل", grade: "ثاني", section: 3, score: 58 },
    { fullName: "يحيى علي بن يحيى ال شلوان", grade: "ثاني", section: 3, score: 66 },
    // ثالث أ (section 1)
    { fullName: "باسل محمد سعيد القحطاني", grade: "ثالث", section: 1, score: 60 },
    { fullName: "بدر ماجد علي العسيري", grade: "ثالث", section: 1, score: 58 },
    { fullName: "تميم طارق حسن القحطاني", grade: "ثالث", section: 1, score: 58 },
    { fullName: "تميم مبارك بن فهد القحطاني", grade: "ثالث", section: 1, score: 52 },
    { fullName: "جاسر احمد ابن صالح عسيري", grade: "ثالث", section: 1, score: 60 },
    { fullName: "حمود عبدالرحمن جرمان الاسمري", grade: "ثالث", section: 1, score: 62 },
    { fullName: "رويد عبدالله سعيد محروس", grade: "ثالث", section: 1, score: 52 },
    { fullName: "زياد عبدالله محمد الشهراني", grade: "ثالث", section: 1, score: 56 },
    { fullName: "سلمان محمد ناصر آل احمد", grade: "ثالث", section: 1, score: 54 },
    { fullName: "عبدالاله احمد حسن الفهي", grade: "ثالث", section: 1, score: 60 },
    { fullName: "عز محمد مرعي القرني", grade: "ثالث", section: 1, score: 64 },
    { fullName: "علي احمد ماطر ال شواف", grade: "ثالث", section: 1, score: 62 },
    { fullName: "علي محمد علي الشديدي", grade: "ثالث", section: 1, score: 62 },
    { fullName: "علي منصور عامر القرني", grade: "ثالث", section: 1, score: 54 },
    { fullName: "عمر احمد ماطر ال شواف", grade: "ثالث", section: 1, score: 62 },
    { fullName: "مؤيد عبدالرحمن علي الشهري", grade: "ثالث", section: 1, score: 58 },
    { fullName: "مراد سعيد عبدالرحمن عسيري", grade: "ثالث", section: 1, score: 48 },
    { fullName: "مشعل عبدالله يحيى الشهراني", grade: "ثالث", section: 1, score: 60 },
    { fullName: "معاذ ظافر عايض القحطاني", grade: "ثالث", section: 1, score: 60 },
    { fullName: "نواف ماجد حمود الحسام", grade: "ثالث", section: 1, score: 60 },
    { fullName: "هشام محمد منصور العسيري", grade: "ثالث", section: 1, score: 58 },
    { fullName: "هيثم محمد ابراهيم آل مطاعن", grade: "ثالث", section: 1, score: 58 },
    { fullName: "يحيى جبران يحيى آل جحدل", grade: "ثالث", section: 1, score: 64 },
    { fullName: "يزن أنس بن ابراهيم علوان", grade: "ثالث", section: 1, score: 62 },
    { fullName: "يزيد يحيى سعد عسيري", grade: "ثالث", section: 1, score: 60 },
    // ثالث ب (section 2)
    { fullName: "اسامه مهند سعيد عسيري", grade: "ثالث", section: 2, score: 54 },
    { fullName: "بتال علي سابر الاسمري", grade: "ثالث", section: 2, score: 64 },
    { fullName: "حسن علي حسن آل عدينان", grade: "ثالث", section: 2, score: 62 },
    { fullName: "خالد سعد محمد عسيري", grade: "ثالث", section: 2, score: 58 },
    { fullName: "رائد احمد علي القحطاني", grade: "ثالث", section: 2, score: 64 },
    { fullName: "راكان عبدالله احمد الشهري", grade: "ثالث", section: 2, score: 68 },
    { fullName: "زايد عبدالله مبارك الشهراني", grade: "ثالث", section: 2, score: 58 },
    { fullName: "زياد محمد حسن القحطاني", grade: "ثالث", section: 2, score: 58 },
    { fullName: "سعود تركي علي الاسمري", grade: "ثالث", section: 2, score: 60 },
    { fullName: "سعيد علي ابن يحي بن شبعان", grade: "ثالث", section: 2, score: 62 },
    { fullName: "سعيد محمد حسن قحطاني", grade: "ثالث", section: 2, score: 58 },
    { fullName: "سلمان مريع سعد هياش", grade: "ثالث", section: 2, score: 62 },
    { fullName: "سند ناصر محمد علاي", grade: "ثالث", section: 2, score: 62 },
    { fullName: "سيف ناصر محمد علاي", grade: "ثالث", section: 2, score: 62 },
    { fullName: "عبدالرحمن علي بن عوض الوادعي", grade: "ثالث", section: 2, score: 62 },
    { fullName: "عبدالله محمد ابن عبدالله آل ناجي", grade: "ثالث", section: 2, score: 62 },
    { fullName: "عبدالملك فارس ابن عبدالله سرحان", grade: "ثالث", section: 2, score: 60 },
    { fullName: "عزام محمد علي عسيري", grade: "ثالث", section: 2, score: 74 },
    { fullName: "محمد أنس محمد مجدوع", grade: "ثالث", section: 2, score: 60 },
    { fullName: "محمد عادل محمد عسيري", grade: "ثالث", section: 2, score: 62 },
    { fullName: "محمد عبدالعزيز محمد أبوسبعه", grade: "ثالث", section: 2, score: 60 },
    { fullName: "مشهور مسفر سعيد آل كعبان", grade: "ثالث", section: 2, score: 62 },
    { fullName: "نايف غازي عوض القحطاني", grade: "ثالث", section: 2, score: 62 },
    { fullName: "وسام حافظ احمد العسكري", grade: "ثالث", section: 2, score: 58 },
    // ثالث ج (section 3)
    { fullName: "أوس يحي عائض عسيري", grade: "ثالث", section: 3, score: 62 },
    { fullName: "اياس فائع علي عسيري", grade: "ثالث", section: 3, score: 58 },
    { fullName: "باسل جبران حسن القحطاني", grade: "ثالث", section: 3, score: 60 },
    { fullName: "حمزه عبدالله حسن الوادعي", grade: "ثالث", section: 3, score: 58 },
    { fullName: "خالد سلطان محمد العمري", grade: "ثالث", section: 3, score: 62 },
    { fullName: "خالد عبدالرحمن أحمد عبدلي", grade: "ثالث", section: 3, score: 62 },
    { fullName: "خالد علي محمد عباسي", grade: "ثالث", section: 3, score: 56 },
    { fullName: "سعد مصطفى سعد القحطاني", grade: "ثالث", section: 3, score: 64 },
    { fullName: "سلمان عبدالله حسن بالحارث", grade: "ثالث", section: 3, score: 62 },
    { fullName: "سند خالد احمد الخالدي", grade: "ثالث", section: 3, score: 62 },
    { fullName: "صقر عوض محمد القحطاني", grade: "ثالث", section: 3, score: 62 },
    { fullName: "عادل علي سعد الشهراني", grade: "ثالث", section: 3, score: 60 },
    { fullName: "عبدالعزيز محمد جربوع الشهراني", grade: "ثالث", section: 3, score: 60 },
    { fullName: "فهد عبدالرحمن علي الزهراني", grade: "ثالث", section: 3, score: 62 },
    { fullName: "فيصل سعود لاحق مسود", grade: "ثالث", section: 3, score: 56 },
    { fullName: "كرم خالد راتب الزرير", grade: "ثالث", section: 3, score: 58 },
    { fullName: "محمد راشد علي آل هتيله", grade: "ثالث", section: 3, score: 60 },
    { fullName: "محمد عامر راضي الدغاصي", grade: "ثالث", section: 3, score: 64 },
    { fullName: "محمد علي احمد عسيري", grade: "ثالث", section: 3, score: 60 },
    { fullName: "مهند محمد عبده السيد", grade: "ثالث", section: 3, score: 62 },
    { fullName: "هادي حسن هادي الوادعي", grade: "ثالث", section: 3, score: 62 },
    { fullName: "يزيد بن محمد بن سعد العمري", grade: "ثالث", section: 3, score: 60 },
    // رابع أ (section 1)
    { fullName: "اياس عبدالرحمن محمدالياس الازوري", grade: "رابع", section: 1, score: 58 },
    { fullName: "بدر حسن عثمان القرني", grade: "رابع", section: 1, score: 56 },
    { fullName: "جسار علي محمد شايع", grade: "رابع", section: 1, score: 60 },
    { fullName: "جسار محمد عبدالله شايع", grade: "رابع", section: 1, score: 62 },
    { fullName: "حازم عائض محمد عسيري", grade: "رابع", section: 1, score: 70 },
    { fullName: "خالد وليد محمد عسيري", grade: "رابع", section: 1, score: 60 },
    { fullName: "رويد ناصر محمد عسيري", grade: "رابع", section: 1, score: 70 },
    { fullName: "ريان الحسن زبن الله الحارثي", grade: "رابع", section: 1, score: 70 },
    { fullName: "سلمان حاتم ناصر المعاوي", grade: "رابع", section: 1, score: 58 },
    { fullName: "عبدالله نايف عبده الأسمري", grade: "رابع", section: 1, score: 58 },
    { fullName: "علي طاهر الشهري", grade: "رابع", section: 1, score: 72 },
    { fullName: "علي محمد على بهكلي", grade: "رابع", section: 1, score: 64 },
    { fullName: "علي ناصر علي عسيري", grade: "رابع", section: 1, score: 64 },
    { fullName: "عمر مفرح زايد البناوي", grade: "رابع", section: 1, score: 62 },
    { fullName: "فارس محمد عبدالهادي العمري", grade: "رابع", section: 1, score: 66 },
    { fullName: "فهد خالد فهد القحطاني", grade: "رابع", section: 1, score: 56 },
    { fullName: "قصي سعيد حسن العمري", grade: "رابع", section: 1, score: 72 },
    { fullName: "محمد يحي مسعود الفيفي", grade: "رابع", section: 1, score: 56 },
    { fullName: "محمد يحيى جابر عسيري", grade: "رابع", section: 1, score: 52 },
    { fullName: "نايف عبدالعزيز الزميلي", grade: "رابع", section: 1, score: 58 },
    { fullName: "نايف علي يحيى الشهري", grade: "رابع", section: 1, score: 58 },
    { fullName: "هتان علي سعد القرني", grade: "رابع", section: 1, score: 62 },
    { fullName: "يحيى محمد يحي القحطاني", grade: "رابع", section: 1, score: 60 },
    // رابع ب (section 2)
    { fullName: "أحمد عبدالرحمن عامر القرني", grade: "رابع", section: 2, score: 60 },
    { fullName: "الياس يزيد موسى آل حيدر", grade: "رابع", section: 2, score: 64 },
    { fullName: "بدر شتوي معيض القحطاني", grade: "رابع", section: 2, score: 62 },
    { fullName: "تركي عبدالعزيز صالح الشهري", grade: "رابع", section: 2, score: 62 },
    { fullName: "تميم سعيد ناصر عسيري", grade: "رابع", section: 2, score: 62 },
    { fullName: "تميم عبدالرحمن عوض الشهري", grade: "رابع", section: 2, score: 62 },
    { fullName: "تيام سعيد بن محمد عسيري", grade: "رابع", section: 2, score: 66 },
    { fullName: "خالد عبدالله بن عائض آل مرعان", grade: "رابع", section: 2, score: 62 },
    { fullName: "راشد بن أحمد بن مغرم العمري", grade: "رابع", section: 2, score: 62 },
    { fullName: "رامي عبدالله صالح الوابل", grade: "رابع", section: 2, score: 58 },
    { fullName: "زياد عبدالله سعيد الغامدي", grade: "رابع", section: 2, score: 62 },
    { fullName: "زياد عبدالله مسفر الغامدي", grade: "رابع", section: 2, score: 70 },
    { fullName: "زياد محمد بن مشبب آل محمد", grade: "رابع", section: 2, score: 62 },
    { fullName: "سعود عبدالعزيز جودالله عسيري", grade: "رابع", section: 2, score: 64 },
    { fullName: "صالح عبدالله سعد العمري", grade: "رابع", section: 2, score: 60 },
    { fullName: "عبدالاله عبدالله معدي الشهري", grade: "رابع", section: 2, score: 60 },
    { fullName: "عبدالعزيز محمد ظافر القحطاني", grade: "رابع", section: 2, score: 58 },
    { fullName: "عبدالله حسام عبدالله الوادعي", grade: "رابع", section: 2, score: 50 },
    { fullName: "عبدالمجيد احمد ابن سعيد آل مالح", grade: "رابع", section: 2, score: 62 },
    { fullName: "عبدالمجيد عبدالرحمن حسن الراشدي", grade: "رابع", section: 2, score: 60 },
    { fullName: "عدي علي ضيف الله القرني", grade: "رابع", section: 2, score: 60 },
    { fullName: "عمر علي يحيى آل قراش", grade: "رابع", section: 2, score: 60 },
    { fullName: "فهد شريف عبده الأسمري", grade: "رابع", section: 2, score: 56 },
    { fullName: "فهد علي محمد عياشي", grade: "رابع", section: 2, score: 58 },
    { fullName: "كريم حذيفة محمد السليمي", grade: "رابع", section: 2, score: 64 },
    { fullName: "مانع محمد مانع آل محيا", grade: "رابع", section: 2, score: 60 },
    { fullName: "منذر حمد عبدالله حاضر", grade: "رابع", section: 2, score: 56 },
    { fullName: "نواف سعد بن محمد آل فضيل", grade: "رابع", section: 2, score: 58 },
    { fullName: "نواف يحيى عبدالرحمن محمد", grade: "رابع", section: 2, score: 62 },
    // رابع ج (section 3)
    { fullName: "أحمد ابراهيم علي عسيري", grade: "رابع", section: 3, score: 54 },
    { fullName: "أحمد محمد أحمد آل مشافي", grade: "رابع", section: 3, score: 60 },
    { fullName: "إياد إبراهيم مرعي الربعي", grade: "رابع", section: 3, score: 62 },
    { fullName: "المنذر علي محمد معيض", grade: "رابع", section: 3, score: 56 },
    { fullName: "بتال عبدالمجيد عثمان ال جرادة", grade: "رابع", section: 3, score: 70 },
    { fullName: "تميم نايف عبدالله عسيري", grade: "رابع", section: 3, score: 60 },
    { fullName: "جاسر محمد جاسر الشهري", grade: "رابع", section: 3, score: 64 },
    { fullName: "حسام صالح هادي عسيري", grade: "رابع", section: 3, score: 62 },
    { fullName: "زايد سلطان عبدالله ناحي", grade: "رابع", section: 3, score: 56 },
    { fullName: "سلمان عبدالله عبدالرحمن عسيري", grade: "رابع", section: 3, score: 62 },
    { fullName: "سيف سعد محمد سعران", grade: "رابع", section: 3, score: 60 },
    { fullName: "سيف محمد ابراهيم فقيه", grade: "رابع", section: 3, score: 56 },
    { fullName: "عبدالله سعد سعيد بن حمه", grade: "رابع", section: 3, score: 56 },
    { fullName: "عبدالله عبداللطيف محفوظ محمد", grade: "رابع", section: 3, score: 64 },
    { fullName: "عبدالله محمد الشهراني", grade: "رابع", section: 3, score: 62 },
    { fullName: "علي عجيبي راشد الحربي", grade: "رابع", section: 3, score: 52 },
    { fullName: "محمد سعيد محمد القحطاني", grade: "رابع", section: 3, score: 60 },
    { fullName: "محمد عبدالملك محمد ال سلمان", grade: "رابع", section: 3, score: 58 },
    { fullName: "محمد علي خلف الزهراني", grade: "رابع", section: 3, score: 62 },
    { fullName: "نواف احمد حسن الهيزعي", grade: "رابع", section: 3, score: 60 },
    { fullName: "نواف منيف ضيف الله الغامدي", grade: "رابع", section: 3, score: 46 },
    { fullName: "يوسف أسامة المصطفى", grade: "رابع", section: 3, score: 62 },
    // رابع د (section 4)
    { fullName: "أحمد علي أحمد آل داهش", grade: "رابع", section: 4, score: 60 },
    { fullName: "أوس فريد فايع آل فائع", grade: "رابع", section: 4, score: 60 },
    { fullName: "تميم سعد محمد الأسمري", grade: "رابع", section: 4, score: 58 },
    { fullName: "تميم عبدالعزيز محمد القحطاني", grade: "رابع", section: 4, score: 58 },
    { fullName: "تميم عيسى احمد عسيري", grade: "رابع", section: 4, score: 64 },
    { fullName: "تميم محمد بن سعد الشهري", grade: "رابع", section: 4, score: 60 },
    { fullName: "تميم محمد عبدالرحمن الأسمري", grade: "رابع", section: 4, score: 62 },
    { fullName: "جياد سعد محمد ال احمد", grade: "رابع", section: 4, score: 58 },
    { fullName: "حسن خالد حسن الشهري", grade: "رابع", section: 4, score: 62 },
    { fullName: "حسن فيصل حسن طبيقي", grade: "رابع", section: 4, score: 58 },
    { fullName: "رامي عبدالعزيز محمد", grade: "رابع", section: 4, score: 60 },
    { fullName: "ريان حامد مجدوع القرني", grade: "رابع", section: 4, score: 60 },
    { fullName: "زايد حسن مريع آل حمدان", grade: "رابع", section: 4, score: 58 },
    { fullName: "زيد ماهر مصلح الشامي", grade: "رابع", section: 4, score: 62 },
    { fullName: "سعيد عبدالرحمن سعيد عسيري", grade: "رابع", section: 4, score: 60 },
    { fullName: "عبدالاله عايض عبدالله عسيري", grade: "رابع", section: 4, score: 64 },
    { fullName: "عبدالله وليد يحي آل جحيف", grade: "رابع", section: 4, score: 44 },
    { fullName: "عبدالملك حسن سليمان الفيفي", grade: "رابع", section: 4, score: 52 },
    { fullName: "عبدالوهاب حسن احمد ال طالع", grade: "رابع", section: 4, score: 60 },
    { fullName: "علي احمد علي عسيري", grade: "رابع", section: 4, score: 60 },
    { fullName: "فاضل حمود بن محمد جابر", grade: "رابع", section: 4, score: 64 },
    { fullName: "لورنس حجري راجح الشهري", grade: "رابع", section: 4, score: 62 },
    { fullName: "مازن فايز عبده الشهري", grade: "رابع", section: 4, score: 60 },
    { fullName: "محمد علي محمد الخثعمي", grade: "رابع", section: 4, score: 54 },
    { fullName: "محمد منصور جرمان الأسمري", grade: "رابع", section: 4, score: 62 },
    { fullName: "مشعل محمد غزواني", grade: "رابع", section: 4, score: 62 },
    { fullName: "ناصر عادل بدوي", grade: "رابع", section: 4, score: 56 },
    { fullName: "نواف سعيد بن عبدالله بن يعن الله", grade: "رابع", section: 4, score: 62 },
    // خامس أ (section 1)
    { fullName: "تميم عبدالله علي الأسمري", grade: "خامس", section: 1, score: 60 },
    { fullName: "تميم فيصل سعد آل شيبان", grade: "خامس", section: 1, score: 58 },
    { fullName: "راشد عيسى علي القشر", grade: "خامس", section: 1, score: 48 },
    { fullName: "زياد هليل عبدالله العتيبي", grade: "خامس", section: 1, score: 56 },
    { fullName: "سلطان علي سعيد القحطاني", grade: "خامس", section: 1, score: 54 },
    { fullName: "صالح عوض علي ال عباس", grade: "خامس", section: 1, score: 70 },
    { fullName: "عائض محمد عائض الشهري", grade: "خامس", section: 1, score: 60 },
    { fullName: "عادل علي الشهري", grade: "خامس", section: 1, score: 70 },
    { fullName: "عادل مفرح زايد البناوي", grade: "خامس", section: 1, score: 80 },
    { fullName: "عبدالله محمد عبدالله شايع", grade: "خامس", section: 1, score: 70 },
    { fullName: "علي عبدالله علي العمري", grade: "خامس", section: 1, score: 58 },
    { fullName: "عمر عبدالعزيز علي البكري", grade: "خامس", section: 1, score: 60 },
    { fullName: "عمر ماجد عبدالله الشهري", grade: "خامس", section: 1, score: 72 },
    { fullName: "فهد عبدالرحمن محمد ال سليم", grade: "خامس", section: 1, score: 60 },
    { fullName: "مشاري سعد شائع القحطاني", grade: "خامس", section: 1, score: 60 },
    { fullName: "منصور عبدالناصر محمد الشهري", grade: "خامس", section: 1, score: 50 },
    { fullName: "موسى يزيد موسى آل حيدر", grade: "خامس", section: 1, score: 62 },
    { fullName: "نايف تركي بن معيض آل سالم", grade: "خامس", section: 1, score: 68 },
    // خامس ب (section 2)
    { fullName: "أسامة سعد محمد السناني", grade: "خامس", section: 2, score: 62 },
    { fullName: "إبراهيم محمد عادل البعداني", grade: "خامس", section: 2, score: 60 },
    { fullName: "بتال عبدالعزيز محمد القحطاني", grade: "خامس", section: 2, score: 66 },
    { fullName: "بدر علي إبراهيم ال نشبه", grade: "خامس", section: 2, score: 58 },
    { fullName: "بسام سعيد علي آل سعد", grade: "خامس", section: 2, score: 68 },
    { fullName: "تركي علي موسى الشهراني", grade: "خامس", section: 2, score: 62 },
    { fullName: "خالد سعيد يحيى ال شويل", grade: "خامس", section: 2, score: 84 },
    { fullName: "سلطان عبدالعزيز ابراهيم فقيه", grade: "خامس", section: 2, score: 58 },
    { fullName: "سلمان حسن محمد مغرم", grade: "خامس", section: 2, score: 70 },
    { fullName: "سلمان علي خلف الزهراني", grade: "خامس", section: 2, score: 72 },
    { fullName: "طلال خالد عائض ال جازع", grade: "خامس", section: 2, score: 72 },
    { fullName: "عبدالاله محمد تركي الشهري", grade: "خامس", section: 2, score: 58 },
    { fullName: "عبدالكريم علي عسيري", grade: "خامس", section: 2, score: 52 },
    { fullName: "عبدالله علي عبدالله الاسمري", grade: "خامس", section: 2, score: 70 },
    { fullName: "عبدالله موسى علي العسيري", grade: "خامس", section: 2, score: 60 },
    { fullName: "علي عبدالله علي ال سبار", grade: "خامس", section: 2, score: 74 },
    { fullName: "محمد عبدالله محمد المالكي", grade: "خامس", section: 2, score: 62 },
    { fullName: "محمد فارس مسفر العمورات", grade: "خامس", section: 2, score: 72 },
    { fullName: "معن يحيى منصور عسيري", grade: "خامس", section: 2, score: 60 },
    { fullName: "نايف وليد يحيى ال جحيف", grade: "خامس", section: 2, score: 44 },
    // خامس ج (section 3)
    { fullName: "أحمد علي أحمد عسيري", grade: "خامس", section: 3, score: 72 },
    { fullName: "أحمد يحيى الحسين العسيري", grade: "خامس", section: 3, score: 62 },
    { fullName: "بسام علي احمد ال عامر", grade: "خامس", section: 3, score: 54 },
    { fullName: "تميم بندر أحمد الأحمري", grade: "خامس", section: 3, score: 62 },
    { fullName: "تميم علي عيسى عسيري", grade: "خامس", section: 3, score: 62 },
    { fullName: "تميم مشرف ضيف الله الشهري", grade: "خامس", section: 3, score: 60 },
    { fullName: "خالد احمد حسن الهيزعي", grade: "خامس", section: 3, score: 62 },
    { fullName: "رياض يحيى علي ال دحمس", grade: "خامس", section: 3, score: 82 },
    { fullName: "سطام متعب حريق الاحمري", grade: "خامس", section: 3, score: 60 },
    { fullName: "سعد دخيل الله سعد الشمراني", grade: "خامس", section: 3, score: 62 },
    { fullName: "سعود عبدالله يوسف ال قاسم", grade: "خامس", section: 3, score: 60 },
    { fullName: "عبدالوهاب غازي محمد ناصر", grade: "خامس", section: 3, score: 58 },
    { fullName: "علي سيف علي محمد", grade: "خامس", section: 3, score: 60 },
    { fullName: "ماجد حسين عبدالرحمن", grade: "خامس", section: 3, score: 60 },
    { fullName: "مجاهد علي عامر القرني", grade: "خامس", section: 3, score: 58 },
    { fullName: "مشاري ظافر حميدي آل لغر", grade: "خامس", section: 3, score: 60 },
    { fullName: "مشاري محمد عوض المهجري", grade: "خامس", section: 3, score: 62 },
    { fullName: "مهند عبدالواحد أحمد الزهراني", grade: "خامس", section: 3, score: 82 },
    { fullName: "نواف محمد سعيد الشهراني", grade: "خامس", section: 3, score: 62 },
    { fullName: "نواف يزيد يحيى النعمي", grade: "خامس", section: 3, score: 60 },
    { fullName: "وسام هادي فائع عسيري", grade: "خامس", section: 3, score: 58 },
    // خامس د (section 4)
    { fullName: "أبي ابراهيم احمد ناجي", grade: "خامس", section: 4, score: 50 },
    { fullName: "أحمد علي أحمد آل سعيد", grade: "خامس", section: 4, score: 58 },
    { fullName: "أمين أحمد عبدالقادر أبو جبل", grade: "خامس", section: 4, score: 60 },
    { fullName: "أنس يحيى ناصر الزهراني", grade: "خامس", section: 4, score: 64 },
    { fullName: "تميم حسن إبراهيم آل جبار", grade: "خامس", section: 4, score: 64 },
    { fullName: "تميم عائض محمد البشري", grade: "خامس", section: 4, score: 58 },
    { fullName: "تميم علي حمدي أل حلبوب", grade: "خامس", section: 4, score: 58 },
    { fullName: "خالد حسن آل عمير", grade: "خامس", section: 4, score: 68 },
    { fullName: "خالد يعقوب اسماعيل جوابره", grade: "خامس", section: 4, score: 72 },
    { fullName: "راكان عبدالله يحي عسيري", grade: "خامس", section: 4, score: 66 },
    { fullName: "صالح ماجد صالح ال سعدان", grade: "خامس", section: 4, score: 62 },
    { fullName: "عبدالاله عبدالله علي آل كاسي", grade: "خامس", section: 4, score: 62 },
    { fullName: "عبدالله احمد محمد ال حنش", grade: "خامس", section: 4, score: 72 },
    { fullName: "عبدالله مشعل عبدالله أبو مسمار", grade: "خامس", section: 4, score: 68 },
    { fullName: "عمر علي ظافر الشهراني", grade: "خامس", section: 4, score: 74 },
    { fullName: "غراس عمر علي ال عمر", grade: "خامس", section: 4, score: 70 },
    { fullName: "فهد حسين آل ناجي القحطاني", grade: "خامس", section: 4, score: 60 },
    { fullName: "مالك محمد سالم الشهري", grade: "خامس", section: 4, score: 62 },
    { fullName: "محمد اسماعيل محمد البشري", grade: "خامس", section: 4, score: 58 },
    { fullName: "محمد فهد عبدالله ناحي", grade: "خامس", section: 4, score: 72 },
    { fullName: "نهيان محمد عبدالله مفرح", grade: "خامس", section: 4, score: 60 },
    { fullName: "هشام حسين سعيد عامر", grade: "خامس", section: 4, score: 70 },
    { fullName: "يامن ابراهيم علي عسيري", grade: "خامس", section: 4, score: 70 },
    // سادس أ (section 1)
    { fullName: "احمد عبدالكريم احمد علي", grade: "سادس", section: 1, score: 74 },
    { fullName: "البراء محمد أحمد عسيري", grade: "سادس", section: 1, score: 48 },
    { fullName: "بتال سعود سعيد الاسمري", grade: "سادس", section: 1, score: 70 },
    { fullName: "جبران عبدالله مبارك ال جرمان الشهراني", grade: "سادس", section: 1, score: 82 },
    { fullName: "جسار طارق القحطاني", grade: "سادس", section: 1, score: 68 },
    { fullName: "خالد بن وليد يحيى القحطاني", grade: "سادس", section: 1, score: 58 },
    { fullName: "خالد سعد عبدالرحمن العمري", grade: "سادس", section: 1, score: 72 },
    { fullName: "دويل محمد دويل بالحامض", grade: "سادس", section: 1, score: 62 },
    { fullName: "سعيد سفر سعيد الشهراني", grade: "سادس", section: 1, score: 58 },
    { fullName: "صالح خلوفة سعيد الأحمري", grade: "سادس", section: 1, score: 62 },
    { fullName: "ظافر محمد ظافر الشهري", grade: "سادس", section: 1, score: 70 },
    { fullName: "عبدالعزيز سعيد يحيى ال شويل", grade: "سادس", section: 1, score: 94 },
    { fullName: "عبدالله محمد عبدالله العمري", grade: "سادس", section: 1, score: 60 },
    { fullName: "علي محمد علي ال عليه", grade: "سادس", section: 1, score: 58 },
    { fullName: "علي محمد منصور مدخلي", grade: "سادس", section: 1, score: 48 },
    { fullName: "فارس فايز عبدالله الشهري", grade: "سادس", section: 1, score: 56 },
    { fullName: "فارس محمد ظافر الشهري", grade: "سادس", section: 1, score: 70 },
    { fullName: "فيصل صالح خلوفة الأحمري", grade: "سادس", section: 1, score: 48 },
    { fullName: "مؤيد سعيد سعد الغامدي", grade: "سادس", section: 1, score: 58 },
    { fullName: "مشعل محمد مهدي القحطاني", grade: "سادس", section: 1, score: 64 },
    { fullName: "وسام يعن الله سعيد الشهري", grade: "سادس", section: 1, score: 72 },
    // سادس ب (section 2)
    { fullName: "آسر محمد علي آل نازح", grade: "سادس", section: 2, score: 60 },
    { fullName: "أحمد عبدالله سعد العمري", grade: "سادس", section: 2, score: 62 },
    { fullName: "احمد ابراهيم احمد عسيري", grade: "سادس", section: 2, score: 60 },
    { fullName: "اسماعيل محمد اسماعيل حمدان", grade: "سادس", section: 2, score: 62 },
    { fullName: "المثنى محمد شعشوع الاسمري", grade: "سادس", section: 2, score: 74 },
    { fullName: "بتال سعيد عوضه آل واكد", grade: "سادس", section: 2, score: 74 },
    { fullName: "تركي عبدالله سعد القحطاني", grade: "سادس", section: 2, score: 68 },
    { fullName: "تميم حذيفة محمد السليمي", grade: "سادس", section: 2, score: 72 },
    { fullName: "تميم عبدالله ظافر ال هيال", grade: "سادس", section: 2, score: 62 },
    { fullName: "زياد قاسم أحمد عسيري", grade: "سادس", section: 2, score: 62 },
    { fullName: "سلطان موسى يحي حيان", grade: "سادس", section: 2, score: 60 },
    { fullName: "صقر محمد جابر الشهري", grade: "سادس", section: 2, score: 60 },
    { fullName: "طلال فهد ابراهيم عسيري", grade: "سادس", section: 2, score: 56 },
    { fullName: "عبدالمجيد محمد علي العمري", grade: "سادس", section: 2, score: 72 },
    { fullName: "عمر عبدالعزيز عبدالله آل زميع", grade: "سادس", section: 2, score: 58 },
    { fullName: "فيصل ماجد علي العسيري", grade: "سادس", section: 2, score: 58 },
    { fullName: "محمد سعيد عبدالله القحطاني", grade: "سادس", section: 2, score: 58 },
    { fullName: "محمد عبدالله سعد القحطاني", grade: "سادس", section: 2, score: 62 },
    { fullName: "مشعل خالد عبدالله عسيري", grade: "سادس", section: 2, score: 60 },
    { fullName: "نادر عبدالعزيز القرني", grade: "سادس", section: 2, score: 70 },
    { fullName: "نواف عبدالله متعب ال هادي", grade: "سادس", section: 2, score: 72 },
    { fullName: "يامن علي عبدالله الألمعي", grade: "سادس", section: 2, score: 62 },
    // سادس ج (section 3)
    { fullName: "أنس محمد يحيى ال عمار", grade: "سادس", section: 3, score: 62 },
    { fullName: "ابراهيم احمد ابراهيم عسيري", grade: "سادس", section: 3, score: 58 },
    { fullName: "ابراهيم زهير محمد ال عاص", grade: "سادس", section: 3, score: 72 },
    { fullName: "خالد عبدالله سفر الزهيري", grade: "سادس", section: 3, score: 72 },
    { fullName: "خالد علي محمد الشهري", grade: "سادس", section: 3, score: 84 },
    { fullName: "خالد فيصل علي القحطاني", grade: "سادس", section: 3, score: 82 },
    { fullName: "خالد يحي محمد ال شويل", grade: "سادس", section: 3, score: 82 },
    { fullName: "عبدالرحمن ظافر عبدالرحمن آل مضحي", grade: "سادس", section: 3, score: 74 },
    { fullName: "عبدالرحمن فهد عثمان الشهراني", grade: "سادس", section: 3, score: 82 },
    { fullName: "عبدالعزيز زكريا محمد عريبي", grade: "سادس", section: 3, score: 62 },
    { fullName: "عبدالله احمد محمد عسيري", grade: "سادس", section: 3, score: 56 },
    { fullName: "عبدالله بن علي بن عبدالله علي القاسمي عسيري", grade: "سادس", section: 3, score: 46 },
    { fullName: "فارس حسين سعد القحطاني", grade: "سادس", section: 3, score: 58 },
    { fullName: "فهد علي يحيى الشهراني", grade: "سادس", section: 3, score: 54 },
    { fullName: "فواز ظافر عبدالرحمن آل مضحي", grade: "سادس", section: 3, score: 64 },
    { fullName: "فيصل مريع سعد هباش", grade: "سادس", section: 3, score: 62 },
    { fullName: "محمد أيمن إبراهيم آل مطاعن", grade: "سادس", section: 3, score: 54 },
    { fullName: "محمد احمد محمد عسيري", grade: "سادس", section: 3, score: 62 },
    { fullName: "محمد طاهر محمد الشهري", grade: "سادس", section: 3, score: 62 },
    { fullName: "مشاري سعيد مانع الاحمري", grade: "سادس", section: 3, score: 62 },
    { fullName: "مهند زياد محمد العسكري", grade: "سادس", section: 3, score: 66 },
    { fullName: "نادر سالم مهدي ال معمر", grade: "سادس", section: 3, score: 68 },
    { fullName: "يزن بشير يحيى الفقيه", grade: "سادس", section: 3, score: 58 },
  ];

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
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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
  const openResult = await db.select().from(votingPeriods).where(eq(votingPeriods.status, "open")).limit(1);
  if (openResult.length > 0) return openResult[0];

  const latestResult = await db.select().from(votingPeriods).orderBy(desc(votingPeriods.createdAt)).limit(1);
  return latestResult.length > 0 ? latestResult[0] : null;
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
    console.warn("[Database] Cannot get voting report: database not available");
    return [];
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
