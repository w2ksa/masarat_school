import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { FileText, Loader2, Upload, Trash2, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function TeacherDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: teacherProfile, isLoading: profileLoading } = trpc.teachers.getProfile.useQuery() as { data: any; isLoading: boolean };
  const { data: myFiles, isLoading: filesLoading } = trpc.files.myFiles.useQuery() as { data: any[]; isLoading: boolean };

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "",
    file: null as File | null,
  });
  const [registerForm, setRegisterForm] = useState({
    specialization: "",
    phoneNumber: "",
    bio: "",
  });

  const registerMutation = trpc.teachers.register.useMutation({
    onSuccess: () => {
      utils.teachers.getProfile.invalidate();
      toast.success("تم تسجيل طلبك بنجاح! في انتظار موافقة الإدارة");
      setIsRegisterDialogOpen(false);
      setRegisterForm({ specialization: "", phoneNumber: "", bio: "" });
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء التسجيل");
    },
  });

  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: () => {
      utils.files.myFiles.invalidate();
      toast.success("تم رفع الملف بنجاح");
      setIsUploadDialogOpen(false);
      setUploadForm({ title: "", description: "", category: "", file: null });
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء رفع الملف");
    },
  });

  const deleteMutation = trpc.files.delete.useMutation({
    onSuccess: () => {
      utils.files.myFiles.invalidate();
      toast.success("تم حذف الملف بنجاح");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف الملف");
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm({ ...uploadForm, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.file) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result?.toString().split(",")[1];
      if (!base64) {
        toast.error("حدث خطأ في قراءة الملف");
        return;
      }

      uploadMutation.mutate({
        title: uploadForm.title,
        description: uploadForm.description,
        fileName: uploadForm.file!.name,
        fileData: base64,
        mimeType: uploadForm.file!.type,
        category: uploadForm.category,
      });
    };
    reader.readAsDataURL(uploadForm.file);
  };

  const handleRegister = () => {
    registerMutation.mutate(registerForm);
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // If user is not registered as a teacher yet
  if (!teacherProfile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Button variant="ghost">← العودة للرئيسية</Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl">مرحباً بك في منصة مسارات</CardTitle>
              <CardDescription className="text-muted-foreground">
                للبدء في استخدام المنصة كمعلم، يرجى التسجيل أولاً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full">
                    التسجيل كمعلم
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">التسجيل كمعلم</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      يرجى ملء البيانات التالية. سيتم مراجعة طلبك من قبل الإدارة.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="specialization" className="text-foreground">التخصص</Label>
                      <Input
                        id="specialization"
                        value={registerForm.specialization}
                        onChange={(e) => setRegisterForm({ ...registerForm, specialization: e.target.value })}
                        placeholder="مثال: رياضيات، فيزياء، كيمياء"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" className="text-foreground">رقم الهاتف</Label>
                      <Input
                        id="phoneNumber"
                        value={registerForm.phoneNumber}
                        onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                        placeholder="+966xxxxxxxxx"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-foreground">نبذة عنك</Label>
                      <Textarea
                        id="bio"
                        value={registerForm.bio}
                        onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
                        placeholder="أخبرنا عن خبراتك ومؤهلاتك"
                        className="bg-background border-border text-foreground"
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleRegister}
                      disabled={registerMutation.isPending}
                      className="w-full"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري التسجيل...
                        </>
                      ) : (
                        "إرسال الطلب"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If teacher is pending approval
  if (teacherProfile.status === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Button variant="ghost">← العودة للرئيسية</Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                طلبك قيد المراجعة
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                تم استلام طلب التسجيل الخاص بك. سيتم مراجعته من قبل الإدارة قريباً.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>التخصص: {teacherProfile.specialization || "غير محدد"}</p>
                <p>رقم الهاتف: {teacherProfile.phoneNumber || "غير محدد"}</p>
                {teacherProfile.bio && <p>النبذة: {teacherProfile.bio}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If teacher is rejected
  if (teacherProfile.status === "rejected") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Button variant="ghost">← العودة للرئيسية</Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                تم رفض الطلب
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                نأسف لإبلاغك بأن طلب التسجيل الخاص بك لم يتم قبوله. يرجى التواصل مع الإدارة للمزيد من المعلومات.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Teacher is approved
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost">← العودة للرئيسية</Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">لوحة المعلم</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default">معتمد</Badge>
              <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">معلومات الملف الشخصي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">الاسم:</span> {user?.name || "غير محدد"}
              </div>
              <div>
                <span className="font-semibold text-foreground">البريد الإلكتروني:</span> {user?.email}
              </div>
              <div>
                <span className="font-semibold text-foreground">التخصص:</span> {teacherProfile.specialization || "غير محدد"}
              </div>
              <div>
                <span className="font-semibold text-foreground">رقم الهاتف:</span> {teacherProfile.phoneNumber || "غير محدد"}
              </div>
              {teacherProfile.bio && (
                <div className="md:col-span-2">
                  <span className="font-semibold text-foreground">النبذة:</span> {teacherProfile.bio}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">الملفات التعليمية</CardTitle>
                <CardDescription className="text-muted-foreground">
                  قم برفع وإدارة الملفات التعليمية الخاصة بك
                </CardDescription>
              </div>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="ml-2 h-4 w-4" />
                    رفع ملف جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">رفع ملف تعليمي</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      يرجى ملء المعلومات التالية لرفع الملف
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title" className="text-foreground">عنوان الملف *</Label>
                      <Input
                        id="title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        placeholder="مثال: شرح الدرس الأول - الرياضيات"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-foreground">الوصف</Label>
                      <Textarea
                        id="description"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                        placeholder="وصف مختصر للملف"
                        className="bg-background border-border text-foreground"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-foreground">التصنيف</Label>
                      <Input
                        id="category"
                        value={uploadForm.category}
                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                        placeholder="مثال: رياضيات، علوم، لغة عربية"
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="file" className="text-foreground">الملف *</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="w-full"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        "رفع الملف"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {filesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              </div>
            ) : myFiles && myFiles.length > 0 ? (
              <div className="space-y-3">
                {(myFiles as any[]).map((file: any) => (
                  <div key={file.id} className="p-4 rounded-lg border border-border bg-background flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{file.title}</h4>
                      <p className="text-sm text-muted-foreground">{file.description || "لا يوجد وصف"}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>التصنيف: {file.category || "عام"}</span>
                        <span>الحجم: {(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>التاريخ: {new Date(file.createdAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mr-4">
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <FileText className="ml-2 h-4 w-4" />
                          عرض
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
                            deleteMutation.mutate({ fileId: file.id });
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لم تقم برفع أي ملفات بعد. ابدأ برفع أول ملف تعليمي!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
