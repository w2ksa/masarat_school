import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, History, Vote, Plus, Minus, User, Clock, Monitor, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ActivityLog() {
  const [, setLocation] = useLocation();
  const [filterType, setFilterType] = useState<string>("all");

  // Check authentication - check localStorage first, then sessionStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    const isAuth = localStorage.getItem("isAuthenticated") || sessionStorage.getItem("isAuthenticated");
    
    if (role !== "admin" || isAuth !== "true") {
      toast.error("يجب تسجيل الدخول كمدير نظام");
      setLocation("/login");
    } else {
      sessionStorage.setItem("userRole", role);
      sessionStorage.setItem("isAuthenticated", isAuth);
    }
  }, [setLocation]);

  const { data: activities, isLoading, refetch } = trpc.activityLog.list.useQuery({
    limit: 200,
    type: filterType === "all" ? undefined : filterType,
  });

  const { data: teacherVotingDetails } = trpc.activityLog.getTeacherVotingDetails.useQuery({});

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "vote":
        return <Vote className="w-5 h-5 text-blue-400" />;
      case "add_score":
        return <Plus className="w-5 h-5 text-green-400" />;
      case "deduct_score":
        return <Minus className="w-5 h-5 text-red-400" />;
      default:
        return <History className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "vote":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">تصويت</Badge>;
      case "add_score":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">إضافة نقاط</Badge>;
      case "deduct_score":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">خصم نقاط</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">نشاط</Badge>;
    }
  };

  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent || userAgent === "غير معروف") return "غير معروف";
    
    // Simple parsing for common browsers
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      return "📱 iOS";
    } else if (userAgent.includes("Android")) {
      return "📱 Android";
    } else if (userAgent.includes("Windows")) {
      return "💻 Windows";
    } else if (userAgent.includes("Mac")) {
      return "💻 Mac";
    } else if (userAgent.includes("Linux")) {
      return "💻 Linux";
    }
    return "🖥️ جهاز آخر";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white" dir="rtl">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin")}
              className="text-slate-400 hover:text-white text-sm"
            >
              <ArrowRight className="w-4 h-4 ml-1" />
              <span className="hidden sm:inline">العودة للوحة التحكم</span>
              <span className="sm:hidden">رجوع</span>
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <History className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <h1 className="text-base sm:text-xl font-bold">سجل التعديلات</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-white text-sm sm:text-base">تصفية السجل</CardTitle>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-48 bg-slate-700/50 border-slate-600 text-white text-sm">
                    <SelectValue placeholder="جميع الأنشطة" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">جميع الأنشطة</SelectItem>
                    <SelectItem value="vote">التصويتات فقط</SelectItem>
                    <SelectItem value="add_score">إضافة نقاط فقط</SelectItem>
                    <SelectItem value="deduct_score">خصم نقاط فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Teacher Voting Details */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Vote className="w-5 h-5 text-blue-400" />
              تفاصيل تصويتات المعلمين
            </CardTitle>
            <CardDescription className="text-slate-400">
              عرض كل معلم ومن صوت له في الفترة الحالية
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teacherVotingDetails && teacherVotingDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacherVotingDetails.map((teacher: any) => (
                  <div
                    key={teacher.teacherId}
                    className={`p-4 rounded-lg border ${
                      teacher.hasVoted
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-slate-700/30 border-slate-600/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{teacher.teacherName}</span>
                      {teacher.hasVoted ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">صوّت</Badge>
                      ) : (
                        <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">لم يصوت</Badge>
                      )}
                    </div>
                    {teacher.hasVoted && (
                      <>
                        <div className="text-sm text-slate-400 mb-2">
                          <Clock className="w-3 h-3 inline ml-1" />
                          {teacher.votedAt ? formatDate(teacher.votedAt) : ""}
                        </div>
                        <div className="space-y-1">
                          {teacher.votedStudents.map((student: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                                {student.rank}
                              </span>
                              <span className="text-slate-300">{student.name}</span>
                              <span className="text-slate-500 text-xs">({student.grade})</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">لا توجد بيانات تصويت حالياً</p>
            )}
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              سجل جميع التعديلات
            </CardTitle>
            <CardDescription className="text-slate-400">
              عرض جميع التصويتات والتعديلات على النقاط مع تفاصيل الجهاز والوقت
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getActivityIcon(activity.activityType)}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getActivityBadge(activity.activityType)}
                            <span className="text-white font-medium">{activity.studentName}</span>
                          </div>
                          <div className="text-sm text-slate-400">
                            <User className="w-3 h-3 inline ml-1" />
                            بواسطة: <span className="text-slate-300">{activity.performedBy}</span>
                          </div>
                          {activity.pointsChange !== null && (
                            <div className="text-sm mt-1">
                              <span className={activity.activityType === "deduct_score" ? "text-red-400" : "text-green-400"}>
                                {activity.activityType === "deduct_score" ? "-" : "+"}
                                {activity.pointsChange} نقطة
                              </span>
                              <span className="text-slate-500 mx-2">|</span>
                              <span className="text-slate-400">
                                {activity.previousScore} → {activity.newScore}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-slate-500 mb-1">
                          <Clock className="w-3 h-3 inline ml-1" />
                          {formatDate(activity.createdAt)}
                        </div>
                        <div className="text-xs text-slate-500">
                          <Monitor className="w-3 h-3 inline ml-1" />
                          {parseUserAgent(activity.userAgent)}
                        </div>
                        {activity.ipAddress && activity.ipAddress !== "غير معروف" && (
                          <div className="text-xs text-slate-600 mt-1">
                            IP: {activity.ipAddress.split(",")[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد أنشطة مسجلة حتى الآن</p>
                <p className="text-sm mt-2">ستظهر هنا جميع التصويتات والتعديلات على النقاط</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
