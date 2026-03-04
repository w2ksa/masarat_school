import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Search, Users, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function TeacherSelect() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: teachers, isLoading } = trpc.teachers.listNames.useQuery();

  const filteredTeachers = teachers?.filter((teacher) =>
    teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleSelectTeacher = (teacherId: number, teacherName: string) => {
    // Save to both localStorage and sessionStorage
    localStorage.setItem("teacherId", teacherId.toString());
    localStorage.setItem("teacherName", teacherName);
    localStorage.setItem("userRole", "teacher");
    localStorage.setItem("isAuthenticated", "true");
    sessionStorage.setItem("teacherId", teacherId.toString());
    sessionStorage.setItem("teacherName", teacherName);
    sessionStorage.setItem("userRole", "teacher");
    sessionStorage.setItem("isAuthenticated", "true");
    toast.success(`مرحباً ${teacherName}!`);
    setLocation("/teacher/voting");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-9 h-9 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl text-white">اختر اسمك من القائمة</CardTitle>
          <CardDescription className="text-slate-300 text-lg">
            اختر اسمك للدخول إلى صفحة التصويت
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="ابحث عن اسمك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 text-lg h-12"
            />
          </div>

          {/* قائمة المعلمين */}
          {isLoading ? (
            <div className="text-center text-slate-400 py-12">جاري التحميل...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-2">
              {filteredTeachers?.map((teacher) => (
                <Button
                  key={teacher.id}
                  onClick={() => handleSelectTeacher(teacher.id, teacher.fullName)}
                  variant="outline"
                  className="h-auto py-4 px-6 text-right justify-start bg-slate-700/30 border-slate-600 hover:border-blue-500 hover:bg-slate-700/50 transition-all"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-white font-medium text-lg">{teacher.fullName}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {filteredTeachers?.length === 0 && (
            <div className="text-center text-slate-400 py-12">لا توجد نتائج</div>
          )}

          {/* زر العودة */}
          <div className="flex justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/login")}
              className="text-slate-300 hover:text-white border-slate-600"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للوراء
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-slate-400 hover:text-white"
            >
              الصفحة الرئيسية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
