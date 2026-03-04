import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Search, Vote, AlertCircle, ArrowRight, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function TeacherVoting() {
  const [, setLocation] = useLocation();
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("__all__");

  // Check authentication - check localStorage first, then sessionStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    const isAuth = localStorage.getItem("isAuthenticated") || sessionStorage.getItem("isAuthenticated");
    
    if (role !== "teacher" || isAuth !== "true") {
      toast.error("يجب تسجيل الدخول كمعلم");
      setLocation("/login");
    } else {
      sessionStorage.setItem("userRole", role);
      sessionStorage.setItem("isAuthenticated", isAuth);
    }
  }, [setLocation]);

  const { data: students, isLoading: studentsLoading } = trpc.students.list.useQuery({ 
    grade: selectedGrade === "__all__" ? undefined : selectedGrade 
  });
  const { data: votingStatus } = trpc.voting.getCurrentPeriod.useQuery();
  const utils = trpc.useUtils();

  const submitVotesMutation = trpc.voting.submitVotes.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال التصويت بنجاح! تمت إضافة 10 نقاط لكل طالب");
      setSelectedStudents([]);
      // Invalidate queries to refresh data
      utils.students.list.invalidate();
      utils.voting.getCurrentPeriod.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إرسال التصويت");
    },
  });

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("تم تسجيل الخروج بنجاح");
    setLocation("/");
  };

  const toggleStudentSelection = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      if (selectedStudents.length >= 3) {
        toast.error("يمكنك اختيار 3 طلاب فقط");
        return;
      }
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSubmitVotes = () => {
    if (selectedStudents.length !== 3) {
      toast.error("يجب اختيار 3 طلاب بالضبط");
      return;
    }

    const teacherName = localStorage.getItem('teacherName') || sessionStorage.getItem('teacherName');
    if (!teacherName) {
      toast.error("الرجاء تسجيل الدخول أولاً");
      return;
    }

    submitVotesMutation.mutate({
      studentIds: selectedStudents,
      teacherName,
    });
  };

  const filteredStudents = students?.filter(student =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isVotingOpen = votingStatus?.status === "open";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Vote className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">لوحة المعلمين</h1>
                <p className="text-xs sm:text-sm text-slate-300">مسارات - ابتدائية أبها الأهلية</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-full sm:w-[160px] bg-slate-700 border-slate-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">جميع الصفوف</SelectItem>
                  <SelectItem value="أول">الأول</SelectItem>
                  <SelectItem value="ثاني">الثاني</SelectItem>
                  <SelectItem value="ثالث">الثالث</SelectItem>
                  <SelectItem value="رابع">الرابع</SelectItem>
                  <SelectItem value="خامس">الخامس</SelectItem>
                  <SelectItem value="سادس">السادس</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={() => setLocation("/")} className="text-slate-300 text-sm flex-1 sm:flex-none">
                <ArrowRight className="w-4 h-4 ml-1" />
                <span className="hidden sm:inline">العودة للرئيسية</span>
                <span className="sm:hidden">الرئيسية</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="text-sm">
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Voting Status Alert */}
        <Alert className={`mb-6 ${isVotingOpen ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-white">
            {isVotingOpen ? (
              <div className="flex items-center justify-between">
                <span>✅ التصويت مفتوح حالياً - يمكنك اختيار 3 طلاب</span>
                {votingStatus?.endDate && (
                  <span className="text-sm">
                    ينتهي في: {new Date(votingStatus.endDate).toLocaleDateString("ar-SA")}
                  </span>
                )}
              </div>
            ) : (
              "❌ التصويت مغلق حالياً - انتظر موافقة الإدارة لفتح التصويت القادم"
            )}
          </AlertDescription>
        </Alert>

        {/* Selection Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>الطلاب المختارون</span>
              <Badge variant={selectedStudents.length === 3 ? "default" : "secondary"}>
                {selectedStudents.length} / 3
              </Badge>
            </CardTitle>
            <CardDescription>
              {selectedStudents.length === 0 && "لم يتم اختيار أي طالب بعد"}
              {selectedStudents.length > 0 && selectedStudents.length < 3 && `تحتاج إلى اختيار ${3 - selectedStudents.length} طالب آخر`}
              {selectedStudents.length === 3 && "تم اختيار 3 طلاب - يمكنك إرسال التصويت الآن"}
            </CardDescription>
          </CardHeader>
          {selectedStudents.length > 0 && (
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedStudents.map((id, index) => {
                  const student = students?.find(s => s.id === id);
                  return (
                    <Badge key={id} variant="outline" className="text-base py-2 px-4">
                      {index + 1}. {student?.fullName}
                    </Badge>
                  );
                })}
              </div>
              {selectedStudents.length === 3 && isVotingOpen && (
                <Button
                  className="w-full mt-4"
                  onClick={handleSubmitVotes}
                >
                  إرسال التصويت
                </Button>
              )}
            </CardContent>
          )}
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلاب {selectedGrade !== "__all__" ? `- الصف ${selectedGrade}` : "- جميع الصفوف"}</CardTitle>
            <CardDescription>اختر 3 طلاب من أي فصل للتصويت الأسبوعي - إجمالي: {filteredStudents.length} طالب</CardDescription>
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
                {filteredStudents.map((student) => {
                  const isSelected = selectedStudents.includes(student.id);
                  return (
                    <button
                      key={student.id}
                      onClick={() => isVotingOpen && toggleStudentSelection(student.id)}
                      disabled={!isVotingOpen}
                      className={`
                        w-full p-4 rounded-lg border-2 text-right transition-all
                        ${isSelected 
                          ? "border-green-500 bg-green-500/10" 
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }
                        ${!isVotingOpen && "opacity-50 cursor-not-allowed"}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-600" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{student.fullName}</span>
                            <span className="text-xs text-slate-400">الصف {student.grade} - فصل {student.section}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-sm">النقاط:</span>
                          <Badge variant="secondary">{student.score}</Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
