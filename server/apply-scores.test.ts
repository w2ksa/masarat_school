import { describe, it, expect } from "vitest";
import { parseScoresText } from "../shared/parseScores";
import { planExactScores, type DbStudentLite } from "../shared/restoreScores";

describe("parseScoresText — تحليل قائمة الدرجات الملصقة", () => {
  it("يحلل أسطر مفصولة بـ Tab ويتجاهل الترتيب والصف", () => {
    const text = "4\tعبدالعزيز سعيد يحيى ال شويل\tسادس\t94\n5\tخالد سعيد يحيى ال شويل\tخامس\t84";
    const { rows, skipped } = parseScoresText(text);
    expect(skipped).toHaveLength(0);
    expect(rows).toEqual([
      { name: "عبدالعزيز سعيد يحيى ال شويل", score: 94 },
      { name: "خالد سعيد يحيى ال شويل", score: 84 },
    ]);
  });

  it("يحلل أسطر مفصولة بمسافات (الاسم متعدد الكلمات)", () => {
    const text = "419 زياد علي بن سعود عسيري ثاني 40";
    const { rows } = parseScoresText(text);
    expect(rows).toEqual([{ name: "زياد علي بن سعود عسيري", score: 40 }]);
  });

  it("يتجاهل الأسطر الفارغة والتي بلا درجة رقمية", () => {
    const text = "\n\nاسم بلا درجة\n3\tطالب\tأول\t60\n";
    const { rows, skipped } = parseScoresText(text);
    expect(rows).toEqual([{ name: "طالب", score: 60 }]);
    expect(skipped.length).toBe(1);
  });
});

describe("planExactScores — تعيين الدرجات بالضبط", () => {
  const db: DbStudentLite[] = [
    { id: 1, fullName: "طالب أ", score: 1000 }, // قيمة تجريبية مضخّمة
    { id: 2, fullName: "طالب ب", score: 60 },
    { id: 3, fullName: "طالب ج", score: 94 },
  ];

  it("يضع الدرجة بالضبط ويخفض القيم المضخّمة", () => {
    const plan = planExactScores(db, [
      { name: "طالب أ", score: 64 },
      { name: "طالب ب", score: 60 },
    ]);
    expect(plan.updates).toEqual([{ id: 1, fullName: "طالب أ", from: 1000, to: 64 }]);
    expect(plan.unchanged).toBe(1); // طالب ب مطابق
  });

  it("لا يمسّ الطلاب غير المذكورين في القائمة", () => {
    const plan = planExactScores(db, [{ name: "طالب أ", score: 64 }]);
    // طالب ج (94) ليس في القائمة → لا يظهر في أي تحديث
    expect(plan.updates.map((u) => u.fullName)).not.toContain("طالب ج");
    expect(plan.notFound).toHaveLength(0);
  });

  it("يُبلّغ عن أسماء القائمة غير الموجودة في القاعدة دون إضافتها", () => {
    const plan = planExactScores(db, [{ name: "طالب مجهول", score: 50 }]);
    expect(plan.updates).toHaveLength(0);
    expect(plan.notFound).toEqual(["طالب مجهول"]);
  });
});
