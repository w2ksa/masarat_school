import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import "dotenv/config";

const teacherNames = mysqlTable("teacher_names", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

const newTeachers = [
  "عيسى علي عسيري",
  "عصام سمير حسن عاشور",
  "فكري فكري شحاتة عبدالعاطي",
  "أحمد جمعة محمود علي",
  "أحمد إبراهيم يحيى عايض شويل",
  "فارس محمد آل الشيخ",
  "ريان مسفر جبران القحطاني",
  "عبدالله بن محمد الزهراني",
  "سمير نبيل عبد الفتاح",
  "احمد يحيى عوض الباز",
  "محمد حامد عبد الكريم",
  "محمود حمدي محمود",
  "السيد عبد الرازق البلتاجي",
  "محمد علاء السيد",
  "أشرف إسماعيل عبد الرحمن",
  "عبدالمجيد الحسين سليمان الحفظي",
  "أحمد محمود صابر محمود",
  "ناصر محمد عبد العليم علي",
  "هاني محمد عبد البصير",
  "أحمد سامي أحمد النجار",
  "محمد ربيع يونس عبدالغني",
  "محمد عاشور السيد أحمد",
  "محمد المتولي البارودي",
  "محمد حلمي محمد عبده",
  "سراج الرحمن كمال فاضل",
  "احمد محمد جلال جمعه",
  "عبد الحميد ظريف عبدالمجيد ضبون",
  "السيد رضا عبده ابراهيم",
  "السيد منصور فكري محمد",
  "عصام الدين محمد علي",
  "علي عبد الله فرحان عسيري",
  "عبد الصادق شورى عبدالصادق",
  "محمد السيد اليماني بسيوني",
  "ياسر عزت عبدالمعطي جميل",
  "رضا السيد رضا عبده",
  "خالد أبو المجد أحمد",
  "ياسر أحمد محمد الشهري",
  "بدر فريد سعد عسيري",
  "خليل عبدالله سعيد حدري",
  "سعود آل زايد",
  "حسام محمد الشقيقي",
  "ابراهيم الشهراني",
  "عبدالعزيز شايع علي اليزيدي",
];

async function seedTeachers() {
  const db = drizzle(process.env.DATABASE_URL);

  // أولاً: حذف جميع الأسماء القديمة
  console.log("🗑️  حذف الأسماء القديمة...");
  await db.delete(teacherNames);
  console.log("✅ تم حذف الأسماء القديمة");

  // ثانياً: إضافة الأسماء الجديدة
  console.log("\n📝 بدء إضافة أسماء المعلمين الجدد...\n");

  for (let i = 0; i < newTeachers.length; i++) {
    await db.insert(teacherNames).values({ fullName: newTeachers[i] });
    console.log(`  ✓ ${i + 1}. ${newTeachers[i]}`);
  }

  console.log(`\n🎉 تم إضافة ${newTeachers.length} معلم بنجاح!`);
  process.exit(0);
}

seedTeachers().catch((error) => {
  console.error("❌ حدث خطأ:", error);
  process.exit(1);
});
