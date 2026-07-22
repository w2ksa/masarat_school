/**
 * سكربت معاينة (قراءة فقط): يقارن بيانات الطلاب في قاعدة البيانات الحية
 * مع النسخة الاحتياطية في GitHub (shared/studentsSeed.ts).
 *
 * التشغيل:
 *   DATABASE_URL="mysql://..." pnpm exec tsx scripts/inspect-students.ts
 * أو على Railway حيث DATABASE_URL مضبوط:
 *   pnpm exec tsx scripts/inspect-students.ts
 *
 * لا يعدّل أي بيانات إطلاقاً.
 */
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { students } from "../drizzle/schema";
import { STUDENTS_SEED } from "../shared/studentsSeed";

dotenv.config();

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

  const seedTotal = STUDENTS_SEED.reduce((a, s) => a + s.score, 0);
  const seedMax = Math.max(...STUDENTS_SEED.map((s) => s.score));

  const connection = await mysql.createConnection({ uri });
  const db = drizzle(connection);

  const rows = await db.select().from(students);
  const dbTotal = rows.reduce((a, s) => a + (s.score || 0), 0);
  const dbZero = rows.filter((s) => (s.score || 0) === 0).length;
  const dbMax = rows.length ? Math.max(...rows.map((s) => s.score || 0)) : 0;
  const top = [...rows].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);

  console.log("\n========== معاينة بيانات الطلاب ==========\n");
  console.log("— قاعدة البيانات الحية —");
  console.log(`  عدد الطلاب:        ${rows.length}`);
  console.log(`  مجموع النقاط:      ${dbTotal}`);
  console.log(`  طلاب بنقطة = 0:    ${dbZero}`);
  console.log(`  أعلى نقاط:         ${dbMax}`);
  console.log(`  الأعلى نقاطاً: ${top.map((s) => `${s.fullName} (${s.score})`).join("، ") || "-"}`);

  console.log("\n— نسخة GitHub الاحتياطية (shared/studentsSeed.ts) —");
  console.log(`  عدد الطلاب:        ${STUDENTS_SEED.length}`);
  console.log(`  مجموع النقاط:      ${seedTotal}`);
  console.log(`  أعلى نقاط:         ${seedMax}`);

  console.log("\n— الخلاصة —");
  if (dbTotal >= seedTotal) {
    console.log(`  ✅ قاعدة بياناتك فيها نقاط أكثر (${dbTotal} مقابل ${seedTotal}). لا حاجة للاستعادة من GitHub.`);
  } else {
    console.log(`  ⚠️ نسخة GitHub فيها نقاط أكثر (${seedTotal} مقابل ${dbTotal}).`);
    console.log(`     يمكنك استعادة النقاط المفقودة بأمان عبر: pnpm exec tsx scripts/restore-scores.ts`);
    console.log(`     (يجرّب أولاً بوضع تجريبي، ولا يحذف أحداً، ولا يخفض نقاطاً موجودة).`);
  }
  console.log("\n==========================================\n");

  await connection.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("خطأ:", e);
  process.exit(1);
});
