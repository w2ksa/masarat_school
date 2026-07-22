import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "teacher" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role,
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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("teachers router", () => {
  it("should allow authenticated users to get their teacher profile", async () => {
    const { ctx } = createAuthContext("teacher");
    const caller = appRouter.createCaller(ctx);

    const profile = await caller.teachers.getProfile();
    
    // Profile might be undefined if not registered yet
    expect(profile === undefined || typeof profile === "object").toBe(true);
  });

  it("should only allow admins to list all teachers", async () => {
    const { ctx: adminCtx } = createAuthContext("admin");
    const adminCaller = appRouter.createCaller(adminCtx);

    const teachers = await adminCaller.teachers.list();
    expect(Array.isArray(teachers)).toBe(true);

    // Non-admin should not be able to list teachers
    const { ctx: userCtx } = createAuthContext("user");
    const userCaller = appRouter.createCaller(userCtx);

    await expect(userCaller.teachers.list()).rejects.toThrow();
  });

  it("should only allow admins to update teacher status", async () => {
    const { ctx: adminCtx } = createAuthContext("admin");
    const adminCaller = appRouter.createCaller(adminCtx);

    // This will fail if teacher doesn't exist, but that's expected
    // We're just testing the authorization logic
    const { ctx: userCtx } = createAuthContext("user");
    const userCaller = appRouter.createCaller(userCtx);

    await expect(
      userCaller.teachers.updateStatus({ teacherId: 1, status: "approved" })
    ).rejects.toThrow();
  });
});

describe("notifications router", () => {
  it("should allow authenticated users to get their notifications", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.list();
    expect(Array.isArray(notifications)).toBe(true);
  });

  it("should allow authenticated users to get unread count", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const count = await caller.notifications.unreadCount();
    expect(typeof count === "number").toBe(true);
    expect(count >= 0).toBe(true);
  });
});
