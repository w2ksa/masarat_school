import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DbStatusBanner } from "@/components/DbStatusBanner";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VotingReport() {
  const [, setLocation] = useLocation();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("__current__");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    const isAuth = localStorage.getItem("isAuthenticated") || sessionStorage.getItem("isAuthenticated");
    if (role !== "admin" || isAuth !== "true") {
      toast.error("يجب تسجيل الدخول كمدير نظام");
      setLocation("/login");
    }
  }, [setLocation]);

  // قائمة جميع فترات التصويت السابقة (لاسترجاع البيانات القديمة)
  const { data: periods } = trpc.voting.listPeriods.useQuery(undefined, {
    refetchInterval: 15000,
  });

  // تحديث مباشر: تظهر أصوات المعلمين في التقرير خلال ثوانٍ دون إعادة تحميل
  const { data, isLoading } = trpc.getVotingReport.useQuery(
    selectedPeriodId === "__current__" ? {} : { periodId: parseInt(selectedPeriodId) },
    {
      staleTime: 5000,
      refetchOnWindowFocus: true,
      refetchInterval: 10000,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-8">
        <div className="container mx-auto">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">جاري تحميل التقرير...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-8">
        <div className="container mx-auto">
          <div className="text-center text-white">
            <p>لا توجد بيانات متاحة</p>
            <Button variant="outline" onClick={() => setLocation("/admin")} className="mt-4">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { report, period } = data;
  const votedCount = report.filter((r: any) => r.hasVoted).length;
  const totalCount = report.length;
  const percentage = totalCount > 0 ? Math.round((votedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <DbStatusBanner />
      <div className="container mx-auto p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">تقرير التصويت</h1>
            <p className="text-sm sm:text-base text-blue-200">
              الفترة: {new Date(period.startDate).toLocaleDateString('ar-SA')} - {new Date(period.endDate).toLocaleDateString('ar-SA')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* اختيار فترة التصويت — لعرض بيانات الأسابيع السابقة */}
            <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
              <SelectTrigger className="w-full sm:w-[260px] bg-white/10 border-white/20 text-white text-sm">
                <SelectValue placeholder="اختر فترة التصويت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__current__">الفترة الحالية</SelectItem>
                {periods?.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {`أسبوع ${p.weekNumber}/${p.year} — ${new Date(p.startDate).toLocaleDateString("ar-SA")} (${p.voteCount} صوت)${p.status === "open" ? " • مفتوح" : ""}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setLocation("/admin")} className="text-sm">
              <ArrowRight className="w-4 h-4 ml-1" />
              العودة
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-3 sm:p-6">
            <div className="text-center">
              <div className="text-2xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">{percentage}%</div>
              <div className="text-xs sm:text-base text-blue-200">نسبة المشاركة</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-3 sm:p-6">
            <div className="text-center">
              <div className="text-2xl sm:text-5xl font-bold text-green-400 mb-1 sm:mb-2">{votedCount}</div>
              <div className="text-xs sm:text-base text-blue-200">صوّتوا</div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-3 sm:p-6">
            <div className="text-center">
              <div className="text-2xl sm:text-5xl font-bold text-red-400 mb-1 sm:mb-2">{totalCount - votedCount}</div>
              <div className="text-xs sm:text-base text-blue-200">لم يصوّتوا</div>
            </div>
          </Card>
        </div>

        {/* Teachers List */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">قائمة المعلمين</h2>
          <div className="space-y-3 sm:space-y-4">
            {report.map((teacher: any) => (
              <div
                key={teacher.teacherId}
                className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {teacher.hasVoted ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-lg font-semibold text-white truncate">{teacher.teacherName}</h3>
                    {teacher.hasVoted ? (
                      <div className="mt-1">
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-200 mb-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>
                            {teacher.votedAt
                              ? new Date(teacher.votedAt).toLocaleString('ar-SA', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : 'غير متوفر'}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-white">
                          <span className="text-blue-300 font-medium">صوّت لـ: </span>
                          {teacher.votedStudents.join(' • ')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-red-300 mt-1">لم يصوّت بعد</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
