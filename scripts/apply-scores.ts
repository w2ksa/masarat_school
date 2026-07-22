/**
 * تطبيق الدرجات الصحيحة من ملف (data/scores.txt) إلى قاعدة البيانات الحية.
 *
 * - يقرأ الأسطر بالشكل: رقم_الترتيب  الاسم  الصف  الدرجة (يتجاهل الترتيب والصف).
 * - رقم الترتيب لا يُخزَّن إطلاقاً (مجرد فهرس).
 * - يضع درجة كل طالب بالضبط كما في قائمتك (بالمطابقة بالاسم).
 * - لا يحذف أي طالب، ولا يمسّ أي طالب غير موجود في الملف.
 * - وضع تجريبي افتراضياً (يعرض ما سيتغيّر)؛ التطبيق الفعلي يتطلب --apply.
 *
 * التشغيل (تجريبي):
 *   DATABASE_URL="mysql://..." pnpm exec tsx scripts/apply-scores.ts
 * التطبيق الفعلي:
 *   DATABASE_URL="mysql://..." pnpm exec tsx scripts/apply-scores.ts --apply
 * مسار ملف مختلف:
 *   pnpm exec tsx scripts/apply-scores.ts --file=data/scores.txt
 */
import { readFileSync } from "fs";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import { students } from "../drizzle/schema";
import { parseScoresText } from "../shared/parseScores";
import { planExactScores } from "../shared/restoreScores";

dotenv.config();

const APPLY = process.argv.includes("--apply");
const fileArg = process.argv.find((a) => a.startsWith("--file="));
const FILE = fileArg ? fileArg.split("=")[1] : "data/scores.txt";

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

  const text = readFileSync(FILE, "utf-8");
  const { rows, skipped } = parseScoresText(text);
  console.log(`\n========== تطبيق الدرجات ${APPLY ? "(تطبيق فعلي)" : "(تجريبي — بدون تعديل)"} ==========`);
  console.log(`الملف: ${FILE} | أسطر صحيحة: ${rows.length} | متجاهَلة: ${skipped.length}\n`);

  const connection = await mysql.createConnection({ uri });
  const db = drizzle(connection);

  const dbRows = await db.select().from(students);
  const plan = planExactScores(
    dbRows.map((r) => ({ id: r.id, fullName: r.fullName, score: r.score || 0 })),
    rows
  );

  for (const u of plan.updates) {
    console.log(`  ${APPLY ? "✏️ " : "🔎"} ${u.fullName}: ${u.from} → ${u.to}`);
    if (APPLY) {
      await db.update(students).set({ score: u.to }).where(eq(students.id, u.id));
    }
  }
  if (plan.notFound.length) {
    console.log("\n  أسماء في الملف غير موجودة في قاعدة البيانات (لم تُمسّ):");
    plan.notFound.forEach((n) => console.log(`    ⏭️  ${n}`));
  }

  console.log("\n— الملخّص —");
  console.log(`  سيُحدّث / تم تحديثه: ${plan.updates.length}`);
  console.log(`  مطابق أصلاً (دون تغيير): ${plan.unchanged}`);
  console.log(`  غير موجود في القاعدة: ${plan.notFound.length}`);
  console.log(`  ملاحظة: الطلاب غير المذكورين في الملف لم تُمسّ درجاتهم إطلاقاً.`);
  if (!APPLY) {
    console.log(`\n  هذا وضع تجريبي. للتطبيق الفعلي:`);
    console.log(`     pnpm exec tsx scripts/apply-scores.ts --apply`);
  } else {
    console.log(`\n  ✅ تم تطبيق الدرجات بنجاح.`);
  }
  console.log("\n=========================================================\n");

  await connection.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("خطأ:", e);
  process.exit(1);
});
