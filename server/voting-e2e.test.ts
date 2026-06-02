import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

// سياق عام (التصويت publicProcedure) مع رؤوس طلب وهمية
function publicCtx(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "user-agent": "vitest" },
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const caller = appRouter.createCaller(publicCtx());

// أسماء معلمين موجودة فعلاً في القائمة داخل الذاكرة
const TEACHER_A = "سعود آل زايد";
const TEACHER_B = "حسام محمد الشقيقي";

async function openFreshVoting() {
  const now = new Date();
  await caller.voting.openVoting({
    weekNumber: Math.ceil(now.getDate() / 7),
    year: now.getFullYear(),
    startDate: now,
    endDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000),
  });
}

describe("التصويت — اختبار شامل من البداية للنهاية", () => {
  let studentIds: number[] = [];

  beforeAll(async () => {
    const students = await caller.students.list({ grade: undefined } as any);
    studentIds = students.slice(0, 5).map((s: any) => s.id);
    expect(studentIds.length).toBeGreaterThanOrEqual(4);
  });

  it("يفتح التصويت ويصبح مفتوحاً", async () => {
    await openFreshVoting();
    const current = await caller.voting.getCurrentPeriod();
    expect(current).not.toBeNull();
    expect(current!.status).toBe("open");
  });

  it("المعلم يصوّت لـ 3 طلاب فتُضاف 10 نقاط لكل طالب وتظهر في الموقع", async () => {
    const before = await caller.students.list({ grade: undefined } as any);
    const beforeScore = new Map(before.map((s: any) => [s.id, s.score]));

    const picked = studentIds.slice(0, 3);
    const res = await caller.voting.submitVotes({ studentIds: picked, teacherName: TEACHER_A });
    expect(res.success).toBe(true);

    // النقاط: +10 لكل طالب
    const after = await caller.students.list({ grade: undefined } as any);
    for (const id of picked) {
      const a = after.find((s: any) => s.id === id);
      expect(a.score).toBe((beforeScore.get(id) as number) + 10);
    }

    // تظهر في إحصائيات الأسبوع (getWeeklyStats)
    const weekly: any = await caller.voting.getWeeklyStats();
    const votedIds = weekly.topStudentsOverall.map((x: any) => x.student?.id);
    for (const id of picked) expect(votedIds).toContain(id);

    // تظهر في لوحة المعلومات العامة (getDashboardStats)
    const dash: any = await caller.voting.getDashboardStats();
    expect(dash.weeklyVotes).toBe(3);
  });

  it("يرفض التصويت بعدد طلاب مختلف عن 3 (طالبان أو أربعة)", async () => {
    await expect(
      caller.voting.submitVotes({ studentIds: studentIds.slice(0, 2), teacherName: TEACHER_B } as any)
    ).rejects.toThrow();
    await expect(
      caller.voting.submitVotes({ studentIds: studentIds.slice(0, 4), teacherName: TEACHER_B } as any)
    ).rejects.toThrow();
  });

  it("لا يسمح للمعلم بالتصويت مرتين في نفس الفترة", async () => {
    await expect(
      caller.voting.submitVotes({ studentIds: studentIds.slice(1, 4), teacherName: TEACHER_A })
    ).rejects.toThrow(/صوّت بالفعل|already/);
  });

  it("معلم آخر يستطيع التصويت ويُحتسب صوته", async () => {
    const res = await caller.voting.submitVotes({
      studentIds: studentIds.slice(2, 5),
      teacherName: TEACHER_B,
    });
    expect(res.success).toBe(true);

    const dash: any = await caller.voting.getDashboardStats();
    // 3 أصوات من المعلم الأول + 3 من الثاني = 6
    expect(dash.weeklyVotes).toBe(6);
  });

  it("البيانات السابقة لا تُحذف: تبقى أصوات الفترة القديمة قابلة للاسترجاع بعد فتح فترة جديدة", async () => {
    // الفترة الحالية وأصواتها قبل الفتح الجديد
    const oldPeriod = await caller.voting.getCurrentPeriod();
    expect(oldPeriod).not.toBeNull();
    const oldVotes = await caller.voting.getVotingResults({ periodId: oldPeriod!.id });
    expect(oldVotes.length).toBe(6);

    // فتح فترة جديدة (يغلق القديمة)
    await openFreshVoting();
    const newPeriod = await caller.voting.getCurrentPeriod();
    expect(newPeriod!.id).not.toBe(oldPeriod!.id);

    // الإحصائيات الجديدة فارغة (أسبوع جديد)
    const dashNew: any = await caller.voting.getDashboardStats();
    expect(dashNew.weeklyVotes).toBe(0);

    // لكن أصوات الفترة القديمة ما زالت موجودة في قاعدة البيانات
    const recovered = await caller.voting.getVotingResults({ periodId: oldPeriod!.id });
    expect(recovered.length).toBe(6);
  });
});
