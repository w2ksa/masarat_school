import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, int, varchar, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import "dotenv/config";

const teachers = mysqlTable("teachers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  bio: varchar("bio", { length: 500 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("approved").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

const teacherNames = [
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

async function seedTeachers() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log("بدء إضافة أسماء المعلمين...");
  
  for (let i = 0; i < teacherNames.length; i++) {
    // استخدام userId وهمي (سيتم تحديثه لاحقاً عند تسجيل الدخول)
    await db.insert(teachers).values({
      userId: 1000 + i, // معرف وهمي
      fullName: teacherNames[i],
      specialization: "معلم",
      status: "approved",
    });
    
    console.log(`✓ تم إضافة المعلم: ${teacherNames[i]}`);
  }
  
  console.log(`\n✅ تم إضافة ${teacherNames.length} معلم بنجاح!`);
  process.exit(0);
}

seedTeachers().catch((error) => {
  console.error("❌ حدث خطأ:", error);
  process.exit(1);
});
