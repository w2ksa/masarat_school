/**
 * سكربت استعادة النقاط (آمن): يعيد نقاط الطلاب من النسخة الاحتياطية في GitHub
 * (shared/studentsSeed.ts) إلى قاعدة البيانات الحية — فقط للطلاب الذين فقدوا نقاطهم.
 *
 * الضمانات:
 *  - لا يحذف أي طالب إطلاقاً.
 *  - لا يخفض نقاطاً موجودة (يحدّث فقط إذا كانت نقاط القاعدة أقل من نقاط النسخة الاحتياطية).
 *  - المطابقة بالاسم الكامل (fullName).
 *  - آمن للتكرار (idempotent).
 *  - يعمل بوضع تجريبي افتراضياً؛ التطبيق الفعلي يتطلب الوسيط --apply.
 *
 * التشغيل (تجريبي — يعرض ما سيتغيّر دون تعديل):
 *   DATABASE_URL="mysql://..." pnpm exec tsx scripts/restore-scores.ts
 * التشغيل الفعلي:
 *   DATABASE_URL="mysql://..." pnpm exec tsx scripts/restore-scores.ts --apply
 */
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import { students } from "../drizzle/schema";
import { STUDENTS_SEED } from "../shared/studentsSeed";
import { planScoreRestore } from "../shared/restoreScores";

dotenv.config();

const APPLY = process.argv.includes("--apply");

function resolveDatabaseUrl(): string {
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

async function main() {
  const uri = resolveDatabaseUrl();
  if (!uri) {
    console.error("❌ لم يتم العثور على رابط قاعدة البيانات (DATABASE_URL/MYSQL_URL).");
    process.exit(1);
  }

  console.log(`\n========== استعادة نقاط الطلاب ${APPLY ? "(تطبيق فعلي)" : "(تجريبي — بدون تعديل)"} ==========\n`);

  const connection = await mysql.createConnection({ uri });
  const db = drizzle(connection);

  const rows = await db.select().from(students);
  const plan = planScoreRestore(
    rows.map((r) => ({ id: r.id, fullName: r.fullName, score: r.score || 0 })),
    STUDENTS_SEED
  );

  for (const u of plan.updates) {
    console.log(`  ${APPLY ? "✏️ " : "🔎"} ${u.fullName}: ${u.from} → ${u.to}`);
    if (APPLY) {
      await db.update(students).set({ score: u.to }).where(eq(students.id, u.id));
    }
  }
  for (const name of plan.notFound) {
    console.log(`  ⏭️  غير موجود في القاعدة (تخطّي): ${name}`);
  }

  console.log("\n— الملخّص —");
  console.log(`  سيُحدّث / تم تحديثه: ${plan.updates.length}`);
  console.log(`  دون تغيير (نقاطه مساوية أو أعلى): ${plan.unchanged}`);
  console.log(`  غير موجود في القاعدة: ${plan.notFound.length}`);
  if (!APPLY) {
    console.log(`\n  هذا وضع تجريبي. لتطبيق التغييرات فعلاً أضف --apply:`);
    console.log(`     pnpm exec tsx scripts/restore-scores.ts --apply`);
  } else {
    console.log(`\n  ✅ تم تطبيق الاستعادة بنجاح.`);
  }
  console.log("\n=========================================================\n");

  await connection.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("خطأ:", e);
  process.exit(1);
});
