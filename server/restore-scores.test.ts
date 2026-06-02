import { describe, it, expect } from "vitest";
import { planScoreRestore, type DbStudentLite } from "../shared/restoreScores";
import type { SeedStudent } from "../shared/studentsSeed";

const seed: SeedStudent[] = [
  { fullName: "طالب أ", grade: "أول", section: 1, score: 54 },
  { fullName: "طالب ب", grade: "أول", section: 1, score: 60 },
  { fullName: "طالب ج", grade: "أول", section: 1, score: 70 },
  { fullName: "طالب د", grade: "أول", section: 1, score: 40 },
];

describe("planScoreRestore — استعادة النقاط الآمنة", () => {
  it("يملأ النقاط للطلاب الذين نقاطهم = 0", () => {
    const db: DbStudentLite[] = [
      { id: 1, fullName: "طالب أ", score: 0 },
      { id: 2, fullName: "طالب ب", score: 0 },
    ];
    const plan = planScoreRestore(db, seed.slice(0, 2));
    expect(plan.updates).toEqual([
      { id: 1, fullName: "طالب أ", from: 0, to: 54 },
      { id: 2, fullName: "طالب ب", from: 0, to: 60 },
    ]);
  });

  it("لا يخفض نقاطاً موجودة أعلى من النسخة الاحتياطية", () => {
    const db: DbStudentLite[] = [
      { id: 3, fullName: "طالب ج", score: 300 }, // أعلى من seed (70)
    ];
    const plan = planScoreRestore(db, [seed[2]]);
    expect(plan.updates).toHaveLength(0);
    expect(plan.unchanged).toBe(1);
  });

  it("لا يغيّر النقاط المساوية", () => {
    const db: DbStudentLite[] = [{ id: 4, fullName: "طالب د", score: 40 }];
    const plan = planScoreRestore(db, [seed[3]]);
    expect(plan.updates).toHaveLength(0);
    expect(plan.unchanged).toBe(1);
  });

  it("يُبلّغ عن الطلاب غير الموجودين في القاعدة ولا يضيفهم", () => {
    const db: DbStudentLite[] = [{ id: 1, fullName: "طالب أ", score: 0 }];
    const plan = planScoreRestore(db, seed);
    expect(plan.updates).toHaveLength(1); // طالب أ فقط
    expect(plan.notFound).toEqual(["طالب ب", "طالب ج", "طالب د"]);
  });

  it("آمن للتكرار: إعادة التطبيق بعد التحديث لا تنتج أي تغييرات", () => {
    let db: DbStudentLite[] = [
      { id: 1, fullName: "طالب أ", score: 0 },
      { id: 2, fullName: "طالب ب", score: 0 },
      { id: 3, fullName: "طالب ج", score: 0 },
      { id: 4, fullName: "طالب د", score: 0 },
    ];
    const first = planScoreRestore(db, seed);
    expect(first.updates).toHaveLength(4);

    // طبّق التحديثات
    for (const u of first.updates) {
      db = db.map((r) => (r.id === u.id ? { ...r, score: u.to } : r));
    }

    const second = planScoreRestore(db, seed);
    expect(second.updates).toHaveLength(0);
    expect(second.unchanged).toBe(4);
  });

  it("يطابق الأسماء رغم الفراغات الطرفية", () => {
    const db: DbStudentLite[] = [{ id: 9, fullName: "  طالب أ  ", score: 0 }];
    const plan = planScoreRestore(db, [seed[0]]);
    expect(plan.updates).toHaveLength(1);
    expect(plan.updates[0].id).toBe(9);
  });
});
