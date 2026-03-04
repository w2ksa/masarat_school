import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => {
  const mockCategories = [
    { id: 1, name: "حضور", defaultPoints: 2, isActive: 1, sortOrder: 1, createdAt: new Date() },
    { id: 2, name: "غياب", defaultPoints: -2, isActive: 1, sortOrder: 2, createdAt: new Date() },
    { id: 3, name: "مشاركة", defaultPoints: 10, isActive: 1, sortOrder: 3, createdAt: new Date() },
    { id: 4, name: "مبادرة", defaultPoints: 10, isActive: 1, sortOrder: 4, createdAt: new Date() },
    { id: 5, name: "درجة عامة", defaultPoints: 0, isActive: 1, sortOrder: 5, createdAt: new Date() },
  ];

  const mockHistory = [
    {
      id: 1,
      studentId: 1,
      categoryId: 1,
      categoryName: "حضور",
      pointsChange: 2,
      previousScore: 10,
      newScore: 12,
      performedBy: "مدير النظام",
      comment: null,
      createdAt: new Date("2026-02-08T10:00:00Z"),
    },
    {
      id: 2,
      studentId: 1,
      categoryId: 5,
      categoryName: "درجة عامة",
      pointsChange: 10,
      previousScore: 0,
      newScore: 10,
      performedBy: "سعود آل زايد",
      comment: "مشاركات ومبادرات",
      createdAt: new Date("2026-02-07T10:00:00Z"),
    },
  ];

  return {
    getScoreCategories: vi.fn().mockResolvedValue(mockCategories),
    getStudentScoreHistory: vi.fn().mockResolvedValue(mockHistory),
    applyCategoryToStudents: vi.fn().mockResolvedValue(3),
    applyCategoryToStudent: vi.fn().mockResolvedValue({
      id: 1,
      name: "أحمد سلطان عسيري",
      score: 12,
    }),
    // Include all other exports that routers.ts might use
    upsertUser: vi.fn(),
    getAllTeachers: vi.fn().mockResolvedValue([]),
    getTeacherByUserId: vi.fn(),
    updateTeacherStatus: vi.fn(),
    getAllStudents: vi.fn().mockResolvedValue([]),
    getStudentsByGrade: vi.fn().mockResolvedValue([]),
    addStudent: vi.fn(),
    updateStudentScore: vi.fn(),
    deleteStudent: vi.fn(),
    getTopStudents: vi.fn().mockResolvedValue([]),
    getLevelStats: vi.fn().mockResolvedValue([]),
    getActivityLog: vi.fn().mockResolvedValue([]),
    addActivityLog: vi.fn(),
    getStudentContent: vi.fn().mockResolvedValue([]),
    addStudentContent: vi.fn(),
    updateStudentContentStatus: vi.fn(),
    deleteStudentContent: vi.fn(),
    isContentSubmissionEnabled: vi.fn().mockResolvedValue(true),
    toggleContentSubmission: vi.fn(),
    getVotingPeriods: vi.fn().mockResolvedValue([]),
    createVotingPeriod: vi.fn(),
    updateVotingPeriod: vi.fn(),
    deleteVotingPeriod: vi.fn(),
    getTeacherVotes: vi.fn().mockResolvedValue([]),
    castVote: vi.fn(),
    getTeacherVoteResults: vi.fn().mockResolvedValue([]),
    getStudentsByGradeAndSection: vi.fn().mockResolvedValue([]),
    updateStudent: vi.fn(),
    getWeeklyScoreStats: vi.fn().mockResolvedValue([]),
    getStudentReport: vi.fn().mockResolvedValue(null),
    bulkUpdateStudentScores: vi.fn(),
    getDb: vi.fn(),
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("scoreCategories.list", () => {
  it("returns all active score categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.scoreCategories.list();

    expect(categories).toHaveLength(5);
    expect(categories[0]).toMatchObject({
      id: 1,
      name: "حضور",
      defaultPoints: 2,
      isActive: 1,
    });
    expect(categories[1]).toMatchObject({
      name: "غياب",
      defaultPoints: -2,
    });
    expect(categories[4]).toMatchObject({
      name: "درجة عامة",
      defaultPoints: 0,
    });
  });
});

describe("scoreHistory.getByStudent", () => {
  it("returns score history for a student", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.scoreHistory.getByStudent({ studentId: 1 });

    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({
      studentId: 1,
      categoryName: "حضور",
      pointsChange: 2,
      previousScore: 10,
      newScore: 12,
      performedBy: "مدير النظام",
    });
    expect(history[1]).toMatchObject({
      categoryName: "درجة عامة",
      pointsChange: 10,
      comment: "مشاركات ومبادرات",
    });
  });
});

describe("bulkCategory.bulkApply", () => {
  it("applies category to multiple students", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.bulkCategory.bulkApply({
      studentIds: [1, 2, 3],
      categoryId: 1,
      categoryName: "حضور",
      pointsChange: 2,
      performedBy: "مدير النظام",
      comment: null,
    });

    expect(result).toEqual({ success: true, updatedCount: 3 });
  });
});

describe("bulkCategory.singleApply", () => {
  it("applies category to a single student", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.bulkCategory.singleApply({
      studentId: 1,
      categoryId: 1,
      categoryName: "حضور",
      pointsChange: 2,
      performedBy: "مدير النظام",
      comment: null,
    });

    expect(result).toEqual({
      success: true,
      result: {
        id: 1,
        name: "أحمد سلطان عسيري",
        score: 12,
      },
    });
  });
});
