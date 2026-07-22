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
  it("يسجّل/يحدّث جميع الطلاب المميّزين فيصبحون مسجّلين بدرجاتهم الصحيحة", async () => {
    const res: any = await caller.students.applyFeaturedScores();
    expect(res.success).toBe(true);
    expect(res.total).toBe(FEATURED_SCORES.length);

    // بعد التطبيق: كل طالب مميّز مسجّل في القائمة بدرجته بالضبط
    const students = await caller.students.list({ grade: undefined } as any);
    const byName = new Map(students.map((s: any) => [s.fullName.trim(), s.score]));
    for (const f of FEATURED_SCORES) {
      expect(byName.get(f.name.trim())).toBe(f.score);
    }
  });

  it("كل طالب مميّز يحمل صفّاً وفصلاً (جاهز للتسجيل كطالب)", () => {
    for (const f of FEATURED_SCORES as any[]) {
      expect(typeof f.grade).toBe("string");
      expect(f.grade.length).toBeGreaterThan(0);
      expect(typeof f.section).toBe("number");
    }
  });

  it("الدرجات أرقام موجبة صحيحة والأسماء فريدة بلا تكرار", () => {
    const scores = FEATURED_SCORES.map((f) => f.score);
    for (const s of scores) {
      expect(Number.isFinite(s)).toBe(true);
      expect(s).toBeGreaterThan(0);
    }
    const names = FEATURED_SCORES.map((f) => f.name.trim());
    expect(new Set(names).size).toBe(names.length);
  });

  it("آمن للتكرار: إعادة التطبيق لا تغيّر شيئاً", async () => {
    const res: any = await caller.students.applyFeaturedScores();
    expect(res.updatedCount).toBe(0);
    expect(res.registeredCount).toBe(0);
    expect(res.unchangedCount).toBe(FEATURED_SCORES.length);
  });
});
