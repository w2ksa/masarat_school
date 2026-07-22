import { describe, expect, it } from "vitest";
import { getStudentLevel, getLevelProgress, getPointsToNextLevel, LEVELS } from "../shared/levels";

describe("Student Levels System", () => {
  describe("getStudentLevel", () => {
    it("should return طالب مبتدئ for score 0-99", () => {
      expect(getStudentLevel(0).name).toBe("طالب مبتدئ");
      expect(getStudentLevel(50).name).toBe("طالب مبتدئ");
      expect(getStudentLevel(99).name).toBe("طالب مبتدئ");
    });

    it("should return مُبادر for score 100-199", () => {
      expect(getStudentLevel(100).name).toBe("مُبادر");
      expect(getStudentLevel(150).name).toBe("مُبادر");
      expect(getStudentLevel(199).name).toBe("مُبادر");
    });

    it("should return مُجتهد for score 200-299", () => {
      expect(getStudentLevel(200).name).toBe("مُجتهد");
      expect(getStudentLevel(250).name).toBe("مُجتهد");
      expect(getStudentLevel(299).name).toBe("مُجتهد");
    });

    it("should return مُنضبط for score 300-399", () => {
      expect(getStudentLevel(300).name).toBe("مُنضبط");
      expect(getStudentLevel(350).name).toBe("مُنضبط");
      expect(getStudentLevel(399).name).toBe("مُنضبط");
    });

    it("should return مُتميز for score 400-499", () => {
      expect(getStudentLevel(400).name).toBe("مُتميز");
      expect(getStudentLevel(450).name).toBe("مُتميز");
      expect(getStudentLevel(499).name).toBe("مُتميز");
    });

    it("should return قُدوة for score 500+", () => {
      expect(getStudentLevel(500).name).toBe("قُدوة");
      expect(getStudentLevel(1000).name).toBe("قُدوة");
      expect(getStudentLevel(9999).name).toBe("قُدوة");
    });
  });

  describe("getLevelProgress", () => {
    it("should return correct progress percentage", () => {
      // طالب مبتدئ level (0-99)
      expect(getLevelProgress(0)).toBe(0);
      expect(getLevelProgress(50)).toBeGreaterThan(45);
      expect(getLevelProgress(50)).toBeLessThan(55);
      expect(getLevelProgress(99)).toBeGreaterThan(95);

      // مُبادر level (100-199)
      expect(getLevelProgress(100)).toBeCloseTo(0, 0);
      expect(getLevelProgress(150)).toBeGreaterThan(45);
      expect(getLevelProgress(150)).toBeLessThan(55);
    });

    it("should return 100 for قُدوة level", () => {
      expect(getLevelProgress(500)).toBe(100);
      expect(getLevelProgress(1000)).toBe(100);
    });
  });

  describe("getPointsToNextLevel", () => {
    it("should return correct points to next level", () => {
      // From طالب مبتدئ to مُبادر
      expect(getPointsToNextLevel(0)).toBe(100);
      expect(getPointsToNextLevel(50)).toBe(50);
      expect(getPointsToNextLevel(99)).toBe(1);

      // From مُبادر to مُجتهد
      expect(getPointsToNextLevel(100)).toBe(100);
      expect(getPointsToNextLevel(150)).toBe(50);
      expect(getPointsToNextLevel(199)).toBe(1);
    });

    it("should return 0 for قُدوة level", () => {
      expect(getPointsToNextLevel(500)).toBe(0);
      expect(getPointsToNextLevel(1000)).toBe(0);
    });
  });

  describe("LEVELS configuration", () => {
    it("should have 6 levels", () => {
      expect(LEVELS).toHaveLength(6);
    });

    it("should have correct level names", () => {
      expect(LEVELS[0].name).toBe("طالب مبتدئ");
      expect(LEVELS[1].name).toBe("مُبادر");
      expect(LEVELS[2].name).toBe("مُجتهد");
      expect(LEVELS[3].name).toBe("مُنضبط");
      expect(LEVELS[4].name).toBe("مُتميز");
      expect(LEVELS[5].name).toBe("قُدوة");
    });

    it("should have correct icons", () => {
      expect(LEVELS[0].icon).toBe("🎯");
      expect(LEVELS[1].icon).toBe("🌱");
      expect(LEVELS[2].icon).toBe("📚");
      expect(LEVELS[3].icon).toBe("⚡");
      expect(LEVELS[4].icon).toBe("⭐");
      expect(LEVELS[5].icon).toBe("👑");
    });
  });
});
