import { describe, it, expect, beforeEach } from 'vitest';
import * as db from './db';

// هذه الاختبارات تستخدم المخزن في الذاكرة (بدون DATABASE_URL) للتحقق
// من اتساق فترة التصويت الحالية ومنع تراكم أكثر من فترة مفتوحة.
describe('Voting Period Consistency (in-memory)', () => {
  beforeEach(async () => {
    // إغلاق أي فترات مفتوحة متبقية من اختبارات سابقة
    await db.closeAllOpenVotingPeriods();
  });

  it('getCurrentVotingPeriod يُرجع أحدث فترة مفتوحة وليس الأقدم', async () => {
    const base = new Date('2026-01-01T00:00:00Z');
    const week = (n: number) => ({
      weekNumber: n,
      year: 2026,
      startDate: base,
      endDate: new Date(base.getTime() + 7 * 24 * 3600 * 1000),
    });

    const first = await db.createVotingPeriod(week(1));
    // فاصل زمني بسيط لضمان اختلاف createdAt
    await new Promise((r) => setTimeout(r, 5));
    const second = await db.createVotingPeriod(week(2));

    const current = await db.getCurrentVotingPeriod();
    expect(current).not.toBeNull();
    // يجب أن تكون الأحدث (second) هي الحالية
    expect(current!.id).toBe((second as any).id);
    expect(current!.id).not.toBe((first as any).id);
  });

  it('closeAllOpenVotingPeriods يغلق جميع الفترات المفتوحة', async () => {
    const base = new Date('2026-02-01T00:00:00Z');
    await db.createVotingPeriod({ weekNumber: 1, year: 2026, startDate: base, endDate: base });
    await db.createVotingPeriod({ weekNumber: 2, year: 2026, startDate: base, endDate: base });

    await db.closeAllOpenVotingPeriods();

    const current = await db.getCurrentVotingPeriod();
    expect(current).toBeNull();
  });

  it('بعد إغلاق الكل وفتح فترة جديدة، تكون هناك فترة مفتوحة واحدة فقط هي الجديدة', async () => {
    const base = new Date('2026-03-01T00:00:00Z');
    await db.createVotingPeriod({ weekNumber: 1, year: 2026, startDate: base, endDate: base });
    await db.createVotingPeriod({ weekNumber: 2, year: 2026, startDate: base, endDate: base });

    // محاكاة منطق openVoting: إغلاق الكل ثم إنشاء فترة جديدة
    await db.closeAllOpenVotingPeriods();
    const fresh = await db.createVotingPeriod({
      weekNumber: 3,
      year: 2026,
      startDate: base,
      endDate: base,
    });

    const current = await db.getCurrentVotingPeriod();
    expect(current).not.toBeNull();
    expect(current!.id).toBe((fresh as any).id);
  });
});
