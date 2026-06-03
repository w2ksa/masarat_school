import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { FEATURED_SCORES } from "../shared/featuredScores";

function publicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: { "user-agent": "vitest" }, socket: { remoteAddress: "127.0.0.1" } } as any,
    res: { clearCookie: () => {} } as any,
  };
}

const caller = appRouter.createCaller(publicCtx());

describe("applyFeaturedScores — تطبيق درجات الطلاب المميّزين", () => {
  it("يسجّل/يحدّث الـ17 طالباً فيصبحون جميعاً مسجّلين بدرجاتهم الصحيحة", async () => {
    const res: any = await caller.students.applyFeaturedScores();
    expect(res.success).toBe(true);
    expect(res.total).toBe(17);

    // بعد التطبيق: كل الـ17 مسجّلون في القائمة بدرجاتهم بالضبط
    const students = await caller.students.list({ grade: undefined } as any);
    const byName = new Map(students.map((s: any) => [s.fullName.trim(), s.score]));
    for (const f of FEATURED_SCORES) {
      expect(byName.get(f.name.trim())).toBe(f.score);
    }
  });

  it("كل الـ17 يحملون صفّاً وفصلاً (جاهزون للتسجيل كطلاب)", () => {
    for (const f of FEATURED_SCORES as any[]) {
      expect(typeof f.grade).toBe("string");
      expect(f.grade.length).toBeGreaterThan(0);
      expect(typeof f.section).toBe("number");
    }
  });

  it("الأعلى = 160 والأدنى = 100 ولا تكرار", () => {
    const scores = FEATURED_SCORES.map((f) => f.score);
    expect(Math.max(...scores)).toBe(160);
    expect(Math.min(...scores)).toBe(100);
    expect(new Set(scores).size).toBe(17);
    // ترتيب تنازلي كما أعطى المستخدم
    for (let i = 1; i < scores.length; i++) expect(scores[i]).toBeLessThan(scores[i - 1]);
  });

  it("آمن للتكرار: إعادة التطبيق لا تغيّر شيئاً", async () => {
    const res: any = await caller.students.applyFeaturedScores();
    expect(res.updatedCount).toBe(0);
    expect(res.unchangedCount).toBe(17);
  });
});
