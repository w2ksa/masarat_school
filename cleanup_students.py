import os
import mysql.connector

# الاتصال بقاعدة البيانات
db_url = os.environ.get('DATABASE_URL', '')
# Parse connection string
# mysql://user:pass@host:port/dbname
parts = db_url.replace('mysql://', '').split('@')
user_pass = parts[0].split(':')
host_db = parts[1].split('/')
host_port = host_db[0].split(':')

conn = mysql.connector.connect(
    host=host_port[0],
    port=int(host_port[1]) if len(host_port) > 1 else 3306,
    user=user_pass[0],
    password=user_pass[1],
    database=host_db[1].split('?')[0]
)

cursor = conn.cursor()

# حذف السجلات الزائدة (الاحتفاظ بأول 425)
cursor.execute("SELECT id FROM students ORDER BY id")
all_ids = [row[0] for row in cursor.fetchall()]

print(f"العدد الإجمالي: {len(all_ids)}")

if len(all_ids) > 425:
    ids_to_delete = all_ids[425:]
    print(f"سيتم حذف: {len(ids_to_delete)} سجل")
    
    # حذف بدفعات صغيرة
    for i in range(0, len(ids_to_delete), 50):
        batch = ids_to_delete[i:i+50]
        placeholders = ','.join(['%s'] * len(batch))
        cursor.execute(f"DELETE FROM students WHERE id IN ({placeholders})", batch)
        conn.commit()
        print(f"تم حذف دفعة {i//50 + 1}")

cursor.execute("SELECT COUNT(*) FROM students")
final_count = cursor.fetchone()[0]
print(f"✅ العدد النهائي: {final_count}")

cursor.close()
conn.close()
