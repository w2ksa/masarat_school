import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Medal, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const GRADE_COLORS = {
  "أول": "#f59e0b",
  "ثاني": "#10b981", 
  "ثالث": "#3b82f6",
  "رابع": "#8b5cf6",
  "خامس": "#ec4899",
  "سادس": "#ef4444"
};

const RANK_COLORS = ["#fbbf24", "#94a3b8", "#f97316", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#ef4444"];

export function WeeklyStatsSection() {
  // تحديث مباشر: تظهر التصويتات الجديدة خلال ثوانٍ دون الحاجة لإعادة تحميل الصفحة
  // @ts-ignore
  const { data: weeklyStats, isLoading } = trpc.voting.getWeeklyStats.useQuery(undefined, {
    staleTime: 10000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 15000,
  });

  // @ts-ignore
  const { data: allStudents } = trpc.students.list.useQuery({ grade: undefined }, {
    staleTime: 10000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 15000,
  });

  // @ts-ignore
  const topStudentsOverall = (weeklyStats as any)?.topStudentsOverall || [];

  const sortedStudents = [...(allStudents || [])].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

  const barChartData = topStudentsOverall.slice(0, 8).map((item: any) => ({
    name: item.student?.fullName?.split(" ").slice(0, 2).join(" ") || "غير معروف",
    votes: item.count || 0,
    grade: item.student?.grade || ""
  }));

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/80 border-border">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-muted-foreground text-lg">جاري التحميل...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = topStudentsOverall.length > 0;

  return (
    <div className="space-y-8">
      {/* العنوان الرئيسي */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-8 py-4 rounded-2xl border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
          <Trophy className="w-10 h-10 text-yellow-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            تصويتات الأسبوع
          </h2>
          <Trophy className="w-10 h-10 text-yellow-500" />
        </div>
        <p className="text-muted-foreground mt-3 text-lg">أعلى الطلاب المصوت لهم هذا الأسبوع</p>
      </div>

      {!hasData ? (
        <Card className="bg-gradient-to-br from-card to-card/80 border-border">
          <CardContent className="py-16">
            <div className="text-center text-muted-foreground">
              <Trophy className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <p className="text-2xl font-bold">لا توجد تصويتات حتى الآن</p>
              <p className="text-muted-foreground/70 mt-2">سيتم عرض التصويتات هنا عند بدء المعلمين بالتصويت</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* أعلى الطلاب المصوت لهم */}
            <Card className="bg-gradient-to-br from-card/90 to-card border-border shadow-xl">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-3 text-foreground text-xl">
                  <Medal className="w-6 h-6 text-yellow-500" />
                  أعلى الطلاب المصوت لهم
                </CardTitle>
                <CardDescription className="text-muted-foreground">ترتيب الطلاب حسب عدد التصويتات هذا الأسبوع</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {topStudentsOverall.slice(0, 10).map((item: any, index: number) => {
                  const student = item.student;
                  const color = GRADE_COLORS[student?.grade as keyof typeof GRADE_COLORS] || "#6b7280";
                  const isTop3 = index < 3;
                  
                  return (
                    <div 
                      key={student?.id || index}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] border ${
                        isTop3 ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent' :
                        'border-border/50 bg-card/30'
                      }`}
                    >
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-slate-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold truncate ${isTop3 ? 'text-foreground' : 'text-foreground/90'}`}>
                          {student?.fullName || "غير معروف"}
                        </div>
                        <div className="text-xs text-muted-foreground/70">
                          الصف {student?.grade} {student?.section ? `- الفصل ${student?.section}` : ''}
                        </div>
                      </div>
                      
                      <div 
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: `${color}30`, color: color }}
                      >
                        {student?.grade}
                      </div>
                      
                      <Badge 
                        className={`text-sm px-3 py-1 font-bold shadow-lg ${
                          isTop3 ? 'bg-yellow-500 text-black' : 'bg-blue-600'
                        }`}
                      >
                        {item.count} تصويت
                      </Badge>
                    </div>
                  );
                })}
                
                {topStudentsOverall.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Medal className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>لا توجد تصويتات حتى الآن</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* الرسم البياني */}
            <Card className="bg-gradient-to-br from-card/90 to-card border-border shadow-xl">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="flex items-center gap-3 text-foreground text-xl">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  رسم بياني للتصويتات
                </CardTitle>
                <CardDescription className="text-muted-foreground">توزيع التصويتات على الطلاب</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={barChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
                      <XAxis type="number" tick={{ fill: "var(--muted-foreground)" }} />
                      <YAxis 
                        type="category"
                        dataKey="name" 
                        tick={{ fill: "var(--foreground)", fontSize: 12 }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          color: "var(--foreground)",
                        }}
                        formatter={(value: number) => [`${value} تصويت`, "التصويتات"]}
                      />
                      <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
                        {barChartData.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || "#3b82f6"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground py-16">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>لا توجد بيانات للعرض</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ترتيب جميع الطلاب */}
          <Card className="bg-gradient-to-br from-card/90 to-card border-border shadow-xl">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-foreground text-xl">
                <Users className="w-6 h-6 text-green-500" />
                ترتيب جميع الطلاب حسب النقاط الكلية
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                ترتيب الطلاب من الأعلى للأقل حسب مجموع النقاط الفعلية ({sortedStudents.length} طالب)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {sortedStudents.length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2">
                  {sortedStudents.map((student: any, index: number) => {
                    const color = GRADE_COLORS[student.grade as keyof typeof GRADE_COLORS] || "#6b7280";
                    const isTop3 = index < 3;
                    const isTop10 = index < 10;
                    
                    return (
                      <div 
                        key={student.id}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:scale-[1.01] border ${
                          isTop3 ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent' :
                          isTop10 ? 'border-blue-500/30 bg-card/50' :
                          'border-border/50 bg-card/30'
                        }`}
                      >
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-slate-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold truncate ${isTop3 ? 'text-foreground' : 'text-foreground/90'}`}>
                            {student.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground/70">
                            الصف {student.grade} {student.section ? `- الفصل ${student.section}` : ''}
                          </div>
                        </div>
                        
                        <div 
                          className="px-2 py-1 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: `${color}30`, color: color }}
                        >
                          {student.grade}
                        </div>
                        
                        <div className={`text-left min-w-[80px] ${isTop3 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                          <div className="font-bold text-lg">{student.score || 0}</div>
                          <div className="text-xs text-muted-foreground/70">نقطة</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>لا يوجد طلاب</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
