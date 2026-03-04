import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { students } from "./drizzle/schema";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config();

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
});

const db = drizzle(connection);

async function checkStudents() {
  const grade4 = await db.select().from(students).where(eq(students.grade, "الرابع الابتدائي"));
  const grade5 = await db.select().from(students).where(eq(students.grade, "الخامس الابتدائي"));
  const grade6 = await db.select().from(students).where(eq(students.grade, "السادس الابتدائي"));
  
  console.log(`\n=== الصف الرابع الابتدائي (${grade4.length} طالب) ===`);
  grade4.forEach((s, i) => console.log(`${i+1}. ${s.fullName}`));
  
  console.log(`\n=== الصف الخامس الابتدائي (${grade5.length} طالب) ===`);
  grade5.forEach((s, i) => console.log(`${i+1}. ${s.fullName}`));
  
  console.log(`\n=== الصف السادس الابتدائي (${grade6.length} طالب) ===`);
  grade6.forEach((s, i) => console.log(`${i+1}. ${s.fullName}`));
  
  console.log(`\n✅ إجمالي الطلاب: ${grade4.length + grade5.length + grade6.length}`);
  
  await connection.end();
  process.exit(0);
}

checkStudents();
