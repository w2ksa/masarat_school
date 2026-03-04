import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;

const teacherNames = [
  'عيسى علي عسيري',
  'عصام سمير حسن عاشور',
  'فكري فكري شحاتة عبدالعاطي',
  'أحمد جمعة محمود علي',
  'أحمد إبراهيم يحيى عايض شويل',
  'فارس محمد آل الشيخ',
  'ريان مسفر جبران القحطاني',
  'عبدالله بن محمد الزهراني',
  'سمير نبيل عبد الفتاح',
  'احمد يحيى عوض الباز',
  'محمد حامد عبد الكريم',
  'محمود حمدي محمود',
  'السيد عبد الرازق البلتاجي',
  'محمد علاء السيد',
  'أشرف إسماعيل عبد الرحمن',
  'عبدالمجيد الحسين سليمان الحفظي',
  'أحمد محمود صابر محمود',
  'ناصر محمد عبد العليم علي',
  'هاني محمد عبد البصير',
  'أحمد سامي أحمد النجار',
  'محمد ربيع يونس عبدالغني',
  'محمد عاشور السيد أحمد',
  'محمد المتولي  البارودي',
  'محمد حلمي محمد عبده',
  'سراج الرحمن كمال فاضل',
  'احمد محمد جلال جمعه',
  'عبد الحميد ظريف عبدالمجيد ضبون',
  'السيد رضا عبده ابراهيم',
  'السيد منصور فكري محمد',
  'عصام الدين محمد علي',
  'علي عبد الله فرحان عسيري',
  'فهد أحمد فائع عسيري',
  'عبد الصادق شورى عبدالصادق',
  'محمد السيد اليماني بسيوني',
  'ياسر عزت عبدالمعطي جميل',
  'رضا السيد رضا عبده',
  'خالد أبو المجد أحمد',
  'ياسر أحمد محمد الشهري',
  'بدر فريد سعد عسيري',
  'خليل عبدالله سعيد حدري',
  'سعود آل زايد'
];

const password = 'aA12@gsA';

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log('Starting to create teacher accounts...');

  const hashedPassword = await bcrypt.hash(password, 10);

  for (const name of teacherNames) {
    try {
      // Check if user already exists
      const [existing] = await connection.execute(
        'SELECT id FROM manus_user WHERE name = ?',
        [name]
      );

      if (existing.length > 0) {
        console.log(`✓ User "${name}" already exists`);
        continue;
      }

      // Create user account
      await connection.execute(
        'INSERT INTO manus_user (name, password, role) VALUES (?, ?, ?)',
        [name, hashedPassword, 'user']
      );

      console.log(`✓ Created account for "${name}"`);
    } catch (error) {
      console.error(`✗ Error creating account for "${name}":`, error.message);
    }
  }

  await connection.end();
  console.log('\nDone! Created teacher accounts.');
}

main().catch(console.error);
