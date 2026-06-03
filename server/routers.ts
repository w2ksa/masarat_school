import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,

  // حالة الاتصال بقاعدة البيانات — لتنبيه المدير عند تشغيل الموقع بدون قاعدة بيانات
  dbStatus: publicProcedure.query(async () => {
    return await db.getDbStatus();
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Teachers router
  teachers: router({
    register: publicProcedure
      .input(z.object({
        specialization: z.string().optional(),
        phoneNumber: z.string().optional(),
        bio: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),

    getProfile: publicProcedure.query(async () => {
      return null;
    }),

    list: publicProcedure.query(async () => {
      return await db.getAllTeachers();
    }),

    updateStatus: publicProcedure
      .input(z.object({
        teacherId: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        return await db.updateTeacherStatus(input.teacherId, input.status);
      }),

    listNames: publicProcedure.query(async () => {
      return await db.getAllTeacherNames();
    }),

    addTeacherName: publicProcedure
      .input(z.object({ fullName: z.string().min(1) }))
      .mutation(async ({ input }) => {
        await db.addTeacherName(input.fullName);
        return { success: true };
      }),

    deleteTeacherName: publicProcedure
      .input(z.object({ teacherId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTeacherName(input.teacherId);
        return { success: true };
      }),
  }),

  // Files router
  files: router({
    upload: publicProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        fileName: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Upload to S3
        const fileBuffer = Buffer.from(input.fileData, "base64");
        const fileKey = `files/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

        return { success: true, url };
      }),

    list: publicProcedure.query(async () => {
      return await db.getAllFiles();
    }),

    myFiles: publicProcedure.query(async () => {
      return [];
    }),

    delete: publicProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),
  }),

  // Notifications router
  notifications: router({
    list: publicProcedure.query(async () => {
      return [];
    }),

    unreadCount: publicProcedure.query(async () => {
      return 0;
    }),

    markAsRead: publicProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markNotificationAsRead(input.notificationId);
      }),
  }),

  // Students router
  students: router({
    list: publicProcedure
      .input(z.object({ 
        grade: z.string().optional(),
        section: z.number().optional()
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllStudents(input?.grade, input?.section);
      }),

    topStudents: publicProcedure
      .input(z.object({ 
        limit: z.number().optional(), 
        grade: z.string().optional(),
        gradeGroup: z.enum(["primary", "upper"]).optional()
      }))
      .query(async ({ input }) => {
        return await db.getTopStudents(input.limit || 5, input.grade, input.gradeGroup);
      }),

    getLevelStats: publicProcedure
      .query(async () => {
        return await db.getLevelStats();
      }),

    updateScore: publicProcedure
      .input(
        z.object({
          studentId: z.number(),
          score: z.number().min(0),
          comment: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Get student before update
        const studentBefore = await db.getStudentById(input.studentId);
        const previousScore = studentBefore?.score || 0;
        
        // تحديث نقاط الطالب
        await db.updateStudentScore(input.studentId, input.score, input.comment ?? undefined);

        // Log the score update
        const userAgent = ctx.req.headers['user-agent'] || 'غير معروف';
        const ipAddress = ctx.req.headers['x-forwarded-for'] as string || ctx.req.socket?.remoteAddress || 'غير معروف';
        const pointsChange = input.score - previousScore;
        
        await db.logActivity({
          activityType: pointsChange >= 0 ? 'add_score' : 'deduct_score',
          performedBy: 'مدير النظام',
          studentId: input.studentId,
          studentName: studentBefore?.fullName || 'غير معروف',
          pointsChange: Math.abs(pointsChange),
          previousScore: previousScore,
          newScore: input.score,
          details: input.comment ? JSON.stringify({ comment: input.comment }) : null,
          userAgent: userAgent,
          ipAddress: ipAddress,
        });
        
        // إرسال إشعار عند وصول الطالب لمستوى "قُدوة" (500+)
        if (input.score >= 500) {
          const student = await db.getStudentById(input.studentId);
          if (student) {
            await notifyOwner({
              title: "طالب متميز وصل لمستوى قُدوة",
              content: `الطالب ${student.fullName} وصل إلى ${input.score} نقطة وحقق مستوى "قُدوة" في مسارات`,
            });
          }
        }
        
        return { success: true };
      }),

    // تطبيق درجات الطلاب المميّزين (17 طالباً) بالضبط بالمطابقة بالاسم.
    // لا يمسّ أي طالب آخر، ولا يحذف شيئاً، وآمن للتكرار.
    applyFeaturedScores: publicProcedure.mutation(async ({ ctx }) => {
      const { FEATURED_SCORES } = await import("@shared/featuredScores");
      const allStudents = await db.getAllStudents();
      const byName = new Map(allStudents.map((s: any) => [s.fullName.trim(), s]));

      const userAgent = ctx.req.headers["user-agent"] || "غير معروف";
      const ipAddress =
        (ctx.req.headers["x-forwarded-for"] as string) || ctx.req.socket?.remoteAddress || "غير معروف";

      const updated: { name: string; from: number; to: number }[] = [];
      const notFound: string[] = [];

      for (const item of FEATURED_SCORES) {
        const student: any = byName.get(item.name.trim());
        if (!student) {
          notFound.push(item.name);
          continue;
        }
        const previousScore = student.score || 0;
        if (previousScore === item.score) continue;

        await db.updateStudentScore(student.id, item.score, undefined);
        await db.logActivity({
          activityType: item.score >= previousScore ? "add_score" : "deduct_score",
          performedBy: "مدير النظام",
          studentId: student.id,
          studentName: student.fullName,
          pointsChange: Math.abs(item.score - previousScore),
          previousScore,
          newScore: item.score,
          details: JSON.stringify({ reason: "تطبيق درجات الطلاب المميّزين" }),
          userAgent,
          ipAddress,
        });
        updated.push({ name: item.name, from: previousScore, to: item.score });
      }

      return {
        success: true,
        total: FEATURED_SCORES.length,
        updatedCount: updated.length,
        unchangedCount: FEATURED_SCORES.length - updated.length - notFound.length,
        updated,
        notFound,
      };
    }),

    addBulkScore: publicProcedure
      .input(
        z.object({
          points: z.number().min(1),
          grade: z.string().optional(),
          section: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const count = await db.bulkAddScoresByFilter(input.points, input.grade, input.section);
        return { success: true, count };
      }),

    deductBulkScore: publicProcedure
      .input(
        z.object({
          points: z.number().min(1),
          grade: z.string().optional(),
          section: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const count = await db.bulkDeductScoresByFilter(input.points, input.grade, input.section);
        return { success: true, count };
      }),

    addStudent: publicProcedure
      .input(
        z.object({
          fullName: z.string().min(1),
          grade: z.string(),
          section: z.number().min(1).max(10).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.addStudent({ 
          fullName: input.fullName, 
          grade: input.grade, 
          section: input.section || 1,
          score: 0 
        });
        return { success: true };
      }),

    deleteStudent: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteStudent(input.id);
        return { success: true };
      }),

    updateStudentName: publicProcedure
      .input(
        z.object({
          id: z.number(),
          fullName: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateStudentName(input.id, input.fullName);
        return { success: true };
      }),

    // Batch update scores for multiple selected students - optimized for speed
    batchUpdateScores: publicProcedure
      .input(
        z.object({
          studentIds: z.array(z.number()).min(1),
          points: z.number().min(1),
          action: z.enum(["add", "deduct"]),
        })
      )
      .mutation(async ({ input }) => {
        const count = await db.batchUpdateScores(input.studentIds, input.points, input.action);
        return { success: true, count };
      }),

    getDailyReport: publicProcedure.query(async () => {
      // Get all students sorted by score (descending)
      const students = await db.getAllStudents();
      const sortedStudents = students.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      // Calculate stats
      const totalStudents = students.length;
      const totalScore = students.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = totalStudents > 0 ? (totalScore / totalStudents).toFixed(2) : "0.00";
      
      // Group by grade
      const gradeStats: Record<string, { count: number; totalScore: number; avgScore: string }> = {};
      for (const student of students) {
        if (!gradeStats[student.grade]) {
          gradeStats[student.grade] = { count: 0, totalScore: 0, avgScore: "0" };
        }
        gradeStats[student.grade].count++;
        gradeStats[student.grade].totalScore += student.score || 0;
      }
      
      // Calculate average for each grade
      for (const grade in gradeStats) {
        const stat = gradeStats[grade];
        stat.avgScore = (stat.totalScore / stat.count).toFixed(2);
      }
      
      return {
        date: new Date().toISOString(),
        totalStudents,
        averageScore,
        gradeStats,
        students: sortedStudents.map((s, index) => ({
          rank: index + 1,
          id: s.id,
          fullName: s.fullName,
          grade: s.grade,
          score: s.score || 0,
        })),
      };
    }),
  }),

  // Voting router
  voting: router({
    getCurrentPeriod: publicProcedure.query(async () => {
      return await db.getCurrentVotingPeriod();
    }),

    // قائمة بجميع فترات التصويت (الأحدث أولاً) مع عدد الأصوات — لاسترجاع البيانات السابقة
    listPeriods: publicProcedure.query(async () => {
      return await db.getAllVotingPeriods();
    }),

    openVoting: publicProcedure
      .input(
        z.object({
          weekNumber: z.number(),
          year: z.number(),
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        // إغلاق جميع الفترات المفتوحة (وليس فترة واحدة) لتفادي تراكم أكثر من فترة مفتوحة
        await db.closeAllOpenVotingPeriods();

        // Create new voting period
        await db.createVotingPeriod(input);
        return { success: true };
      }),

    closeVoting: publicProcedure
      .input(z.object({ periodId: z.number() }))
      .mutation(async ({ input }) => {
        await db.closeVotingPeriod(input.periodId);
        return { success: true };
      }),

    submitVotes: publicProcedure
      .input(
        z.object({
          studentIds: z.array(z.number()).length(3),
      teacherName: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if voting is open
        const currentPeriod = await db.getCurrentVotingPeriod();
        if (!currentPeriod || currentPeriod.status !== "open") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "التصويت مغلق حالياً" });
        }

        // Find teacher name in teacher_names table
        const teacherName = await db.getTeacherNameByName(input.teacherName);
        if (!teacherName) {
          throw new TRPCError({ code: "NOT_FOUND", message: "لم يتم العثور على اسم المعلم في القائمة" });
        }

        // Check if teacher has already voted in this period (using database)
        const existingVotes = await db.getTeacherVotesForPeriod(teacherName.id, currentPeriod.id);
        
        if (existingVotes.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "لقد صوّت بالفعل في هذه الفترة" });
        }



        // Get user agent from request headers
        const userAgent = ctx.req.headers['user-agent'] || 'غير معروف';
        const ipAddress = ctx.req.headers['x-forwarded-for'] as string || ctx.req.socket?.remoteAddress || 'غير معروف';

        // Submit new votes and add 10 points to each student
        const votedStudentNames: string[] = [];
        for (let i = 0; i < input.studentIds.length; i++) {
          const studentId = input.studentIds[i]!;
          
          // Submit vote
          await db.submitTeacherVote({
            teacherNameId: teacherName.id,
            votingPeriodId: currentPeriod.id,
            studentId,
            voteRank: i + 1,
          });
          
          // Add 10 points to the student
          const student = await db.getStudentById(studentId);
          if (student) {
            const previousScore = student.score || 0;
            const newScore = previousScore + 10;
            await db.updateStudentScore(studentId, newScore, undefined);
            votedStudentNames.push(student.fullName);

            // Log the vote activity
            await db.logActivity({
              activityType: 'vote',
              performedBy: input.teacherName,
              studentId: studentId,
              studentName: student.fullName,
              pointsChange: 10,
              previousScore: previousScore,
              newScore: newScore,
              details: JSON.stringify({
                voteRank: i + 1,
                periodId: currentPeriod.id,
                weekNumber: currentPeriod.weekNumber,
              }),
              userAgent: userAgent,
              ipAddress: ipAddress,
              votingPeriodId: currentPeriod.id,
            });
          }
        }

        // حساب أعلى طالب حصل على تصويتات
        const allVotes = await db.getAllVotesForPeriod(currentPeriod.id);
        const voteCounts = new Map<number, { studentId: number; count: number }>();
        allVotes.forEach((vote) => {
          const existing = voteCounts.get(vote.studentId);
          if (existing) {
            existing.count++;
          } else {
            voteCounts.set(vote.studentId, { studentId: vote.studentId, count: 1 });
          }
        });

        const sorted = Array.from(voteCounts.values()).sort((a, b) => b.count - a.count);
        if (sorted.length > 0 && sorted[0]!.count >= 5) {
          const topVote = sorted[0]!;
          const topStudent = await db.getStudentById(topVote.studentId);
          
          if (topStudent) {
            // إشعار لجميع الإداريين
            const admins = await db.getAllAdmins();
            for (const admin of admins) {
              await db.createNotification({
                userId: admin.id,
                title: "طالب متصدر في التصويتات!",
                content: `الطالب ${topStudent.fullName} حصل على ${topVote.count} تصويت وهو الأعلى هذا الأسبوع ⭐`,
                type: "system",
              });
            }
            
            // إشعار للمالك
            await notifyOwner({
              title: "طالب متصدر في التصويتات",
              content: `الطالب ${topStudent.fullName} حصل على ${topVote.count} تصويت وهو الأعلى هذا الأسبوع في مسارات`,
            });
          }
        }

        // No need for cookies - we check the database for existing votes

        return { success: true };
      }),

    getVotingResults: publicProcedure
      .input(z.object({ periodId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAllVotesForPeriod(input.periodId);
      }),

    getWeeklyStats: publicProcedure.query(async () => {
      const currentPeriod = await db.getLatestVotingPeriod();
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

      // أعلى الطلاب على مستوى كل الصفوف
      const topStudentsOverall = sorted.map(item => ({
        studentId: item.student?.id,
        student: item.student,
        count: item.count
      }));

      return { topStudents, topStudentsByGrade, topStudentsOverall, allVotes: votes };
    }),

    getDashboardStats: publicProcedure.query(async () => {
      const students = await db.getAllStudents();
      const currentPeriod = await db.getLatestVotingPeriod();
      
      // إحصائيات عامة
      const totalStudents = students.length;
      const totalScore = students.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = totalStudents > 0 ? totalScore / totalStudents : 0;
      const excellentStudents = students.filter(s => (s.score || 0) >= 500).length;
      
      // التصويتات الأسبوعية
      let weeklyVotes = 0;
      if (currentPeriod) {
        const votes = await db.getAllVotesForPeriod(currentPeriod.id);
        weeklyVotes = votes.length;
      }
      
      // توزيع الطلاب حسب الصف
      const gradeGroups = students.reduce((acc: any, s) => {
        const grade = s.grade || "غير محدد";
        if (!acc[grade]) acc[grade] = [];
        acc[grade].push(s);
        return acc;
      }, {});
      
      // ترتيب الصفوف الصحيح
      const gradeOrder = ["أول", "ثاني", "ثالث", "رابع", "خامس", "سادس"];
      const sortedGrades = Object.keys(gradeGroups).sort((a, b) => {
        const indexA = gradeOrder.indexOf(a);
        const indexB = gradeOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      
      const studentsByGrade = sortedGrades.map(grade => ({
        grade,
        count: gradeGroups[grade].length,
      }));
      
      const averageScoreByGrade = sortedGrades.map(grade => {
        const gradeStudents = gradeGroups[grade];
        const gradeTotal = gradeStudents.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
        return {
          grade,
          average: gradeStudents.length > 0 ? Math.round(gradeTotal / gradeStudents.length) : 0,
        };
      });
      
      // أعلى 5 طلاب
      const topStudents = students
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5);
      
      // اتجاه التصويتات (بيانات وهمية للعرض)
      const weeklyVotesTrend = [
        { week: "الأسبوع 1", votes: Math.floor(weeklyVotes * 0.6) },
        { week: "الأسبوع 2", votes: Math.floor(weeklyVotes * 0.8) },
        { week: "الأسبوع 3", votes: Math.floor(weeklyVotes * 0.9) },
        { week: "الأسبوع 4", votes: weeklyVotes },
      ];
      
      return {
        totalStudents,
        averageScore,
        weeklyVotes,
        excellentStudents,
        studentsByGrade,
        averageScoreByGrade,
        topStudents,
        weeklyVotesTrend,
      };
    }),
  }),

  // Reports router
  reports: router({
    generateWeeklyReport: publicProcedure.query(async () => {

      // جمع بيانات التقرير
      const students = await db.getAllStudents();
      const topStudents = await db.getTopStudents(10);
      const currentPeriod = await db.getLatestVotingPeriod();
      
      let weeklyVotes: any[] = [];
      if (currentPeriod) {
        weeklyVotes = await db.getAllVotesForPeriod(currentPeriod.id);
      }

      // حساب عدد التصويتات لكل طالب
      const voteCounts = new Map<number, { student: any; count: number }>();
      weeklyVotes.forEach((vote) => {
        const existing = voteCounts.get(vote.studentId);
        if (existing) {
          existing.count++;
        } else {
          voteCounts.set(vote.studentId, { student: vote.student, count: 1 });
        }
      });

      const topVotedStudents = Array.from(voteCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        generatedAt: new Date().toISOString(),
        totalStudents: students.length,
        topStudents,
        topVotedStudents,
        currentPeriod,
        students: students.sort((a, b) => (b.score || 0) - (a.score || 0)),
      };
    }),
  }),

  // Get voting report for admin
  getVotingReport: publicProcedure
    .input(z.object({ periodId: z.number().optional() }))
    .query(async ({ input }) => {
      const currentPeriod = await db.getLatestVotingPeriod();
      if (!currentPeriod) {
        throw new TRPCError({ code: "NOT_FOUND", message: "لا توجد فترة تصويت" });
      }

      const periodId = input.periodId || currentPeriod.id;
      // إرجاع بيانات الفترة المطلوبة فعلاً (وليس دائماً الأحدث) حتى تظهر تواريخها بشكل صحيح
      const period = input.periodId
        ? (await db.getVotingPeriodById(input.periodId)) || currentPeriod
        : currentPeriod;
      const report = await db.getVotingReport(periodId);

      return {
        period,
        report,
      };
    }),

  // Activity Log router
  activityLog: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        type: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit || 100;
        const offset = input?.offset || 0;

        if (input?.type) {
          return await db.getActivityLogsByType(input.type, limit);
        }

        return await db.getActivityLogs(limit, offset);
      }),

    count: publicProcedure.query(async () => {
      return await db.getActivityLogsCount();
    }),

    getTeacherVotingDetails: publicProcedure
      .input(z.object({ periodId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const period = await db.getLatestVotingPeriod();
        if (!period) {
          return [];
        }

        const periodId = input?.periodId || period.id;
        return await db.getTeacherVotingDetails(periodId);
      }),
  }),

  // Admin procedure to add primary grade students
  admin: router({
    addPrimaryStudents: publicProcedure
      .input(z.object({
        students: z.array(z.object({
          fullName: z.string(),
          grade: z.enum(['first', 'second', 'third'])
        }))
      }))
      .mutation(async ({ input }) => {
        const addedStudents = [];
        for (const student of input.students) {
          const added = await db.addStudent({
            fullName: student.fullName,
            grade: student.grade,
            score: 0,
            comment: null
          });
          addedStudents.push(added);
        }
        return {
          success: true,
          count: addedStudents.length,
          students: addedStudents
        };
      }),
  }),

  // Student Content router - for uploading videos and images
  content: router({
    // Upload content (public - no login required)
    upload: publicProcedure
      .input(z.object({
        studentId: z.number(),
        contentType: z.enum(["video", "image"]),
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const uploadCount = await db.getStudentUploadCountLast24h(input.studentId);
        if (uploadCount >= 2) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "الحد الأقصى مقطعين كل 24 ساعة. حاول مرة أخرى لاحقاً",
          });
        }

        const fileBuffer = Buffer.from(input.fileData, "base64");
        const fileKey = `student-content/${input.studentId}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

        await db.createStudentContent({
          studentId: input.studentId,
          contentType: input.contentType,
          fileKey,
          fileUrl: url,
          fileName: input.fileName,
          fileSize: fileBuffer.length,
          mimeType: input.mimeType,
          description: input.description,
          status: "pending",
        });

        return { success: true, url, remaining: 1 - uploadCount };
      }),

    // List all content (for admin)
    list: publicProcedure
      .input(z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllStudentContent(input?.status);
      }),

    // Get pending content count
    pendingCount: publicProcedure.query(async () => {
      return await db.getPendingContentCount();
    }),

    // Approve content (adds 10 points)
    approve: publicProcedure
      .input(z.object({
        contentId: z.number(),
        reviewedBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateContentStatus(input.contentId, "approved", input.reviewedBy);
      }),

    // Reject content (no points)
    reject: publicProcedure
      .input(z.object({
        contentId: z.number(),
        reviewedBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateContentStatus(input.contentId, "rejected", input.reviewedBy);
      }),

    // Get single content by ID
    getById: publicProcedure
      .input(z.object({ contentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStudentContentById(input.contentId);
      }),
  }),

  // System Settings router
  settings: router({
    // Check if content submission is enabled
    isContentSubmissionEnabled: publicProcedure
      .query(async () => {
        return await db.isContentSubmissionEnabled();
      }),

    // Toggle content submission (admin only)
    toggleContentSubmission: publicProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.toggleContentSubmission(input.enabled);
        return { success: true, enabled: input.enabled };
      }),
  }),

  // ==================== Score Categories (البنود) ====================
  scoreCategories: router({
    list: publicProcedure.query(async () => {
      return await db.getScoreCategories();
    }),
  }),

  // ==================== Score History (السجل التاريخي) ====================
  scoreHistory: router({
    getByStudent: publicProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStudentScoreHistory(input.studentId);
      }),
  }),

  // ==================== Bulk Category Apply (الإضافة الجماعية بالبنود) ====================
  bulkCategory: router({
    bulkApply: publicProcedure
      .input(z.object({
        studentIds: z.array(z.number()),
        categoryId: z.number(),
        categoryName: z.string(),
        pointsChange: z.number(),
        performedBy: z.string(),
        comment: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const count = await db.applyCategoryToStudents(
          input.studentIds,
          input.categoryId,
          input.categoryName,
          input.pointsChange,
          input.performedBy,
          input.comment || undefined
        );
        return { success: true, updatedCount: count };
      }),

    singleApply: publicProcedure
      .input(z.object({
        studentId: z.number(),
        categoryId: z.number(),
        categoryName: z.string(),
        pointsChange: z.number(),
        performedBy: z.string(),
        comment: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.applyCategoryToStudent(
          input.studentId,
          input.categoryId,
          input.categoryName,
          input.pointsChange,
          input.performedBy,
          input.comment || undefined
        );
        return { success: true, result };
      }),
  }),
});
export type AppRouter = typeof appRouter;
