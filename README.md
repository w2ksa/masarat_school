# منصة مسارات التعليمية 🎓

تطبيق ويب عربي متكامل لإدارة المحتوى التعليمي مع نظام أدوار متقدم ودعم Firebase.

## المميزات ✨

- 🌐 **دعم كامل للغة العربية** مع RTL
- 🌙 **الوضع الداكن** كإعداد افتراضي
- 👥 **نظام أدوار متقدم** (مستخدمون، معلمون، إداريون)
- 📊 **لوحة تحكم إدارية** شاملة
- 📁 **تخزين الملفات على S3** بشكل آمن
- 🔔 **نظام إشعارات تلقائية**
- 🔥 **متصل بـ Firebase** (Database + Hosting)
- ✅ **اختبارات Vitest** شاملة

## التقنيات المستخدمة 🛠️

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- Wouter (Routing)
- shadcn/ui (Components)
- tRPC (Type-safe API)

### Backend
- Express 4
- tRPC 11
- Drizzle ORM
- MySQL/TiDB
- S3 Storage

### Firebase
- Firestore Database
- Firebase Hosting
- Firebase SDK

## البنية الهيكلية 📁

```
masarat_school/
├── client/                 # تطبيق React
│   ├── src/
│   │   ├── pages/         # صفحات التطبيق
│   │   │   ├── Home.tsx           # الصفحة الرئيسية
│   │   │   ├── AdminDashboard.tsx # لوحة التحكم الإدارية
│   │   │   └── TeacherDashboard.tsx # لوحة المعلمين
│   │   ├── components/    # مكونات قابلة لإعادة الاستخدام
│   │   ├── lib/          # مكتبات مساعدة
│   │   │   ├── trpc.ts   # إعداد tRPC
│   │   │   └── firebase.ts # إعداد Firebase
│   │   └── index.css     # أنماط عامة
│   └── index.html        # صفحة HTML الرئيسية
├── server/               # خادم Express
│   ├── routers.ts       # مسارات tRPC
│   ├── db.ts            # دوال قاعدة البيانات
│   └── *.test.ts        # اختبارات Vitest
├── drizzle/             # قاعدة البيانات
│   └── schema.ts        # جداول قاعدة البيانات
├── firebase.json        # إعداد Firebase
├── firestore.rules      # قواعد أمان Firestore
├── firestore.indexes.json # فهارس Firestore
├── GUIDE.md            # دليل الاستخدام
└── todo.md             # قائمة المهام
```

## التثبيت والتشغيل 🚀

### المتطلبات
- Node.js 22+
- pnpm
- حساب Firebase
- قاعدة بيانات MySQL/TiDB

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd masarat_school
```

2. **تثبيت الحزم**
```bash
pnpm install
```

3. **إعداد المتغيرات البيئية**
أنشئ ملف `.env` وأضف:
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **تطبيق تغييرات قاعدة البيانات**
```bash
pnpm db:push
```

5. **تشغيل التطبيق في وضع التطوير**
```bash
pnpm dev
```

التطبيق سيعمل على: `http://localhost:3000`

## الاختبار 🧪

تشغيل جميع الاختبارات:
```bash
pnpm test
```

## البناء والنشر 📦

### البناء للإنتاج
```bash
pnpm build
```

### النشر على Firebase
```bash
firebase deploy
```

## نظام الأدوار 👥

### المستخدمون العاديون (user)
- تصفح الصفحة الرئيسية
- عرض الملفات التعليمية
- تحميل الملفات

### المعلمون (teacher)
- جميع صلاحيات المستخدمون العاديون
- التسجيل كمعلم
- رفع الملفات التعليمية
- إدارة الملفات الخاصة

### الإداريون (admin)
- جميع صلاحيات المعلمون
- الوصول إلى لوحة التحكم الإدارية
- الموافقة/الرفض على طلبات المعلمين
- عرض الإحصائيات
- إدارة جميع الملفات
- استقبال الإشعارات

## قاعدة البيانات 🗄️

### الجداول الرئيسية

#### users
- معلومات المستخدمين الأساسية
- الأدوار (user, teacher, admin)

#### teachers
- معلومات المعلمين الإضافية
- التخصص، رقم الهاتف، النبذة
- حالة الموافقة (pending, approved, rejected)

#### educational_files
- بيانات الملفات التعليمية
- روابط S3
- البيانات الوصفية

#### notifications
- إشعارات النظام
- حالة القراءة

## Firebase Integration 🔥

### Firestore Database
تم إعداد قواعد أمان صارمة في `firestore.rules`:
- المستخدمون: قراءة الملفات العامة
- المعلمون: إدارة ملفاتهم
- الإداريون: وصول كامل

### Firebase Hosting
إعداد الاستضافة في `firebase.json`:
- SPA routing
- Cache headers
- Security headers

## الأمان 🔒

- مصادقة Manus OAuth
- نظام أدوار متقدم (RBAC)
- قواعد Firestore آمنة
- تخزين آمن على S3
- حماية CSRF
- Validation بواسطة Zod

## المساهمة 🤝

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push إلى الفرع
5. فتح Pull Request

## الترخيص 📄

MIT License - راجع ملف LICENSE للتفاصيل

## الدعم 💬

للحصول على المساعدة:
- راجع [دليل الاستخدام](./GUIDE.md)
- راجع [قائمة المهام](./todo.md)
- افتح Issue على GitHub

---

صُنع بـ ❤️ للتعليم العربي
