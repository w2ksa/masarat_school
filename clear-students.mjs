import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import "dotenv/config";

async function clearStudents() {
  const db = drizzle(process.env.DATABASE_URL);
  
  console.log("حذف البيانات الخاطئة من جدول الطلاب...");
  
  await db.execute(sql`DELETE FROM students`);
  
  console.log("✅ تم حذف جميع البيانات من جدول الطلاب!");
  process.exit(0);
}

clearStudents().catch((error) => {
  console.error("❌ حدث خطأ:", error);
  process.exit(1);
});
