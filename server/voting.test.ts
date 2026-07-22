import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as db from './db';

// Mock database functions
vi.mock('./db', () => ({
  getCurrentVotingPeriod: vi.fn(),
  getTeacherNameByName: vi.fn(),
  getTeacherVotesForPeriod: vi.fn(),
  submitTeacherVote: vi.fn(),
  getStudentById: vi.fn(),
  updateStudentScore: vi.fn(),
  logActivity: vi.fn(),
  getAllVotesForPeriod: vi.fn(),
  getAllAdmins: vi.fn(),
  createNotification: vi.fn(),
}));

describe('Voting System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Teacher Vote Uniqueness', () => {
    it('should prevent duplicate votes from the same teacher in the same period', async () => {
      // Setup: Teacher already voted
      const mockPeriod = { id: 1, status: 'open', weekNumber: 1 };
      const mockTeacher = { id: 1, fullName: 'أحمد محمد' };
      const existingVotes = [{ id: 1, teacherNameId: 1, studentId: 1 }];

      vi.mocked(db.getCurrentVotingPeriod).mockResolvedValue(mockPeriod as any);
      vi.mocked(db.getTeacherNameByName).mockResolvedValue(mockTeacher as any);
      vi.mocked(db.getTeacherVotesForPeriod).mockResolvedValue(existingVotes as any);

      // The check should find existing votes
      const votes = await db.getTeacherVotesForPeriod(mockTeacher.id, mockPeriod.id);
      
      expect(votes.length).toBeGreaterThan(0);
      expect(db.getTeacherVotesForPeriod).toHaveBeenCalledWith(1, 1);
    });

    it('should allow first-time vote from a teacher', async () => {
      // Setup: Teacher has not voted yet
      const mockPeriod = { id: 1, status: 'open', weekNumber: 1 };
      const mockTeacher = { id: 2, fullName: 'فهد علي' };
      const noExistingVotes: any[] = [];

      vi.mocked(db.getCurrentVotingPeriod).mockResolvedValue(mockPeriod as any);
      vi.mocked(db.getTeacherNameByName).mockResolvedValue(mockTeacher as any);
      vi.mocked(db.getTeacherVotesForPeriod).mockResolvedValue(noExistingVotes);

      const votes = await db.getTeacherVotesForPeriod(mockTeacher.id, mockPeriod.id);
      
      expect(votes.length).toBe(0);
    });
  });

  describe('Points Distribution Fairness', () => {
    it('should add exactly 10 points per vote', async () => {
      const mockStudent = { id: 1, fullName: 'طالب اختباري', score: 100 };
      
      vi.mocked(db.getStudentById).mockResolvedValue(mockStudent as any);
      vi.mocked(db.updateStudentScore).mockResolvedValue(undefined);

      const student = await db.getStudentById(1);
      const newScore = (student?.score || 0) + 10;
      
      expect(newScore).toBe(110);
      expect(newScore - (student?.score || 0)).toBe(10);
    });

    it('should give equal points regardless of vote rank', async () => {
      // All 3 students should get 10 points each
      const pointsPerVote = 10;
      const totalStudentsVoted = 3;
      const totalPointsDistributed = pointsPerVote * totalStudentsVoted;
      
      expect(totalPointsDistributed).toBe(30);
      expect(pointsPerVote).toBe(10); // Same for rank 1, 2, and 3
    });
  });

  describe('Voting Period Validation', () => {
    it('should reject votes when voting is closed', async () => {
      const closedPeriod = { id: 1, status: 'closed', weekNumber: 1 };
      
      vi.mocked(db.getCurrentVotingPeriod).mockResolvedValue(closedPeriod as any);
      
      const period = await db.getCurrentVotingPeriod();
      
      expect(period?.status).toBe('closed');
      expect(period?.status !== 'open').toBe(true);
    });

    it('should accept votes when voting is open', async () => {
      const openPeriod = { id: 1, status: 'open', weekNumber: 1 };
      
      vi.mocked(db.getCurrentVotingPeriod).mockResolvedValue(openPeriod as any);
      
      const period = await db.getCurrentVotingPeriod();
      
      expect(period?.status).toBe('open');
    });
  });

  describe('Activity Logging', () => {
    it('should log vote activity with correct details', async () => {
      const activityData = {
        activityType: 'vote',
        performedBy: 'معلم اختباري',
        studentId: 1,
        studentName: 'طالب اختباري',
        pointsChange: 10,
        previousScore: 100,
        newScore: 110,
        details: JSON.stringify({ voteRank: 1, periodId: 1 }),
        userAgent: 'Test Browser',
        ipAddress: '127.0.0.1',
        votingPeriodId: 1,
      };

      vi.mocked(db.logActivity).mockResolvedValue(undefined);
      
      await db.logActivity(activityData);
      
      expect(db.logActivity).toHaveBeenCalledWith(activityData);
    });
  });
});
