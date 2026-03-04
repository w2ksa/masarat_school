import { drizzle } from "drizzle-orm/mysql2";
import { students } from "./drizzle/schema";
import { sql, eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function removeDuplicates() {
  console.log("🔍 البحث عن الأسماء المكررة...\n");
  
  // Find duplicates
  const result: any = await db.execute(sql`
    SELECT fullName, grade, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id) as ids
    FROM students
    GROUP BY fullName, grade
    HAVING COUNT(*) > 1
    ORDER BY fullName
  `);
  
  const duplicates = result[0] || [];
  
  if (duplicates.length === 0) {
    console.log("✅ لا يوجد أسماء مكررة!");
    return;
  }
  
  console.log(`❌ تم العثور على ${duplicates.length} اسم مكرر\n`);
  
  let totalDeleted = 0;
  
  for (const row of duplicates) {
    const idsString = row.ids as string;
    const ids = idsString.split(',').map(id => parseInt(id));
    
    // Keep the first ID, delete the rest
    const idsToDelete = ids.slice(1);
    
    console.log(`📌 "${row.fullName}" (${row.grade})`);
    console.log(`   الاحتفاظ بـ ID: ${ids[0]}`);
    console.log(`   حذف IDs: ${idsToDelete.join(', ')}`);
    
    // Delete duplicates
    for (const idToDelete of idsToDelete) {
      await db.delete(students).where(eq(students.id, idToDelete));
      totalDeleted++;
    }
    
    console.log("");
  }
  
  console.log(`\n✅ تم حذف ${totalDeleted} سجل مكرر بنجاح!`);
}

removeDuplicates().then(() => process.exit(0)).catch(console.error);
