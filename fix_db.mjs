import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('حذف جدول teacher_votes...');
await connection.execute('DROP TABLE IF EXISTS teacher_votes');

console.log('إنشاء جدول teacher_votes الجديد...');
await connection.execute(`
  CREATE TABLE teacher_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacherNameId INT NOT NULL,
    votingPeriodId INT NOT NULL,
    studentId INT NOT NULL,
    voteRank INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (teacherNameId) REFERENCES teacher_names(id) ON DELETE CASCADE,
    FOREIGN KEY (votingPeriodId) REFERENCES voting_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
  )
`);

console.log('✅ تم إصلاح قاعدة البيانات بنجاح!');
await connection.end();
process.exit(0);
