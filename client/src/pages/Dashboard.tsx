import { useState } from "react";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Users, Trophy, TrendingUp, Award, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading } = trpc.voting.getDashboardStats.useQuery();

  // ألوان متناسقة للرسوم البيانية
  const GRADE_COLORS = {
    "أول": "#22c55e",
    "ثاني": "#3b82f6", 
    "ثالث": "#8b5cf6",
    "رابع": "#f59e0b",
    "خامس": "#ef4444",
    "سادس": "#06b6d4",
  };

  const PIE_COLORS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

  // تحويل أسماء الصفوف للعرض
  const getGradeLabel = (grade: string) => {
    const labels: Record<string, string> = {
      "أول": "الأول",
      "ثاني": "الثاني",
      "ثالث": "الثالث",
      "رابع": "الرابع",
      "خامس": "الخامس",
      "سادس": "السادس",
    };
    return labels[grade] || grade;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-slate-300 hover:text-white hover:bg-slate-700 px-2 sm:px-4"
            >
              <ArrowLeft className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">العودة</span>
            </Button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">لوحة الإحصائيات</h1>
              <p className="text-xs sm:text-sm text-slate-300 hidden sm:block">مسارات - ابتدائية أبها الأهلية</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {isLoading ? (
          <div className="text-center text-white py-12">جاري التحميل...</div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards - 2x2 على الجوال */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card className="border-slate-700 bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur">
                <CardHeader className="pb-1 sm:pb-3 p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-lg text-slate-300">إجمالي الطلاب</CardTitle>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-white">{stats?.totalStudents || 0}</div>
                  <p className="text-[10px] sm:text-sm text-slate-400 mt-1">طالب</p>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur">
                <CardHeader className="pb-1 sm:pb-3 p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-lg text-slate-300">متوسط النقاط</CardTitle>
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-white">{stats?.averageScore?.toFixed(1) || 0}</div>
                  <p className="text-[10px] sm:text-sm text-slate-400 mt-1">نقطة</p>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur">
                <CardHeader className="pb-1 sm:pb-3 p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-lg text-slate-300">التصويتات</CardTitle>
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-white">{stats?.weeklyVotes || 0}</div>
                  <p className="text-[10px] sm:text-sm text-slate-400 mt-1">هذا الأسبوع</p>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur">
                <CardHeader className="pb-1 sm:pb-3 p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-lg text-slate-300">المتميزون</CardTitle>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-white">{stats?.excellentStudents || 0}</div>
                  <p className="text-[10px] sm:text-sm text-slate-400 mt-1">600+ نقطة</p>
                </CardContent>
              </Card>
            </div>

            {/* أعلى 5 طلاب - بارز في الأعلى */}
            <Card className="border-slate-700 bg-gradient-to-br from-amber-900/30 to-slate-800/50 backdrop-blur">
              <CardHeader className="p-3 sm:p-6">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  <CardTitle className="text-lg sm:text-xl text-white">🏆 أعلى 5 طلاب</CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-xs sm:text-sm">المتصدرون في النقاط الإجمالية</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                  {stats?.topStudents?.map((student: any, index: number) => (
                    <div
                      key={student.id}
                      className={`relative p-3 sm:p-4 rounded-xl border ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-500/30 to-yellow-700/20 border-yellow-500/50"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-400/30 to-gray-600/20 border-gray-400/50"
                          : index === 2
                          ? "bg-gradient-to-br from-orange-500/30 to-orange-700/20 border-orange-500/50"
                          : "bg-slate-700/30 border-slate-600"
                      }`}
                    >
                      {/* الترتيب */}
                      <div
                        className={`absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500 text-slate-900"
                            : index === 1
                            ? "bg-gray-400 text-slate-900"
                            : index === 2
                            ? "bg-orange-500 text-white"
                            : "bg-slate-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:text-center">
                        {/* أيقونة الميدالية */}
                        <div className="text-2xl sm:text-3xl">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "⭐"}
                        </div>
                        
                        <div className="flex-1 sm:flex-none">
                          <p className="text-white font-semibold text-sm sm:text-base line-clamp-1">{student.fullName}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400">{student.grade}</p>
                        </div>
                        
                        <div className="text-xl sm:text-2xl font-bold text-blue-400">{student.score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* الرسوم البيانية */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* متوسط النقاط حسب الصف */}
              <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    متوسط النقاط حسب الصف
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs sm:text-sm">مقارنة الأداء بين الصفوف</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart 
                      data={stats?.averageScoreByGrade?.map((item: any) => ({
                        ...item,
                        gradeLabel: getGradeLabel(item.grade),
                      })) || []}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                      <YAxis 
                        type="category" 
                        dataKey="gradeLabel" 
                        stroke="#94a3b8" 
                        fontSize={11}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: "#1e293b", 
                          border: "1px solid #475569", 
                          borderRadius: "8px",
                          fontSize: "12px"
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                        formatter={(value: any) => [`${value} نقطة`, "المتوسط"]}
                      />
                      <Bar 
                        dataKey="average" 
                        radius={[0, 4, 4, 0]}
                      >
                        {stats?.averageScoreByGrade?.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || "#3b82f6"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* توزيع الطلاب حسب الصف - Pie Chart */}
              <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    توزيع الطلاب حسب الصف
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs sm:text-sm">نسبة الطلاب في كل صف</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats?.studentsByGrade?.map((item: any) => ({
                          ...item,
                          name: getGradeLabel(item.grade),
                        })) || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {stats?.studentsByGrade?.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || PIE_COLORS[index % PIE_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: "#1e293b", 
                          border: "1px solid #475569", 
                          borderRadius: "8px",
                          fontSize: "12px"
                        }}
                        formatter={(value: any, name: any) => [`${value} طالب`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend مخصص */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2">
                    {stats?.studentsByGrade?.map((item: any, index: number) => (
                      <div key={item.grade} className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: GRADE_COLORS[item.grade as keyof typeof GRADE_COLORS] || PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="text-[10px] sm:text-xs text-slate-300">{getGradeLabel(item.grade)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* عدد الطلاب في كل صف - Bar Chart عمودي */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  عدد الطلاب في كل صف
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs sm:text-sm">إحصائية توزيع الطلاب</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={stats?.studentsByGrade?.map((item: any) => ({
                      ...item,
                      gradeLabel: getGradeLabel(item.grade),
                    })) || []}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                    <XAxis 
                      dataKey="gradeLabel" 
                      stroke="#94a3b8" 
                      fontSize={11}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "#1e293b", 
                        border: "1px solid #475569", 
                        borderRadius: "8px",
                        fontSize: "12px"
                      }}
                      formatter={(value: any) => [`${value} طالب`, "العدد"]}
                    />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                    >
                      {stats?.studentsByGrade?.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || "#3b82f6"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
