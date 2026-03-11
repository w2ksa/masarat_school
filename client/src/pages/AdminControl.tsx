import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Vote, TrendingUp, Search, Plus, Minus, Check, X, ArrowRight, FileText, BarChart3, Trash2, History, Image, ToggleLeft, ToggleRight, Clock, CheckSquare, Square, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, useMemo, useCallback } from "react";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { StudentDetailsDialog } from "@/components/StudentDetailsDialog";
import { WeeklyStatsSection } from "@/components/WeeklyStatsSection";
import { ReportExport } from "@/components/ReportExport";
import { DailyReportButton } from "@/components/DailyReportButton";
import { StudentHistoryButton } from "@/components/StudentHistoryButton";
import type { Student } from "../../../drizzle/schema";

// ===================== Score History Dialog Component =====================
function ScoreHistoryDialog({ studentId, studentName, open, onOpenChange }: {
  studentId: number;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: history, isLoading } = trpc.scoreHistory.getByStudent.useQuery(
    { studentId },
    { enabled: open }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-purple-400" />
            سجل النقاط - {studentName}
          </DialogTitle>
          <DialogDescription>
            جميع التعديلات على نقاط الطالب مع التفاصيل
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-2 mt-2">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا يوجد سجل بعد</p>
            </div>
          ) : (
            history.map((entry: any) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border ${
                  entry.pointsChange > 0
                    ? "border-green-700/50 bg-green-900/20"
                    : entry.pointsChange < 0
                    ? "border-red-700/50 bg-red-900/20"
                    : "border-slate-700 bg-slate-800/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        entry.pointsChange > 0
                          ? "bg-green-800 text-green-200"
                          : entry.pointsChange < 0
                          ? "bg-red-800 text-red-200"
                          : ""
                      }`}
                    >
                      {entry.categoryName}
                    </Badge>
                    <span className={`font-bold text-sm ${
                      entry.pointsChange > 0 ? "text-green-400" : entry.pointsChange < 0 ? "text-red-400" : "text-slate-400"
                    }`}>
                      {entry.pointsChange > 0 ? "+" : ""}{entry.pointsChange}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {entry.previousScore} → {entry.newScore}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>بواسطة: {entry.performedBy}</span>
                  <span>{new Date(entry.createdAt).toLocaleDateString("ar-SA")} - {new Date(entry.createdAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {entry.comment && (
                  <p className="text-xs text-slate-300 mt-1 pr-2 border-r-2 border-slate-600">
                    {entry.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===================== Main AdminControl Component =====================
export default function AdminControl() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("__all__");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [scoreInput, setScoreInput] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<Student | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Teacher management states
  const [newTeacherName, setNewTeacherName] = useState("");
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");

  // Level details dialog state
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);

  // ===== Bulk Category States =====
  const [bulkGrade, setBulkGrade] = useState<string>("__all__");
  const [bulkSection, setBulkSection] = useState<string>("__all__");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [bulkSearchQuery, setBulkSearchQuery] = useState("");
  const [customPoints, setCustomPoints] = useState("");
  const [bulkComment, setBulkComment] = useState("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Score history dialog
  const [historyStudentId, setHistoryStudentId] = useState<number | null>(null);
  const [historyStudentName, setHistoryStudentName] = useState("");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  // Single student category dialog
  const [singleCategoryStudentId, setSingleCategoryStudentId] = useState<number | null>(null);
  const [singleCategoryStudentName, setSingleCategoryStudentName] = useState("");
  const [isSingleCategoryDialogOpen, setIsSingleCategoryDialogOpen] = useState(false);
  const [singleCustomPoints, setSingleCustomPoints] = useState("");
  const [singleComment, setSingleComment] = useState("");

  const utils = trpc.useUtils();

  // Check authentication
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

  // Data queries
  const { data: students, isLoading: studentsLoading } = trpc.students.list.useQuery({ grade: selectedGrade });
  const { data: topStudents } = trpc.students.topStudents.useQuery({ limit: 5, grade: selectedGrade });
  const { data: votingStatus } = trpc.voting.getCurrentPeriod.useQuery();
  const { data: levelStats } = trpc.students.getLevelStats.useQuery();
  const { data: teacherNames, isLoading: teachersLoading } = trpc.teachers.listNames.useQuery();
  const { data: categories } = trpc.scoreCategories.list.useQuery();
  
  // Bulk grade students query
  const { data: bulkStudents, isLoading: bulkStudentsLoading } = trpc.students.list.useQuery({
    grade: bulkGrade === "__all__" ? undefined : bulkGrade,
    section: bulkSection === "__all__" ? undefined : parseInt(bulkSection),
  });

  // Content submission settings
  const { data: isContentEnabled } = trpc.settings.isContentSubmissionEnabled.useQuery();
  const toggleContentMutation = trpc.settings.toggleContentSubmission.useMutation({
    onSuccess: (data) => {
      utils.settings.isContentSubmissionEnabled.invalidate();
      toast.success(data.enabled ? "تم تفعيل إرسال المحتوى" : "تم تعطيل إرسال المحتوى");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const updateScoreMutation = trpc.students.updateScore.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      utils.students.topStudents.invalidate();
      toast.success("تم تحديث النقاط بنجاح");
      setIsScoreDialogOpen(false);
      setSelectedStudent(null);
      setScoreInput("");
      setCommentInput("");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث النقاط");
    },
  });

  const openVotingMutation = trpc.voting.openVoting.useMutation({
    onSuccess: () => {
      utils.voting.getCurrentPeriod.invalidate();
      toast.success("تم فتح التصويت بنجاح");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء فتح التصويت");
    },
  });

  const closeVotingMutation = trpc.voting.closeVoting.useMutation({
    onSuccess: () => {
      utils.voting.getCurrentPeriod.invalidate();
      toast.success("تم إغلاق التصويت بنجاح");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إغلاق التصويت");
    },
  });

  // Bulk category mutation
  const bulkCategoryMutation = trpc.bulkCategory.bulkApply.useMutation({
    onSuccess: (data) => {
      utils.students.list.invalidate();
      utils.students.topStudents.invalidate();
      utils.students.getLevelStats.invalidate();
      toast.success(`تم تطبيق البند على ${data.updatedCount} طالب بنجاح`);
      setSelectedStudents([]);
      setCustomPoints("");
      setBulkComment("");
      setIsBulkProcessing(false);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تطبيق البند");
      setIsBulkProcessing(false);
    },
  });

  // Single category mutation
  const singleCategoryMutation = trpc.bulkCategory.singleApply.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      utils.students.topStudents.invalidate();
      utils.students.getLevelStats.invalidate();
      toast.success("تم تطبيق البند بنجاح");
      setIsSingleCategoryDialogOpen(false);
      setSingleCategoryStudentId(null);
      setSingleCustomPoints("");
      setSingleComment("");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  // @ts-ignore
  const addTeacherMutation = trpc.teachers.addTeacherName.useMutation({
    onSuccess: () => {
      utils.teachers.listNames.invalidate();
      toast.success("تم إضافة المعلم بنجاح");
      setNewTeacherName("");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة المعلم");
    },
  });

  // @ts-ignore
  const deleteTeacherMutation = trpc.teachers.deleteTeacherName.useMutation({
    onSuccess: () => {
      utils.teachers.listNames.invalidate();
      toast.success("تم حذف المعلم بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء حذف المعلم");
    },
  });

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    toast.success("تم تسجيل الخروج بنجاح");
    setLocation("/");
  };

  const handleUpdateScore = () => {
    if (!selectedStudent || !scoreInput) {
      toast.error("يرجى إدخال النقاط");
      return;
    }
    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 0) {
      toast.error("يرجى إدخال نقاط صحيحة (أكبر من أو يساوي 0)");
      return;
    }
    updateScoreMutation.mutate({
      studentId: selectedStudent,
      score,
      comment: commentInput.trim() || undefined,
    });
  };

  const handleAddTeacher = () => {
    if (!newTeacherName.trim()) {
      toast.error("يرجى إدخال اسم المعلم");
      return;
    }
    addTeacherMutation.mutate({ fullName: newTeacherName.trim() });
  };

  const handleDeleteTeacher = (teacherId: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المعلم؟")) {
      deleteTeacherMutation.mutate({ teacherId });
    }
  };

  const handleOpenVoting = () => {
    const now = new Date();
    const weekNumber = Math.ceil((now.getDate()) / 7);
    const year = now.getFullYear();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);
    openVotingMutation.mutate({ weekNumber, year, startDate: now, endDate });
  };

  const handleCloseVoting = () => {
    if (votingStatus?.id) {
      closeVotingMutation.mutate({ periodId: votingStatus.id });
    }
  };

  // ===== Bulk Category Handlers =====
  const filteredBulkStudents = useMemo(() => {
    if (!bulkStudents) return [];
    if (!bulkSearchQuery.trim()) return bulkStudents;
    return bulkStudents.filter(s => s.fullName.includes(bulkSearchQuery));
  }, [bulkStudents, bulkSearchQuery]);

  const handleSelectAll = useCallback(() => {
    if (!filteredBulkStudents) return;
    const allIds = filteredBulkStudents.map(s => s.id);
    setSelectedStudents(allIds);
  }, [filteredBulkStudents]);

  const handleDeselectAll = useCallback(() => {
    setSelectedStudents([]);
  }, []);

  const handleToggleStudent = useCallback((studentId: number) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      }
      return [...prev, studentId];
    });
  }, []);

  const handleApplyCategory = useCallback((category: any) => {
    if (selectedStudents.length === 0) {
      toast.error("يرجى اختيار طالب واحد على الأقل");
      return;
    }

    let points = category.points;
    if (category.isCustom === 1) {
      const parsed = parseInt(customPoints);
      if (isNaN(parsed) || parsed === 0) {
        toast.error("يرجى إدخال عدد النقاط للدرجة العامة");
        return;
      }
      points = parsed;
    }

    setIsBulkProcessing(true);
    bulkCategoryMutation.mutate({
      studentIds: selectedStudents,
      categoryId: category.id,
      categoryName: category.name,
      pointsChange: points,
      performedBy: "مدير النظام",
      comment: bulkComment.trim() || null,
    });
  }, [selectedStudents, customPoints, bulkComment, bulkCategoryMutation]);

  const handleApplySingleCategory = useCallback((category: any) => {
    if (!singleCategoryStudentId) return;

    let points = category.points;
    if (category.isCustom === 1) {
      const parsed = parseInt(singleCustomPoints);
      if (isNaN(parsed) || parsed === 0) {
        toast.error("يرجى إدخال عدد النقاط");
        return;
      }
      points = parsed;
    }

    singleCategoryMutation.mutate({
      studentId: singleCategoryStudentId,
      categoryId: category.id,
      categoryName: category.name,
      pointsChange: points,
      performedBy: "مدير النظام",
      comment: singleComment.trim() || null,
    });
  }, [singleCategoryStudentId, singleCustomPoints, singleComment, singleCategoryMutation]);

  // Filtered students for main tab
  const filteredStudents = students?.filter(student =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredTeachers = teacherNames?.filter(teacher =>
    teacher.fullName.toLowerCase().includes(teacherSearchQuery.toLowerCase())
  ) || [];

  const isVotingOpen = votingStatus?.status === "open";

  // Grade label helper
  const gradeLabel = (grade: string) => {
    const labels: Record<string, string> = {
      "أول": "الأول", "ثاني": "الثاني", "ثالث": "الثالث",
      "رابع": "الرابع", "خامس": "الخامس", "سادس": "السادس",
    };
    return labels[grade] || grade;
  };

  // Section label helper
  const sectionLabel = (section: number | null | undefined) => {
    if (!section) return "";
    const labels: Record<number, string> = { 1: "أ", 2: "ب", 3: "ج", 4: "د", 5: "هـ", 6: "و" };
    return labels[section] || section.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">لوحة التحكم الإدارية</h1>
                <p className="text-xs md:text-sm text-slate-300">مسارات - ابتدائية أبها الأهلية</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 w-full md:w-auto">
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-full md:w-[180px] bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">كل الصفوف</SelectItem>
                  <SelectItem value="أول">الصف الأول</SelectItem>
                  <SelectItem value="ثاني">الصف الثاني</SelectItem>
                  <SelectItem value="ثالث">الصف الثالث</SelectItem>
                  <SelectItem value="رابع">الصف الرابع</SelectItem>
                  <SelectItem value="خامس">الصف الخامس</SelectItem>
                  <SelectItem value="سادس">الصف السادس</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Button variant="ghost" onClick={() => setLocation("/admin/students")} className="text-purple-400 hover:text-purple-300 flex-1 md:flex-none text-sm">
                  <Users className="w-4 h-4 ml-2" />
                  إدارة الطلاب
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/admin/activity-log")} className="text-amber-400 hover:text-amber-300 flex-1 md:flex-none text-sm">
                  <History className="w-4 h-4 ml-2" />
                  سجل التعديلات
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/admin/content")} className={`${isContentEnabled ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'} flex-1 md:flex-none text-sm`}>
                  <Image className="w-4 h-4 ml-2" />
                  إدارة المحتوى
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toggleContentMutation.mutate({ enabled: !isContentEnabled })}
                  className={`${isContentEnabled ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'} flex-1 md:flex-none text-sm`}
                  disabled={toggleContentMutation.isPending}
                >
                  {isContentEnabled ? (
                    <><ToggleRight className="w-4 h-4 ml-2" /> المحتوى: مفعل</>
                  ) : (
                    <><ToggleLeft className="w-4 h-4 ml-2" /> المحتوى: معطل</>
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/")} className="text-slate-300 flex-1 md:flex-none text-sm">
                  <ArrowRight className="w-4 h-4 ml-2" />
                  الرئيسية
                </Button>
                <Button variant="outline" onClick={handleLogout} className="flex-1 md:flex-none text-sm">
                  تسجيل الخروج
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bulk-category" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-1">
            <TabsTrigger value="bulk-category" className="text-xs md:text-sm bg-purple-600/20">
              <Zap className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              <span className="hidden sm:inline">إضافة بالبنود</span>
              <span className="sm:hidden">بنود</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="text-xs md:text-sm">
              <Users className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              <span className="hidden sm:inline">الطلاب</span>
              <span className="sm:hidden">طلاب</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="text-xs md:text-sm">
              <Users className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              <span className="hidden sm:inline">المعلمين</span>
              <span className="sm:hidden">معلمين</span>
            </TabsTrigger>
            <TabsTrigger value="voting" className="text-xs md:text-sm">
              <Vote className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              التصويت
            </TabsTrigger>
            <TabsTrigger value="weekly-stats" className="text-xs md:text-sm">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              <span className="hidden sm:inline">الأسبوع</span>
              <span className="sm:hidden">أسبوع</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs md:text-sm">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              المتصدرون
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm">
              <FileText className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
              التقارير
            </TabsTrigger>
          </TabsList>

          {/* ==================== BULK CATEGORY TAB ==================== */}
          <TabsContent value="bulk-category" className="space-y-4">
            <Card className="border-purple-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-purple-400" />
                  إضافة النقاط بالبنود
                </CardTitle>
                <CardDescription>
                  اختر الصف → حدد الطلاب → اختر البند → تطبيق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Step 1: Grade & Section Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-slate-400 mb-1 block">الصف</Label>
                    <Select value={bulkGrade} onValueChange={(v) => { setBulkGrade(v); setSelectedStudents([]); }}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">كل الصفوف</SelectItem>
                        <SelectItem value="أول">الأول</SelectItem>
                        <SelectItem value="ثاني">الثاني</SelectItem>
                        <SelectItem value="ثالث">الثالث</SelectItem>
                        <SelectItem value="رابع">الرابع</SelectItem>
                        <SelectItem value="خامس">الخامس</SelectItem>
                        <SelectItem value="سادس">السادس</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-slate-400 mb-1 block">الفصل</Label>
                    <Select value={bulkSection} onValueChange={(v) => { setBulkSection(v); setSelectedStudents([]); }}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">كل الفصول</SelectItem>
                        <SelectItem value="1">فصل أ</SelectItem>
                        <SelectItem value="2">فصل ب</SelectItem>
                        <SelectItem value="3">فصل ج</SelectItem>
                        <SelectItem value="4">فصل د</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-slate-400 mb-1 block">بحث</Label>
                    <div className="relative">
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="ابحث عن طالب..."
                        value={bulkSearchQuery}
                        onChange={(e) => setBulkSearchQuery(e.target.value)}
                        className="pr-10 bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Select All / Deselect All */}
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={handleSelectAll}
                      className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
                    >
                      <CheckSquare className="w-3 h-3 ml-1" />
                      تحديد الكل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeselectAll}
                      className="text-xs h-8"
                    >
                      <Square className="w-3 h-3 ml-1" />
                      إلغاء التحديد
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {selectedStudents.length} محدد
                    </Badge>
                    <span className="text-xs text-slate-400">
                      من {filteredBulkStudents.length}
                    </span>
                  </div>
                </div>

                {/* Step 3: Student List */}
                <div className="max-h-[300px] overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/30">
                  {bulkStudentsLoading ? (
                    <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
                  ) : filteredBulkStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">لا يوجد طلاب</div>
                  ) : (
                    <div className="divide-y divide-slate-700/50">
                      {filteredBulkStudents.map((student) => {
                        const isSelected = selectedStudents.includes(student.id);
                        return (
                          <div
                            key={student.id}
                            onClick={() => handleToggleStudent(student.id)}
                            className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-900/40 hover:bg-blue-900/50"
                                : "hover:bg-slate-700/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-slate-500 bg-transparent"
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-white text-sm">{student.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">
                                {gradeLabel(student.grade)} {student.section ? sectionLabel(student.section) : ""}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {student.score}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step 4: Category Buttons */}
                <div className="space-y-3">
                  <Label className="text-sm text-slate-300 font-semibold">اختر البند:</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {categories?.map((cat: any) => (
                      <Button
                        key={cat.id}
                        onClick={() => handleApplyCategory(cat)}
                        disabled={isBulkProcessing || selectedStudents.length === 0}
                        className={`h-auto py-3 px-2 flex flex-col items-center gap-1 text-sm font-bold transition-all ${
                          cat.points > 0
                            ? "bg-green-700 hover:bg-green-600 text-white border-green-600"
                            : cat.points < 0
                            ? "bg-red-700 hover:bg-red-600 text-white border-red-600"
                            : "bg-purple-700 hover:bg-purple-600 text-white border-purple-600"
                        } ${selectedStudents.length === 0 ? "opacity-50" : ""}`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs opacity-80">
                          {cat.isCustom === 1 ? "حسب الإدخال" : (cat.points > 0 ? `+${cat.points}` : cat.points)}
                        </span>
                      </Button>
                    ))}
                  </div>

                  {/* Custom points input for درجة عامة */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-400 mb-1 block">نقاط الدرجة العامة (اختياري)</Label>
                      <Input
                        type="number"
                        value={customPoints}
                        onChange={(e) => setCustomPoints(e.target.value)}
                        placeholder="مثلاً: 5 أو -3"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-slate-400 mb-1 block">تعليق (اختياري)</Label>
                      <Input
                        value={bulkComment}
                        onChange={(e) => setBulkComment(e.target.value)}
                        placeholder="سبب إضافي..."
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Processing indicator */}
                {isBulkProcessing && (
                  <div className="text-center py-3 text-purple-400 animate-pulse">
                    جاري تطبيق البند على {selectedStudents.length} طالب...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== STUDENTS TAB ==================== */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>إدارة نقاط الطلاب</CardTitle>
                    <CardDescription>اضغط على اسم الطالب لعرض التفاصيل، أو استخدم أزرار البنود</CardDescription>
                  </div>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="ابحث عن طالب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
                ) : (
                  <div className="grid gap-2 max-h-[600px] overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-slate-600 transition-all gap-2"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer hover:text-blue-400 transition-colors flex-1"
                          onClick={() => {
                            setSelectedStudentDetails(student);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <span className="text-white font-medium text-sm">{student.fullName}</span>
                          <span className="text-xs text-slate-500">
                            {gradeLabel(student.grade)} {student.section ? sectionLabel(student.section) : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-sm px-3 py-0.5">
                            {student.score} نقطة
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-purple-400 border-purple-600 hover:bg-purple-900/30"
                            onClick={() => {
                              setSingleCategoryStudentId(student.id);
                              setSingleCategoryStudentName(student.fullName);
                              setIsSingleCategoryDialogOpen(true);
                            }}
                          >
                            <Zap className="w-3 h-3 ml-1" />
                            بند
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-amber-400 border-amber-600 hover:bg-amber-900/30"
                            onClick={() => {
                              setHistoryStudentId(student.id);
                              setHistoryStudentName(student.fullName);
                              setIsHistoryDialogOpen(true);
                            }}
                          >
                            <History className="w-3 h-3 ml-1" />
                            سجل
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedStudent(student.id);
                              setScoreInput(student.score.toString());
                              setCommentInput(student.comment || "");
                              setIsScoreDialogOpen(true);
                            }}
                          >
                            تعديل يدوي
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== TEACHERS TAB ==================== */}
          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المعلمين</CardTitle>
                <CardDescription>عدد المعلمين: {teacherNames?.length || 0}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-6 rounded-lg bg-slate-800/50 border-2 border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">إضافة معلم جديد</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="أدخل اسم المعلم الكامل..."
                          value={newTeacherName}
                          onChange={(e) => setNewTeacherName(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddTeacher} disabled={addTeacherMutation.isPending} className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 ml-2" />
                          {addTeacherMutation.isPending ? "جاري..." : "إضافة"}
                        </Button>
                        <Button variant="outline" onClick={() => setNewTeacherName("")}>
                          <X className="w-4 h-4 ml-2" />
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-slate-800/50 border-2 border-slate-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <h3 className="text-lg font-semibold text-white">قائمة المعلمين ({teacherNames?.length || 0})</h3>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="ابحث عن معلم..."
                          value={teacherSearchQuery}
                          onChange={(e) => setTeacherSearchQuery(e.target.value)}
                          className="pr-10 bg-slate-700 border-slate-600"
                        />
                      </div>
                    </div>
                    {teachersLoading ? (
                      <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
                    ) : filteredTeachers.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        {teacherSearchQuery ? "لا توجد نتائج" : "لا يوجد معلمين"}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {filteredTeachers.map((teacher, index) => (
                          <div key={teacher.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 text-sm w-8">{index + 1}.</span>
                              <p className="text-white font-medium">{teacher.fullName}</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteTeacher(teacher.id)} disabled={deleteTeacherMutation.isPending}>
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== VOTING TAB ==================== */}
          <TabsContent value="voting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة التصويت الأسبوعي</CardTitle>
                <CardDescription>تحكم في فتح وإغلاق التصويت للمعلمين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-6 rounded-lg bg-slate-800/50 border-2 border-slate-700">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">حالة التصويت</h3>
                    <Badge variant={isVotingOpen ? "default" : "secondary"} className="text-base">
                      {isVotingOpen ? "مفتوح" : "مغلق"}
                    </Badge>
                    {votingStatus && isVotingOpen && (
                      <p className="text-sm text-slate-400 mt-2">
                        ينتهي في: {new Date(votingStatus.endDate).toLocaleDateString("ar-SA")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isVotingOpen ? (
                      <Button variant="destructive" onClick={handleCloseVoting} disabled={closeVotingMutation.isPending}>
                        <X className="w-4 h-4 ml-2" />
                        إغلاق التصويت
                      </Button>
                    ) : (
                      <Button onClick={handleOpenVoting} disabled={openVotingMutation.isPending}>
                        <Check className="w-4 h-4 ml-2" />
                        فتح تصويت جديد
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700">
                  <h4 className="font-semibold text-white mb-2">ملاحظة:</h4>
                  <p className="text-sm text-slate-300">
                    عند فتح التصويت، سيتمكن المعلمون من اختيار 3 طلاب لمدة أسبوع.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Stats Tab */}
          <TabsContent value="weekly-stats" className="space-y-6">
            <WeeklyStatsSection />
          </TabsContent>

          {/* ==================== LEADERBOARD TAB ==================== */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                  إحصائيات المستويات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => { setSelectedLevel('qudwa'); setIsLevelDialogOpen(true); }}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">👑</div>
                      <div className="text-2xl font-bold mb-1">{levelStats?.qudwa?.count || 0}</div>
                      <div className="text-sm font-semibold">قُدوة</div>
                      <div className="text-xs opacity-90 mt-1">500+ نقطة</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => { setSelectedLevel('mutamayiz'); setIsLevelDialogOpen(true); }}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">⭐</div>
                      <div className="text-2xl font-bold mb-1">{levelStats?.mutamayiz?.count || 0}</div>
                      <div className="text-sm font-semibold">مُتميز</div>
                      <div className="text-xs opacity-90 mt-1">400-499 نقطة</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => { setSelectedLevel('mundabit'); setIsLevelDialogOpen(true); }}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">⚡</div>
                      <div className="text-2xl font-bold mb-1">{levelStats?.mundabit?.count || 0}</div>
                      <div className="text-sm font-semibold">مُنضبط</div>
                      <div className="text-xs opacity-90 mt-1">300-399 نقطة</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => { setSelectedLevel('mujtahid'); setIsLevelDialogOpen(true); }}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">📚</div>
                      <div className="text-2xl font-bold mb-1">{levelStats?.mujtahid?.count || 0}</div>
                      <div className="text-sm font-semibold">مُجتهد</div>
                      <div className="text-xs opacity-90 mt-1">200-299 نقطة</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => { setSelectedLevel('qadir'); setIsLevelDialogOpen(true); }}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">🌱</div>
                      <div className="text-2xl font-bold mb-1">{levelStats?.qadir?.count || 0}</div>
                      <div className="text-sm font-semibold">مُبادر</div>
                      <div className="text-xs opacity-90 mt-1">100-199 نقطة</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أعلى 10 طلاب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topStudents?.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? "bg-yellow-500 text-black"
                            : index === 1 ? "bg-gray-400 text-black"
                            : index === 2 ? "bg-amber-700 text-white"
                            : "bg-slate-700 text-white"
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-white font-medium text-lg">{student.fullName}</span>
                      </div>
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {student.score} نقطة
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== REPORTS TAB ==================== */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التقارير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setLocation("/admin/voting-report")} className="w-full" variant="outline">
                  <Vote className="w-4 h-4 ml-2" />
                  تقرير التصويت
                </Button>
                <ReportExport />
                <DailyReportButton />
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-3">سجل الطالب التفصيلي</h3>
                  <StudentHistoryButton />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ==================== DIALOGS ==================== */}

      {/* Score Update Dialog (manual) */}
      <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل نقاط الطالب يدوياً</DialogTitle>
            <DialogDescription>
              {selectedStudent && students?.find(s => s.id === selectedStudent)?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="score">النقاط الجديدة</Label>
              <Input id="score" type="number" min="0" value={scoreInput} onChange={(e) => setScoreInput(e.target.value)} placeholder="أدخل النقاط" />
            </div>
            <div>
              <Label htmlFor="comment">تعليق (اختياري)</Label>
              <Input id="comment" type="text" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateScore} disabled={updateScoreMutation.isPending} className="flex-1">
                {updateScoreMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button variant="outline" onClick={() => setIsScoreDialogOpen(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <StudentDetailsDialog student={selectedStudentDetails} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} />

      {/* Score History Dialog */}
      {historyStudentId && (
        <ScoreHistoryDialog
          studentId={historyStudentId}
          studentName={historyStudentName}
          open={isHistoryDialogOpen}
          onOpenChange={(open) => {
            setIsHistoryDialogOpen(open);
            if (!open) setHistoryStudentId(null);
          }}
        />
      )}

      {/* Single Student Category Dialog */}
      <Dialog open={isSingleCategoryDialogOpen} onOpenChange={setIsSingleCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              إضافة بند - {singleCategoryStudentName}
            </DialogTitle>
            <DialogDescription>اختر البند المناسب</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-2">
              {categories?.map((cat: any) => (
                <Button
                  key={cat.id}
                  onClick={() => handleApplySingleCategory(cat)}
                  disabled={singleCategoryMutation.isPending}
                  className={`h-auto py-3 flex flex-col items-center gap-1 text-sm font-bold ${
                    cat.points > 0
                      ? "bg-green-700 hover:bg-green-600 text-white"
                      : cat.points < 0
                      ? "bg-red-700 hover:bg-red-600 text-white"
                      : "bg-purple-700 hover:bg-purple-600 text-white"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-80">
                    {cat.isCustom === 1 ? "حسب الإدخال" : (cat.points > 0 ? `+${cat.points}` : cat.points)}
                  </span>
                </Button>
              ))}
            </div>
            <div>
              <Label className="text-xs text-slate-400">نقاط الدرجة العامة</Label>
              <Input
                type="number"
                value={singleCustomPoints}
                onChange={(e) => setSingleCustomPoints(e.target.value)}
                placeholder="مثلاً: 5 أو -3"
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">تعليق (اختياري)</Label>
              <Input
                value={singleComment}
                onChange={(e) => setSingleComment(e.target.value)}
                placeholder="سبب إضافي..."
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Level Students Dialog */}
      <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLevel === 'qudwa' && <>👑 طلاب مستوى قُدوة (500+ نقطة)</>}
              {selectedLevel === 'mutamayiz' && <>⭐ طلاب مستوى مُتميز (400-499 نقطة)</>}
              {selectedLevel === 'mundabit' && <>⚡ طلاب مستوى مُنضبط (300-399 نقطة)</>}
              {selectedLevel === 'mujtahid' && <>📚 طلاب مستوى مُجتهد (200-299 نقطة)</>}
              {selectedLevel === 'qadir' && <>🌱 طلاب مستوى مُبادر (100-199 نقطة)</>}
              {selectedLevel === 'mubtadi' && <>📖 طلاب مستوى مبتدئ (0-99 نقطة)</>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {selectedLevel && levelStats && (levelStats as any)[selectedLevel]?.students?.length > 0 ? (
              (levelStats as any)[selectedLevel].students.map((student: any, index: number) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{student.fullName}</p>
                      <p className="text-xs text-slate-500">الصف {student.grade} {student.section ? `- الفصل ${student.section}` : ''}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {student.score} نقطة
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>لا يوجد طلاب في هذا المستوى</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
