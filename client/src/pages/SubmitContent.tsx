import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Camera, CheckCircle, Lock, Upload, Video } from "lucide-react";
import { useRef, useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Footer from "@/components/Footer";

// Grade and section mappings - متوافقة مع قاعدة البيانات
const GRADES = [
  { value: "أول", label: "الصف الأول" },
  { value: "ثاني", label: "الصف الثاني" },
  { value: "ثالث", label: "الصف الثالث" },
  { value: "رابع", label: "الصف الرابع" },
  { value: "خامس", label: "الصف الخامس" },
  { value: "سادس", label: "الصف السادس" },
];

// Sections are stored as numbers in database (1, 2, 3, 4, 5, 6)
const SECTIONS = [
  { value: "1", label: "أ" },
  { value: "2", label: "ب" },
  { value: "3", label: "ج" },
  { value: "4", label: "د" },
  { value: "5", label: "هـ" },
  { value: "6", label: "و" },
];

export default function SubmitContent() {
  const [, setLocation] = useLocation();
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [contentType, setContentType] = useState<"video" | "image">("image");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if content submission is enabled
  const { data: isEnabled, isLoading: checkingEnabled } = trpc.settings.isContentSubmissionEnabled.useQuery();

  // Get all students for selection (synced with student management)
  const { data: students = [], isLoading: studentsLoading } = trpc.students.list.useQuery({});

  // Filter students by grade and section
  const filteredStudents = useMemo(() => {
    let filtered = students;
    
    if (selectedGrade) {
      filtered = filtered.filter(s => s.grade === selectedGrade);
    }
    
    if (selectedSection) {
      // Section is stored as number in database
      filtered = filtered.filter(s => String(s.section) === selectedSection);
    }
    
    return filtered.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ar'));
  }, [students, selectedGrade, selectedSection]);

  // Revoke blob URL when previewUrl changes or component unmounts (memory leak fix)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Upload mutation
  const uploadMutation = trpc.content.upload.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      setIsUploading(false);
      toast.success("تم إرسال المحتوى بنجاح! سيتم مراجعته من قبل المشرف");
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error(error.message || "حدث خطأ أثناء الرفع");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت");
      return;
    }

    // Check file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("يرجى اختيار صورة أو فيديو");
      return;
    }

    setContentType(isVideo ? "video" : "image");
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) {
      toast.error("يرجى اختيار اسمك");
      return;
    }

    if (!selectedFile) {
      toast.error("يرجى اختيار ملف للرفع");
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        
        await uploadMutation.mutateAsync({
          studentId: parseInt(selectedStudentId),
          contentType,
          fileName: selectedFile.name,
          fileData: base64,
          mimeType: selectedFile.type,
          description: description || undefined,
        });

        setIsUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedGrade("");
    setSelectedSection("");
    setSelectedStudentId("");
    setContentType("image");
    setDescription("");
    setSelectedFile(null);
    setPreviewUrl("");
    setIsSuccess(false);
  };

  // Show loading state
  if (checkingEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-white text-center">
            <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
            <p>جاري التحميل...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show disabled state
  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
          <div className="container px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="text-white hover:bg-slate-700"
                onClick={() => setLocation("/")}
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                العودة
              </Button>
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">مسارات</h1>
              </div>
              <div className="w-20" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-12 h-12 text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-600 mb-2">إرسال المحتوى مغلق</h2>
              <p className="text-muted-foreground mb-6">
                إرسال المحتوى غير متاح حالياً. يرجى المحاولة لاحقاً.
              </p>
              <Button variant="outline" onClick={() => setLocation("/")} className="w-full">
                العودة للصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">تم الإرسال بنجاح!</h2>
              <p className="text-muted-foreground mb-6">
                سيتم مراجعة المحتوى من قبل المشرف وإضافة النقاط عند الموافقة
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={resetForm} className="w-full">
                  إرسال محتوى آخر
                </Button>
                <Button variant="outline" onClick={() => setLocation("/")} className="w-full">
                  العودة للصفحة الرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-white hover:bg-slate-700"
              onClick={() => setLocation("/")}
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              العودة
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">مسارات</h1>
              <p className="text-sm text-slate-300">إضافة محتوى</p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6 px-4">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Upload className="w-6 h-6 text-blue-600" />
              إرسال صورة أو فيديو
            </CardTitle>
            <CardDescription>
              شارك إنجازاتك وأنشطتك للحصول على نقاط إضافية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Grade Selection */}
              <div className="space-y-2">
                <Label>اختر الصف</Label>
                <Select 
                  value={selectedGrade} 
                  onValueChange={(value) => {
                    setSelectedGrade(value);
                    setSelectedStudentId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Selection */}
              <div className="space-y-2">
                <Label>اختر الفصل</Label>
                <Select 
                  value={selectedSection} 
                  onValueChange={(value) => {
                    setSelectedSection(value);
                    setSelectedStudentId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفصل" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student">اختر اسمك *</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر اسمك من القائمة" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {studentsLoading ? (
                      <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                    ) : filteredStudents.length === 0 ? (
                      <SelectItem value="empty" disabled>لا يوجد طلاب</SelectItem>
                    ) : (
                      filteredStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.fullName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {filteredStudents.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    عدد الطلاب: {filteredStudents.length}
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>اختر الملف *</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex justify-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Camera className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium text-sm">اضغط لاختيار صورة أو فيديو</p>
                    <p className="text-xs text-slate-400 mt-1">الحد الأقصى: 50 ميجابايت</p>
                  </div>
                ) : (
                  <div className="relative">
                    {contentType === "image" ? (
                      <img
                        src={previewUrl}
                        alt="معاينة"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        controls
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 left-2"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                      }}
                    >
                      حذف
                    </Button>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {contentType === "image" ? "صورة" : "فيديو"}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">وصف المحتوى (اختياري)</Label>
                <Textarea
                  id="description"
                  placeholder="أضف وصفاً للمحتوى..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isUploading || !selectedStudentId || !selectedFile}
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 ml-2" />
                    إرسال المحتوى
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                سيتم مراجعة المحتوى من قبل المشرف قبل إضافة النقاط
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
