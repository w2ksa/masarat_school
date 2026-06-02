import type { SeedStudent } from "./studentsSeed";

export type DbStudentLite = { id: number; fullName: string; score: number };

export type RestorePlan = {
  updates: { id: number; fullName: string; from: number; to: number }[];
  unchanged: number;
  notFound: string[];
};

/**
 * يحسب خطة استعادة النقاط بأمان من النسخة الاحتياطية (seed) إلى بيانات القاعدة.
 * القواعد:
 *  - المطابقة بالاسم الكامل (بعد إزالة الفراغات الطرفية).
 *  - يُحدّث فقط إذا كانت نقاط القاعدة أقل من نقاط النسخة الاحتياطية (لا يخفض نقاطاً موجودة).
 *  - من ليس له مطابقة في القاعدة يُدرج في notFound (لا يُضاف، لا يُحذف).
 *  - دالة نقية (pure) وآمنة للتكرار: إعادة التطبيق بعد التحديث تُنتج updates فارغة.
 */
export function planScoreRestore(dbStudents: DbStudentLite[], seed: SeedStudent[]): RestorePlan {
  const byName = new Map<string, DbStudentLite>();
  for (const r of dbStudents) byName.set(r.fullName.trim(), r);

  const updates: RestorePlan["updates"] = [];
  const notFound: string[] = [];
  let unchanged = 0;

  for (const s of seed) {
    const cur = byName.get(s.fullName.trim());
    if (!cur) {
      notFound.push(s.fullName);
      continue;
    }
    const c = cur.score || 0;
    if (c < s.score) {
      updates.push({ id: cur.id, fullName: s.fullName, from: c, to: s.score });
    } else {
      unchanged++;
    }
  }

  return { updates, unchanged, notFound };
}

/**
 * يحسب خطة تعيين الدرجات بالضبط من قائمة موثوقة (الاسم → الدرجة).
 * - المطابقة بالاسم الكامل.
 * - يضع الدرجة بالضبط كما في القائمة (قد يرفع أو يخفض القيمة الحالية).
 * - لا يمسّ أي طالب غير موجود في القائمة (يبقى كما هو).
 * - من ليس له مطابقة في القاعدة يُدرج في notFound (لا يُضاف، لا يُحذف).
 */
export function planExactScores(
  dbStudents: DbStudentLite[],
  list: { name: string; score: number }[]
): RestorePlan {
  const byName = new Map<string, DbStudentLite>();
  for (const r of dbStudents) byName.set(r.fullName.trim(), r);

  const updates: RestorePlan["updates"] = [];
  const notFound: string[] = [];
  let unchanged = 0;

  for (const item of list) {
    const cur = byName.get(item.name.trim());
    if (!cur) {
      notFound.push(item.name);
      continue;
    }
    if ((cur.score || 0) !== item.score) {
      updates.push({ id: cur.id, fullName: item.name, from: cur.score || 0, to: item.score });
    } else {
      unchanged++;
    }
  }

  return { updates, unchanged, notFound };
}
