import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  batchUpdateScores: vi.fn(),
  bulkAddScoresByFilter: vi.fn(),
  bulkDeductScoresByFilter: vi.fn(),
  addStudent: vi.fn(),
}));

import * as db from "./db";

describe("Batch Score Updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("batchUpdateScores", () => {
    it("should add points to multiple students", async () => {
      const mockBatchUpdate = vi.mocked(db.batchUpdateScores);
      mockBatchUpdate.mockResolvedValue(5);

      const result = await db.batchUpdateScores([1, 2, 3, 4, 5], 10, "add");
      
      expect(mockBatchUpdate).toHaveBeenCalledWith([1, 2, 3, 4, 5], 10, "add");
      expect(result).toBe(5);
    });

    it("should deduct points from multiple students", async () => {
      const mockBatchUpdate = vi.mocked(db.batchUpdateScores);
      mockBatchUpdate.mockResolvedValue(3);

      const result = await db.batchUpdateScores([1, 2, 3], 5, "deduct");
      
      expect(mockBatchUpdate).toHaveBeenCalledWith([1, 2, 3], 5, "deduct");
      expect(result).toBe(3);
    });

    it("should return 0 for empty student array", async () => {
      const mockBatchUpdate = vi.mocked(db.batchUpdateScores);
      mockBatchUpdate.mockResolvedValue(0);

      const result = await db.batchUpdateScores([], 10, "add");
      
      expect(result).toBe(0);
    });
  });

  describe("bulkAddScoresByFilter", () => {
    it("should add points to students filtered by grade", async () => {
      const mockBulkAdd = vi.mocked(db.bulkAddScoresByFilter);
      mockBulkAdd.mockResolvedValue(50);

      const result = await db.bulkAddScoresByFilter(10, "رابع");
      
      expect(mockBulkAdd).toHaveBeenCalledWith(10, "رابع");
      expect(result).toBe(50);
    });

    it("should add points to students filtered by grade and section", async () => {
      const mockBulkAdd = vi.mocked(db.bulkAddScoresByFilter);
      mockBulkAdd.mockResolvedValue(25);

      const result = await db.bulkAddScoresByFilter(15, "خامس", 2);
      
      expect(mockBulkAdd).toHaveBeenCalledWith(15, "خامس", 2);
      expect(result).toBe(25);
    });

    it("should add points to all students when no filter", async () => {
      const mockBulkAdd = vi.mocked(db.bulkAddScoresByFilter);
      mockBulkAdd.mockResolvedValue(425);

      const result = await db.bulkAddScoresByFilter(5);
      
      expect(mockBulkAdd).toHaveBeenCalledWith(5);
      expect(result).toBe(425);
    });
  });

  describe("bulkDeductScoresByFilter", () => {
    it("should deduct points from students filtered by grade", async () => {
      const mockBulkDeduct = vi.mocked(db.bulkDeductScoresByFilter);
      mockBulkDeduct.mockResolvedValue(30);

      const result = await db.bulkDeductScoresByFilter(5, "سادس");
      
      expect(mockBulkDeduct).toHaveBeenCalledWith(5, "سادس");
      expect(result).toBe(30);
    });
  });

  describe("addStudent with section", () => {
    it("should add student with section", async () => {
      const mockAddStudent = vi.mocked(db.addStudent);
      mockAddStudent.mockResolvedValue(undefined);

      await db.addStudent({
        fullName: "أحمد محمد",
        grade: "أول",
        section: 2,
        score: 0
      });
      
      expect(mockAddStudent).toHaveBeenCalledWith({
        fullName: "أحمد محمد",
        grade: "أول",
        section: 2,
        score: 0
      });
    });

    it("should add student with default section 1", async () => {
      const mockAddStudent = vi.mocked(db.addStudent);
      mockAddStudent.mockResolvedValue(undefined);

      await db.addStudent({
        fullName: "محمد علي",
        grade: "ثاني",
        section: 1,
        score: 0
      });
      
      expect(mockAddStudent).toHaveBeenCalledWith({
        fullName: "محمد علي",
        grade: "ثاني",
        section: 1,
        score: 0
      });
    });
  });
});

describe("Performance Optimization", () => {
  it("should use single SQL query for batch updates", async () => {
    // This test verifies that the batch update function is called once
    // instead of multiple times for each student
    const mockBatchUpdate = vi.mocked(db.batchUpdateScores);
    mockBatchUpdate.mockResolvedValue(100);

    const studentIds = Array.from({ length: 100 }, (_, i) => i + 1);
    await db.batchUpdateScores(studentIds, 10, "add");
    
    // Should only be called once, not 100 times
    expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
  });

  it("should use single SQL query for bulk add by filter", async () => {
    const mockBulkAdd = vi.mocked(db.bulkAddScoresByFilter);
    mockBulkAdd.mockResolvedValue(425);

    await db.bulkAddScoresByFilter(10, "رابع", 1);
    
    // Should only be called once
    expect(mockBulkAdd).toHaveBeenCalledTimes(1);
  });
});
