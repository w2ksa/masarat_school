import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';
import { readFileSync } from 'fs';
// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL not found in environment');
  process.exit(1);
}

// Parse DATABASE_URL
const url = new URL(databaseUrl);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: true },
});

const db = drizzle(connection, { schema, mode: 'default' });

// Read student data from file
const fileContent = readFileSync('/home/ubuntu/upload/pasted_content_5.txt', 'utf-8');
const lines = fileContent.split('\n').map(line => line.trim());

// Parse students
const students = [];
let currentGrade = null;
let currentSection = null;

const gradeMap = {
  "الصف الأول الابتدائي": "أول",
  "الصف الثاني الابتدائي": "ثاني",
  "الصف الثالث الابتدائي": "ثالث",
  "الصف الرابع الابتدائي": "رابع",
  "الصف الخامس الابتدائي": "خامس",
  "الصف السادس الابتدائي": "سادس",
};

for (const line of lines) {
  if (!line) continue;
  
  // Check if it's a grade header
  if (line.includes("الصف") && line.includes("الابتدائي")) {
    for (const [key, value] of Object.entries(gradeMap)) {
      if (line.includes(key)) {
        currentGrade = value;
        break;
      }
    }
  }
  
  // Check if it's a section header
  else if (line.includes("فصل") && currentGrade) {
    if (line.includes("فصل (1)")) currentSection = 1;
    else if (line.includes("فصل (2)")) currentSection = 2;
    else if (line.includes("فصل (3)")) currentSection = 3;
    else if (line.includes("فصل (4)")) currentSection = 4;
  }
  
  // Otherwise, it's a student name
  else if (currentGrade && currentSection && 
           !line.startsWith("🔴") && !line.startsWith("🟠") && 
           !line.startsWith("🟡") && !line.startsWith("🟢") && 
           !line.startsWith("🔵") && !line.startsWith("🟣") && 
           !line.startsWith("📍")) {
    students.push({
      fullName: line,
      grade: currentGrade,
      section: currentSection,
      score: 0
    });
  }
}

console.log(`Total students to import: ${students.length}`);

// Insert students in batches of 100
const batchSize = 100;
for (let i = 0; i < students.length; i += batchSize) {
  const batch = students.slice(i, i + batchSize);
  await db.insert(schema.students).values(batch);
  console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} students`);
}

console.log('✅ All students imported successfully!');
await connection.end();
