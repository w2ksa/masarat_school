# مسارات المدرسة — دليل المطور

> كل البيانات المهمة والروابط والرموز التي تحتاجها أنت وأي مبرمج

---

## الروابط الأساسية

| الوصف | الرابط |
|------|--------|
| **مستودع GitHub** | https://github.com/w2ksa/masarat_school |
| **النسخ (Clone)** | `git clone https://github.com/w2ksa/masarat_school.git` |
| **Railway** (نشر التطبيق) | https://railway.app |
| **Firebase Console** | https://console.firebase.google.com |

---

## تشغيل المشروع محلياً

### المتطلبات
- **Node.js** 22+
- **pnpm** (مدير الحزم)
- **MySQL** أو **TiDB** (اختياري — يعمل بدون قاعدة بيانات في وضع التطوير)

### الأوامر الأساسية

```bash
# تثبيت الحزم
pnpm install

# تشغيل وضع التطوير (Frontend + Backend)
pnpm dev

# بناء للإنتاج
pnpm build

# تشغيل النسخة المبنية
pnpm start

# تشغيل الاختبارات
pnpm test

# تطبيق migrations قاعدة البيانات
pnpm db:push
```

**الرابط المحلي:** http://localhost:3000

---

## المتغيرات البيئية (.env)

انسخ `.env.example` إلى `.env` وعدّل القيم:

```env
# ===== إلزامي للتشغيل =====

# المنفذ (افتراضي 3000)
PORT=3000
NODE_ENV=production

# قاعدة البيانات MySQL/TiDB
# بدونها يعمل النظام من الذاكرة (In-Memory) للتطوير
DATABASE_URL=mysql://user:password@host:port/database

# مفتاح JWT للمصادقة
JWT_SECRET=your-jwt-secret-key-here

# ===== OAuth (تسجيل الدخول) =====
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_OAUTH_PORTAL_URL=https://your-oauth-portal.com
VITE_APP_ID=your-app-id

# معرف المالك (يُعطى صلاحيات إدارية تلقائياً)
OWNER_OPEN_ID=your-owner-open-id

# ===== Firebase (اختياري) =====
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# ===== التخزين S3 (اختياري) =====
BUILT_IN_FORGE_API_URL=https://your-forge-api.com
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

---

## نشر على Railway

1. اربط المستودع من GitHub في Railway
2. **مهم:** أضف المتغير `NIXPACKS_NODE_VERSION=22` في Variables (Vite 7 يتطلب Node 22+)
3. أضف باقي المتغيرات البيئية (DATABASE_URL, JWT_SECRET، إلخ)
4. Railway يستخدم `railway.json` تلقائياً:
   - **Build:** `pnpm install && pnpm run build`
   - **Start:** `pnpm run start`

---

## بنية المشروع

```
masarat_school/
├── client/              # واجهة React
│   ├── src/
│   │   ├── pages/      # الصفحات
│   │   ├── components/ # المكونات
│   │   └── lib/        # إعدادات (trpc, firebase)
│   └── index.html
├── server/              # خادم Express + tRPC
│   ├── _core/           # الإعداد الأساسي
│   ├── db.ts            # قاعدة البيانات + In-Memory
│   └── routers.ts       # مسارات tRPC
├── shared/              # كود مشترك
├── drizzle/             # schema و migrations
├── .env.example         # نموذج المتغيرات
├── railway.json         # إعداد Railway
└── package.json
```

---

## التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| Frontend | React 19, TypeScript, Vite, Tailwind, shadcn/ui, Wouter |
| Backend | Express 4, tRPC 11, Drizzle ORM |
| قاعدة البيانات | MySQL / TiDB (mysql2) |
| المصادقة | JWT (jose), OAuth |
| التخزين | S3 (اختياري) |

---

## الميزات الرئيسية

- إدارة الطلاب (إضافة، تعديل، حذف، النقاط)
- التصويت من المعلمين (٣ أصوات لكل معلم، ١٠ نقاط للطالب)
- رفع المحتوى (حد ٢ رفع لكل طالب كل ٢٤ ساعة)
- سجل النشاطات
- تقارير أسبوعية
- أعلى ٥ طلاب
- دعم الجوال (Responsive)

---

## أوامر Git الأساسية

```bash
# رفع التحديثات
git add .
git commit -m "وصف التعديل"
git push origin main

# سحب آخر التحديثات
git pull origin main
```

---

## ملاحظات مهمة

1. **بدون DATABASE_URL:** النظام يعمل من الذاكرة — مناسب للتطوير فقط.
2. **JWT_SECRET:** يجب أن يكون قوياً ومختلفاً في الإنتاج.
3. **OWNER_OPEN_ID:** يُحدد من OAuth — صاحبه يحصل على صلاحيات إدارية.
4. **محتوى الطلاب:** حد ٢ رفع لكل طالب كل ٢٤ ساعة (محفوظ في الكود وقاعدة البيانات).

---

## الدعم والمراجع

- [دليل الاستخدام](./GUIDE.md)
- [قائمة المهام](./todo.md)
- [تقرير الاختبار النهائي](./FINAL_TEST_REPORT.md)

---

صُنع لمسارات المدرسة 🎓
