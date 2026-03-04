import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Trophy, Users, LogIn, BarChart3, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { StudentDetailsDialog } from "@/components/StudentDetailsDialog";
import Footer from "@/components/Footer";
import type { Student } from "../../../drizzle/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<number | undefined>(undefined);
  
  const { data: students, isLoading: studentsLoading } = trpc.students.list.useQuery(
    selectedGrade === "all" && selectedSection === undefined
      ? undefined
      : { 
          grade: selectedGrade === "all" ? undefined : selectedGrade,
          section: selectedSection
        }
  );
  const { data: topPrimaryStudents, isLoading: topPrimaryLoading } = trpc.students.topStudents.useQuery({ 
    limit: 5, 
    gradeGroup: "primary" 
  });
  const { data: topUpperStudents, isLoading: topUpperLoading } = trpc.students.topStudents.useQuery({ 
    limit: 5, 
    gradeGroup: "upper" 
  });
  
  // Check if content submission is enabled
  const { data: isContentEnabled } = trpc.settings.isContentSubmissionEnabled.useQuery();

  const filteredStudents = students?.filter((student) =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* شعار مواهب التربية */}
              <img 
                src="/mawheb-logo.jpg" 
                alt="شركة مواهب التربية" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-md object-contain bg-white flex-shrink-0"
              />
              {/* شعار ابتدائية أبها الأهلية */}
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663309657948/qlWmuXhDHMSMQoDS.jpeg" 
                alt="مدارس أبها الأهلية" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-md object-contain bg-white flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">مسارات</h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium truncate">ابتدائية أبها الأهلية</p>
                <p className="text-[10px] sm:text-xs text-blue-400 font-semibold truncate">جيلُ الهِمّة والقمّة</p>
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              {isContentEnabled && (
              <Button
                onClick={() => setLocation("/submit-content")}
                variant="outline"
                size="sm"
                className="bg-transparent border-green-600 text-green-300 hover:bg-green-700 text-xs sm:text-sm px-2 sm:px-4"
              >
                <Upload className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">إضافة محتوى</span>
                <span className="sm:hidden">محتوى</span>
              </Button>
              )}
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                size="sm"
                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 text-xs sm:text-sm px-2 sm:px-4"
              >
                <BarChart3 className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">الإحصائيات</span>
                <span className="sm:hidden">إحصائيات</span>
              </Button>
              <Button
                onClick={() => setLocation("/login")}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-4"
              >
                <LogIn className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">لوحة التحكم</span>
                <span className="sm:hidden">دخول</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Paths Explanation Section - Premium Design */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl -z-10"></div>
          <Card className="border-2 border-slate-700/50 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-8">
              <div className="text-center space-y-3">
                <div className="inline-block p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  المسارات التعليمية
                </CardTitle>
                <CardDescription className="text-lg text-slate-300 font-medium">
                  رحلتك نحو التميز والتفوق
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* مُبادر */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="relative z-10 text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
                      <span className="text-3xl">🌱</span>
                    </div>
                    <h3 className="text-2xl font-black text-white drop-shadow-lg">مُبادر</h3>
                    <div className="h-1 w-12 mx-auto bg-white/50 rounded-full"></div>
                    <p className="text-white/90 font-bold text-sm">100 - 199 نقطة</p>
                  </div>
                </div>

                {/* مُجتهد */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-700 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="relative z-10 text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
                      <span className="text-3xl">📚</span>
                    </div>
                    <h3 className="text-2xl font-black text-white drop-shadow-lg">مُجتهد</h3>
                    <div className="h-1 w-12 mx-auto bg-white/50 rounded-full"></div>
                    <p className="text-white/90 font-bold text-sm">200 - 299 نقطة</p>
                  </div>
                </div>

                {/* مُنضبط */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="relative z-10 text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
                      <span className="text-3xl">⚡</span>
                    </div>
                    <h3 className="text-2xl font-black text-white drop-shadow-lg">مُنضبط</h3>
                    <div className="h-1 w-12 mx-auto bg-white/50 rounded-full"></div>
                    <p className="text-white/90 font-bold text-sm">300 - 399 نقطة</p>
                  </div>
                </div>

                {/* مُتميز */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="relative z-10 text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
                      <span className="text-3xl">⭐</span>
                    </div>
                    <h3 className="text-2xl font-black text-white drop-shadow-lg">مُتميز</h3>
                    <div className="h-1 w-12 mx-auto bg-white/50 rounded-full"></div>
                    <p className="text-white/90 font-bold text-sm">400 - 499 نقطة</p>
                  </div>
                </div>

                {/* قُدوة */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="relative z-10 text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-4">
                      <span className="text-3xl">👑</span>
                    </div>
                    <h3 className="text-2xl font-black text-white drop-shadow-lg">قُدوة</h3>
                    <div className="h-1 w-12 mx-auto bg-white/50 rounded-full"></div>
                    <p className="text-white/90 font-bold text-sm">500 نقطة فما فوق</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Students Section - Split into Primary and Upper */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Grades Leaderboard */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-500" />
                <div>
                  <CardTitle className="text-2xl text-white">متصدرين الصفوف الأولية</CardTitle>
                  <CardDescription className="text-slate-300">
                    أول • ثاني • ثالث
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {topPrimaryLoading ? (
                <div className="text-center text-slate-400 py-8">جاري التحميل...</div>
              ) : topPrimaryStudents && topPrimaryStudents.length > 0 ? (
                <div className="space-y-3">
                  {topPrimaryStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0
                            ? "bg-yellow-500 text-slate-900"
                            : index === 1
                            ? "bg-gray-400 text-slate-900"
                            : index === 2
                            ? "bg-orange-600 text-white"
                            : "bg-slate-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">{student.fullName}</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">{student.score}</div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">لا يوجد طلاب في الصفوف الأولية</div>
              )}
            </CardContent>
          </Card>

          {/* Upper Grades Leaderboard */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div>
                  <CardTitle className="text-2xl text-white">متصدرين الصفوف العليا</CardTitle>
                  <CardDescription className="text-slate-300">
                    رابع • خامس • سادس
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {topUpperLoading ? (
                <div className="text-center text-slate-400 py-8">جاري التحميل...</div>
              ) : topUpperStudents && topUpperStudents.length > 0 ? (
                <div className="space-y-3">
                  {topUpperStudents.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            index === 0
                              ? "bg-yellow-500 text-slate-900"
                              : index === 1
                              ? "bg-gray-400 text-slate-900"
                              : index === 2
                              ? "bg-orange-600 text-white"
                              : "bg-slate-600 text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">{student.fullName}</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">{student.score}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">لا يوجد طلاب في الصفوف العليا</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Countdown Section with Progress Circle */}
        <Card className="mb-8 border-2 border-blue-600/50 bg-gradient-to-br from-blue-900/30 via-slate-800/50 to-purple-900/30 backdrop-blur">
          <CardContent className="py-6 sm:py-8">
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-xl sm:text-3xl font-bold text-white text-center">⏳ العد التنازلي للتقييم النهائي</h3>
              
              {/* Progress Circle */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                {(() => {
                  const now = new Date();
                  const startDate = new Date('2026-01-29');
                  const endDate = new Date('2026-06-10');
                  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  const diffTime = endDate.getTime() - now.getTime();
                  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const percentage = daysLeft > 0 ? (daysLeft / totalDays) * 100 : 0;
                  const circumference = 2 * Math.PI * 90;
                  const strokeDashoffset = circumference - (percentage / 100) * circumference;

                  return (
                    <>
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background circle */}
                        <circle
                          cx="50%"
                          cy="50%"
                          r="90"
                          stroke="#1e293b"
                          strokeWidth="12"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="50%"
                          cy="50%"
                          r="90"
                          stroke="url(#gradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                          {daysLeft > 0 ? daysLeft : 0}
                        </div>
                        <div className="text-lg sm:text-xl text-slate-300 font-semibold mt-2">يوم متبقي</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-slate-300">
                  <span className="text-sm sm:text-base">ينتهي في:</span>
                  <span className="text-base sm:text-lg font-bold text-blue-400">10 يونيو 2026</span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm">🏆 استغل كل يوم لتحقيق التميز والوصول إلى القمة!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Students Section */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <CardTitle className="text-2xl text-white">قائمة الطلاب</CardTitle>
                <CardDescription className="text-slate-300">
                  {selectedGrade === "all" ? `جميع الطلاب (${students?.length || 0} طالب)` : `طلاب ${selectedGrade} (${students?.length || 0} طالب)`}
                </CardDescription>
              </div>
            </div>
            <Input
              type="text"
              placeholder="ابحث عن طالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
            
            {/* Grade Tabs */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button
                variant={selectedGrade === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGrade("all")}
                className={`text-xs sm:text-sm ${selectedGrade === "all" ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              >
                الكل
              </Button>
              <Button
                variant={selectedGrade === "أول" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGrade("أول")}
                className={`text-xs sm:text-sm ${selectedGrade === "أول" ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              >
                الأول الابتدائي
              </Button>
              <Button
                variant={selectedGrade === "ثاني" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGrade("ثاني")}
                className={`text-xs sm:text-sm ${selectedGrade === "ثاني" ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              >
                الثاني الابتدائي
              </Button>
              <Button
                variant={selectedGrade === "ثالث" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGrade("ثالث")}
                className={`text-xs sm:text-sm ${selectedGrade === "ثالث" ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              >
                الثالث الابتدائي
              </Button>
              <Button
                variant={selectedGrade === "رابع" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGrade("رابع")}
                className={`text-xs sm:text-sm ${selectedGrade === "رابع" ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              >
                الرابع الابتدائي
              </Button>
              <Button
                variant={selectedGrade === "خامس" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGrade("خامس")}
                className={`text-xs sm:text-sm ${selectedGrade === "خامس" ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              >
                الخامس الابتدائي
              </Button>
              <Button
                variant={selectedGrade === "سادس" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGrade("سادس")}
                className={`text-xs sm:text-sm ${selectedGrade === "سادس" ? "bg-blue-600 hover:bg-blue-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              >
                السادس الابتدائي
              </Button>
            </div>
            
            {/* Section Tabs - Only show when a grade is selected */}
            {selectedGrade !== "all" && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="text-slate-300 text-sm flex items-center ml-2">الفصل:</span>
                <Button
                  variant={selectedSection === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection(undefined)}
                  className={selectedSection === undefined ? "bg-green-600 hover:bg-green-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}
                >
                  الكل
                </Button>
                <Button
                  variant={selectedSection === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection(1)}
                  className={selectedSection === 1 ? "bg-green-600 hover:bg-green-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}
                >
                  أ
                </Button>
                <Button
                  variant={selectedSection === 2 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection(2)}
                  className={selectedSection === 2 ? "bg-green-600 hover:bg-green-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}
                >
                  ب
                </Button>
                <Button
                  variant={selectedSection === 3 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection(3)}
                  className={selectedSection === 3 ? "bg-green-600 hover:bg-green-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}
                >
                  ج
                </Button>
                {(selectedGrade === "رابع" || selectedGrade === "خامس") && (
                  <Button
                    variant={selectedSection === 4 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSection(4)}
                    className={selectedSection === 4 ? "bg-green-600 hover:bg-green-700" : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"}
                  >
                    د
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center text-slate-400 py-8">جاري التحميل...</div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredStudents?.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 bg-slate-700/30 rounded-lg border-2 border-slate-600 hover:border-blue-500 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedStudent(student);
                      setDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-white font-medium text-base flex-1">{student.fullName}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-blue-400 font-bold text-lg">{student.score}</span>
                        <span className="text-slate-400 text-sm">نقطة</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredStudents?.length === 0 && (
              <div className="text-center text-slate-400 py-8">لا توجد نتائج</div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Student Details Dialog */}
      <StudentDetailsDialog
        student={selectedStudent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
