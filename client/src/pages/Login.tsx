import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Shield } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const ADMIN_CODE = "sd12$jJff23";
const TEACHER_CODE = "aA12@gsA";

export default function Login() {
  const [, setLocation] = useLocation();
  const [adminCode, setAdminCode] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (adminCode === ADMIN_CODE) {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("isAuthenticated", "true");
        // Also set in sessionStorage for backward compatibility
        sessionStorage.setItem("userRole", "admin");
        sessionStorage.setItem("isAuthenticated", "true");
        toast.success("تم تسجيل الدخول بنجاح كمدير نظام");
        setLocation("/admin");
      } else {
        toast.error("رمز مدير النظام غير صحيح");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (teacherCode === TEACHER_CODE) {
        // توجيه المعلم إلى صفحة اختيار الاسم
        setLocation("/teacher/select");
      } else {
        toast.error("رمز المعلم غير صحيح");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">مسارات</h1>
          <p className="text-lg text-slate-200 mb-1">ابتدائية أبها الأهلية</p>
          <p className="text-sm text-blue-300">جيلُ الهِمّة والقمّة</p>
          <p className="text-blue-200 mt-3">تسجيل الدخول إلى لوحة التحكم</p>
        </div>

        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="w-4 h-4" />
              مدير النظام
            </TabsTrigger>
            <TabsTrigger value="teacher" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              معلم
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  تسجيل دخول مدير النظام
                </CardTitle>
                <CardDescription>
                  أدخل رمز مدير النظام للوصول إلى لوحة التحكم الكاملة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminCode">رمز مدير النظام</Label>
                    <Input
                      id="adminCode"
                      type="password"
                      placeholder="أدخل رمز مدير النظام"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      required
                      disabled={isLoading}
                      dir="ltr"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teacher">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  تسجيل دخول المعلم
                </CardTitle>
                <CardDescription>
                  أدخل رمز المعلم للوصول إلى صفحة التصويت
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacherCode">رمز المعلم</Label>
                    <Input
                      id="teacherCode"
                      type="password"
                      placeholder="أدخل رمز المعلم"
                      value={teacherCode}
                      onChange={(e) => setTeacherCode(e.target.value)}
                      required
                      disabled={isLoading}
                      dir="ltr"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            className="text-blue-200 hover:text-white"
            onClick={() => setLocation("/")}
          >
            ← العودة إلى الصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}
