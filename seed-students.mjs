import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import "dotenv/config";

const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  score: int("score").default(0).notNull(),
  rank: int("rank"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

const studentNames = [
  "أحمد محمد جلال جمعة",
  "السيد منصور شكري",
  "محمد ذهبي محمد عبده الشاروط",
  "سمير نبيل عبدالفتاح عبدالفتاح",
  "محمد المتولي عبدالفتاح الباروني",
  "السيد رضا إبراهيم",
  "محمود حمدي محمود أحمد",
  "محمد عاشور السيد أحمد",
  "ياسر عزت عبدالمعطي جميل",
  "هاني محمد عبدالنصير",
  "أشرف إسماعيل عبدالرحمن نصر",
  "عبدالمجيد الحسن الحفظي",
  "محمد حامد عبدالكريم علم الدين",
  "بدر فريد سعد عسيري",
  "أحمد بدوي عوض البار",
  "السيد عبدالرازق البلتاجي",
  "رضا السيد رضا عبده",
  "محمد ربيع يونس عبدالحي",
  "ناصر محمد عبدالعليم علي",
  "عثمان الدين محمد محمد",
  "عبدالصادق شوقي عبدالصادق",
  "خليل بن عبدالله سعيد جذري",
  "أحمد سامي أحمد البحار",
  "شراح الرحمن كمال فاضل الحنظور",
  "عبدالحميد ظريف عبدالحميد ضيون",
  "علي عبدالله بن مرضان عسيري",
  "سعود علي أحمد آل رابد",
  "محمد السيد اليماني سيواي",
  "محمد علاء - السيد",
  "أحمد محمود - صابر",
  "عبدالعزيز شايع علي الزبيدي"
];

async function seedStudents() {
  const db = drizzle(process.env.DATABASE_URL);

  console.log("بدء إضافة أسماء الطلاب...");

  // إضافة الطلاب مع نقاط عشوائية للتجربة
  for (let i = 0; i < studentNames.length; i++) {
    const score = Math.floor(Math.random() * 100) + 1; // نقاط عشوائية من 1 إلى 100

    await db.insert(students).values({
      fullName: studentNames[i],
      score: score,
    });

    console.log(`✓ تم إضافة: ${studentNames[i]} - النقاط: ${score}`);
  }

  console.log(`\n✅ تم إضافة ${studentNames.length} طالب بنجاح!`);
  process.exit(0);
}

seedStudents().catch((error) => {
  console.error("❌ حدث خطأ:", error);
  process.exit(1);
});
