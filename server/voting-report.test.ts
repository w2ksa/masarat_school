import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

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

describe("تقرير التصويت واسترجاع البيانات السابقة", () => {
  let studentIds: number[] = [];

  beforeAll(async () => {
    await db.closeAllOpenVotingPeriods();
    const students = await caller.students.list({ grade: undefined } as any);
    studentIds = students.slice(0, 3).map((s: any) => s.id);
  });

  it("getVotingReport يعرض المعلمين الذين صوّتوا (يعمل بدون قاعدة بيانات)", async () => {
    const now = new Date();
    await caller.voting.openVoting({
      weekNumber: 10, year: now.getFullYear(), startDate: now,
      endDate: new Date(now.getTime() + 7 * 86400000),
    });

    await caller.voting.submitVotes({ studentIds, teacherName: "سعود آل زايد" });

    const report: any = await caller.getVotingReport({});
    expect(Array.isArray(report.report)).toBe(true);
    expect(report.report.length).toBeGreaterThan(0);
    const voted = report.report.filter((t: any) => t.hasVoted);
    expect(voted.length).toBe(1);
    expect(voted[0].teacherName).toBe("سعود آل زايد");
    expect(voted[0].votedStudents.length).toBe(3);
  });

  it("listPeriods يُرجع الفترات مع عدد الأصوات (لاسترجاع الأسابيع السابقة)", async () => {
    const periodBefore = await caller.voting.getCurrentPeriod();
    const oldId = periodBefore!.id;

    // فتح فترة جديدة (تُغلق القديمة) — تحاكي بدء أسبوع جديد
    const now = new Date();
    await caller.voting.openVoting({
      weekNumber: 11, year: now.getFullYear(), startDate: now,
      endDate: new Date(now.getTime() + 7 * 86400000),
    });

    const periods: any[] = await caller.voting.listPeriods();
    // الأحدث أولاً
    expect(periods[0].id).toBeGreaterThan(oldId);
    const old = periods.find((p) => p.id === oldId);
    expect(old).toBeDefined();
    expect(old.voteCount).toBe(3); // الأصوات القديمة ما زالت محفوظة

    // عرض تقرير الفترة القديمة تحديداً يعمل ويحمل التواريخ الصحيحة
    const oldReport: any = await caller.getVotingReport({ periodId: oldId });
    expect(oldReport.period.id).toBe(oldId);
    expect(oldReport.report.filter((t: any) => t.hasVoted).length).toBe(1);
  });
});
