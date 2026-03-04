// تحديث getWeeklyStats
const newCode = `    getWeeklyStats: protectedProcedure.query(async ({ ctx }) => {
      // Only admins can view stats
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "ليس لديك صلاحية عرض الإحصائيات" });
      }

      const currentPeriod = await db.getCurrentVotingPeriod();
      if (!currentPeriod) {
        return { topStudents: [], topStudentsByGrade: {}, allVotes: [] };
      }

      const votes = await db.getAllVotesForPeriod(currentPeriod.id);
      
      // حساب عدد التصويتات لكل طالب
      const voteCounts = new Map<number, { student: any; count: number }>();
      
      for (const vote of votes) {
        const studentId = vote.studentId;
        if (!voteCounts.has(studentId)) {
          const student = await db.getStudentById(studentId);
          voteCounts.set(studentId, { student, count: 0 });
        }
        const current = voteCounts.get(studentId)!;
        current.count++;
      }

      // ترتيب الطلاب حسب عدد التصويتات
      const sorted = Array.from(voteCounts.values()).sort((a, b) => b.count - a.count);
      const topStudents = sorted.slice(0, 5);

      // حساب أعلى طالب في كل الصفوف الستة
      const topStudentsByGrade: Record<string, any> = {};
      const grades = ["أول", "ثاني", "ثالث", "رابع", "خامس", "سادس"];
      
      for (const grade of grades) {
        const studentsInGrade = sorted.filter(item => item.student?.grade === grade);
        if (studentsInGrade.length > 0) {
          topStudentsByGrade[grade] = studentsInGrade[0];
        }
      }

      return { topStudents, topStudentsByGrade, allVotes: votes };
    }),`;

console.log(newCode);
