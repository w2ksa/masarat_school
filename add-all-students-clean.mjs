import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';
import * as fs from 'fs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// قراءة الملف
const fileContent = fs.readFileSync('/home/ubuntu/upload/pasted_content_5.txt', 'utf-8');
const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

const students = [];
let currentGrade = '';
let currentSection = 0;

for (const line of lines) {
  // تحقق من السطر الذي يحتوي على الصف والفصل
  if (line.startsWith('📍')) {
    // استخراج الصف والفصل
    // مثال: "📍 أول - فصل (1)"
    const match = line.match(/📍\s*(\S+)\s*-\s*فصل\s*\((\d+)\)/);
    if (match) {
      currentGrade = match[1]; // "أول", "ثاني", إلخ
      currentSection = parseInt(match[2]); // 1, 2, 3, إلخ
    }
  } else if (line && !line.startsWith('📍') && currentGrade) {
    // هذا اسم طالب
    students.push({
      fullName: line,
      grade: currentGrade,
      section: currentSection,
      score: 0,
      comment: null
    });
  }
}

console.log(`Found ${students.length} students`);
console.log('Sample:', students.slice(0, 5));

// إضافة الطلاب إلى قاعدة البيانات
try {
  for (let i = 0; i < students.length; i += 100) {
    const batch = students.slice(i, i + 100);
    await db.insert(schema.students).values(batch);
    console.log(`Inserted batch ${Math.floor(i / 100) + 1}: ${batch.length} students`);
  }
  console.log(`✅ Successfully added ${students.length} students!`);
} catch (error) {
  console.error('Error adding students:', error);
}

await connection.end();
