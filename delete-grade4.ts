import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { students } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);

console.log("🗑️  حذف جميع طلاب الصف الرابع...");

const deleted = await db.delete(students).where(eq(students.grade, "الرابع الابتدائي"));

console.log(`✅ تم حذف ${deleted[0].affectedRows} طالب من الصف الرابع`);

await connection.end();
