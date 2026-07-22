import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@test.com",
    name: "Test Admin",
    loginMethod: "test",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("students router", () => {
  it("should list all students", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const students = await caller.students.list();

    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThan(0);
    
    if (students.length > 0) {
      const student = students[0];
      expect(student).toHaveProperty("id");
      expect(student).toHaveProperty("fullName");
      expect(student).toHaveProperty("score");
    }
  });

  it("should get top 5 students", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const topStudents = await caller.students.topStudents({ limit: 5 });

    expect(Array.isArray(topStudents)).toBe(true);
    expect(topStudents.length).toBeLessThanOrEqual(5);
    
    // Verify students are sorted by score descending
    for (let i = 0; i < topStudents.length - 1; i++) {
      expect(topStudents[i]!.score).toBeGreaterThanOrEqual(topStudents[i + 1]!.score);
    }
  });

  it("should update student score", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Get first student
    const students = await caller.students.list();
    expect(students.length).toBeGreaterThan(0);
    
    const studentId = students[0]!.id;
    const newScore = 95;

    const result = await caller.students.updateScore({
      studentId,
      score: newScore,
    });

    expect(result.success).toBe(true);
  });
});
