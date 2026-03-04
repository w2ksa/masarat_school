import { drizzle } from "drizzle-orm/mysql2";
import { students } from "./drizzle/schema";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function findDuplicates() {
  console.log("🔍 البحث عن أسماء مكررة...\n");
  
  // Find duplicates using GROUP BY and HAVING
  const result: any = await db.execute(sql`
    SELECT fullName, grade, COUNT(*) as count, GROUP_CONCAT(id) as ids
    FROM students
    GROUP BY fullName, grade
    HAVING COUNT(*) > 1
    ORDER BY count DESC, fullName
  `);
  
  const duplicates = result[0] || [];
  
  if (duplicates.length === 0) {
    console.log("✅ لا يوجد أسماء مكررة!");
    return;
  }
  
  console.log(`❌ تم العثور على ${duplicates.length} اسم مكرر:\n`);
  
  let totalDuplicates = 0;
  for (const row of duplicates) {
    console.log(`📌 "${row.fullName}" (${row.grade})`);
    console.log(`   عدد التكرار: ${row.count}`);
    console.log(`   IDs: ${row.ids}`);
    console.log("");
    totalDuplicates += (row.count - 1); // -1 because we keep one
  }
  
  console.log(`\n📊 إجمالي الأسماء المكررة التي يجب حذفها: ${totalDuplicates}`);
}

findDuplicates().then(() => process.exit(0)).catch(console.error);
