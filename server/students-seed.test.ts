import { describe, expect, it } from "vitest";
import { STUDENTS_SEED } from "../shared/studentsSeed";

describe("students seed data", () => {
  it("includes the requested full student names with varied scores", () => {
    const byName = new Map(STUDENTS_SEED.map((student) => [student.fullName, student]));

    const requiredNames = [
      "أحمد حسام عبد الله الوادعي",
      "أوس علي محمد الشهري",
      "بسام محمد بن علي القرني",
      "تركي عبد العزيز محمد القحطاني",
      "ثنيان محمد يحيى آل صالح",
    ];

    for (const name of requiredNames) {
      expect(byName.has(name)).toBe(true);
    }

    const requestedStudents = requiredNames.map((name) => byName.get(name)!);
    expect(new Set(requestedStudents.map((student) => student.score)).size).toBeGreaterThan(3);
    expect(Math.min(...requestedStudents.map((student) => student.score))).toBeGreaterThanOrEqual(65);
    expect(Math.max(...requestedStudents.map((student) => student.score))).toBeGreaterThanOrEqual(110);
  });
});
