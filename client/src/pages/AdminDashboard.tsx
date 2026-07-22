import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCircle, FileText, Users, XCircle, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: teachers, isLoading: teachersLoading } = trpc.teachers.list.useQuery();
  const { data: files } = trpc.files.list.useQuery();
  const { data: notifications } = trpc.notifications.list.useQuery();
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery();

  const updateStatusMutation = trpc.teachers.updateStatus.useMutation({
    onSuccess: () => {
      utils.teachers.list.invalidate();
      toast.success("تم تحديث حالة المعلم بنجاح");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث الحالة");
    },
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const pendingTeachers = teachers?.filter((t) => t.teacher.status === "pending") || [];
  const approvedTeachers = teachers?.filter((t) => t.teacher.status === "approved") || [];
  const rejectedTeachers = teachers?.filter((t) => t.teacher.status === "rejected") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost">← العودة للرئيسية</Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-muted-foreground" />
                {unreadCount && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المعلمين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{teachers?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">المعلمون المعتمدون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{approvedTeachers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">طلبات قيد الانتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{pendingTeachers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">الملفات التعليمية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{files?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Section */}
        {notifications && notifications.length > 0 && (
          <Card className="mb-8 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5" />
                الإشعارات الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.isRead === 0 ? "bg-accent border-primary" : "bg-muted border-border"
                    }`}
                    onClick={() => {
                      if (notification.isRead === 0) {
                        markAsReadMutation.mutate({ notificationId: notification.id });
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                      {notification.isRead === 0 && (
                        <Badge variant="default">جديد</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Teachers Section */}
        {pendingTeachers.length > 0 && (
          <Card className="mb-8 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5" />
                طلبات التسجيل قيد الانتظار
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                يحتاج هؤلاء المعلمون إلى موافقتك للبدء في استخدام المنصة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTeachers.map((item) => (
                  <div key={item.teacher.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.user?.name || "غير معروف"}</h4>
                        <p className="text-sm text-muted-foreground">{item.user?.email}</p>
                        {item.teacher.specialization && (
                          <p className="text-sm text-muted-foreground mt-1">
                            التخصص: {item.teacher.specialization}
                          </p>
                        )}
                        {item.teacher.phoneNumber && (
                          <p className="text-sm text-muted-foreground">
                            الهاتف: {item.teacher.phoneNumber}
                          </p>
                        )}
                        {item.teacher.bio && (
                          <p className="text-sm text-muted-foreground mt-2">{item.teacher.bio}</p>
                        )}
                      </div>
                      <div className="flex gap-2 mr-4">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              teacherId: item.teacher.id,
                              status: "approved",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="ml-2 h-4 w-4" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              teacherId: item.teacher.id,
                              status: "rejected",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="ml-2 h-4 w-4" />
                          رفض
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Teachers Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              جميع المعلمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teachersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : teachers && teachers.length > 0 ? (
              <div className="space-y-3">
                {teachers.map((item) => (
                  <div key={item.teacher.id} className="p-4 rounded-lg border border-border bg-background flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{item.user?.name || "غير معروف"}</h4>
                      <p className="text-sm text-muted-foreground">{item.user?.email}</p>
                      {item.teacher.specialization && (
                        <p className="text-sm text-muted-foreground">التخصص: {item.teacher.specialization}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        item.teacher.status === "approved"
                          ? "default"
                          : item.teacher.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {item.teacher.status === "approved"
                        ? "معتمد"
                        : item.teacher.status === "pending"
                        ? "قيد الانتظار"
                        : "مرفوض"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا يوجد معلمون مسجلون حالياً
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Files Section */}
        {files && files.length > 0 && (
          <Card className="mt-8 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                جميع الملفات التعليمية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((item) => (
                  <div key={item.file.id} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{item.file.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.file.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          المعلم: {item.user?.name || "غير معروف"} | التصنيف: {item.file.category || "عام"}
                        </p>
                      </div>
                      <a href={item.file.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <FileText className="ml-2 h-4 w-4" />
                          تحميل
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
