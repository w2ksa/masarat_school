import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle, XCircle, Clock, Image, Video, Eye, RefreshCw, Filter } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Footer from "@/components/Footer";

// Grade and section mappings - متوافقة مع قاعدة البيانات
const GRADES = [
  { value: "all", label: "جميع الصفوف" },
  { value: "أول", label: "الصف الأول" },
  { value: "ثاني", label: "الصف الثاني" },
  { value: "ثالث", label: "الصف الثالث" },
  { value: "رابع", label: "الصف الرابع" },
  { value: "خامس", label: "الصف الخامس" },
  { value: "سادس", label: "الصف السادس" },
];

const SECTIONS = [
  { value: "all", label: "جميع الفصول" },
  { value: "1", label: "أ" },
  { value: "2", label: "ب" },
  { value: "3", label: "ج" },
  { value: "4", label: "د" },
];

export default function ContentManagement() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  
  // Filter states
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterSection, setFilterSection] = useState("all");

  // Check authentication
  useEffect(() => {
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    const isAuth = localStorage.getItem("isAuthenticated") || sessionStorage.getItem("isAuthenticated");
    
    if (role !== "admin" || isAuth !== "true") {
      setLocation("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [setLocation]);

  // Get content list
  const { data: pendingContent = [], isLoading: pendingLoading, refetch: refetchPending } = 
    trpc.content.list.useQuery({ status: "pending" });
  const { data: approvedContent = [], refetch: refetchApproved } = 
    trpc.content.list.useQuery({ status: "approved" });
  const { data: rejectedContent = [], refetch: refetchRejected } = 
    trpc.content.list.useQuery({ status: "rejected" });
  const { data: pendingCount = 0, refetch: refetchCount } = 
    trpc.content.pendingCount.useQuery();

  // Filter content by grade and section
  const filterContent = (content: any[]) => {
    return content.filter(item => {
      const student = item.student;
      if (!student) return true;
      
      const gradeMatch = filterGrade === "all" || student.grade === filterGrade;
      const sectionMatch = filterSection === "all" || String(student.section) === filterSection;
      
      return gradeMatch && sectionMatch;
    });
  };

  const filteredPending = useMemo(() => filterContent(pendingContent), [pendingContent, filterGrade, filterSection]);
  const filteredApproved = useMemo(() => filterContent(approvedContent), [approvedContent, filterGrade, filterSection]);
  const filteredRejected = useMemo(() => filterContent(rejectedContent), [rejectedContent, filterGrade, filterSection]);

  // Mutations
  const approveMutation = trpc.content.approve.useMutation({
    onSuccess: () => {
      toast.success("تمت الموافقة وإضافة 10 نقاط للطالب");
      refetchPending();
      refetchApproved();
      refetchCount();
      setShowPreview(false);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const rejectMutation = trpc.content.reject.useMutation({
    onSuccess: () => {
      toast.success("تم رفض المحتوى");
      refetchPending();
      refetchRejected();
      refetchCount();
      setShowPreview(false);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const handleApprove = (contentId: number) => {
    const adminName = localStorage.getItem("adminName") || "مدير النظام";
    approveMutation.mutate({ contentId, reviewedBy: adminName });
  };

  const handleReject = (contentId: number) => {
    const adminName = localStorage.getItem("adminName") || "مدير النظام";
    rejectMutation.mutate({ contentId, reviewedBy: adminName });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getSectionLabel = (section: number | null) => {
    const labels: Record<number, string> = { 1: "أ", 2: "ب", 3: "ج", 4: "د" };
    return section ? labels[section] || section : "";
  };

  const ContentCard = ({ item, showActions = false }: { item: any; showActions?: boolean }) => (
    <Card className="overflow-hidden">
      <div className="relative">
        {item.content.contentType === "image" ? (
          <img
            src={item.content.fileUrl}
            alt="محتوى"
            className="w-full h-40 object-cover cursor-pointer"
            onClick={() => {
              setSelectedContent(item);
              setShowPreview(true);
            }}
          />
        ) : (
          <div 
            className="w-full h-40 bg-slate-100 flex items-center justify-center cursor-pointer"
            onClick={() => {
              setSelectedContent(item);
              setShowPreview(true);
            }}
          >
            <Video className="w-12 h-12 text-slate-400" />
          </div>
        )}
        <Badge 
          className="absolute top-2 right-2"
          variant={item.content.contentType === "image" ? "default" : "secondary"}
        >
          {item.content.contentType === "image" ? (
            <><Image className="w-3 h-3 ml-1" /> صورة</>
          ) : (
            <><Video className="w-3 h-3 ml-1" /> فيديو</>
          )}
        </Badge>
        {item.content.status === "pending" && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">
            <Clock className="w-3 h-3 ml-1" /> بانتظار المراجعة
          </Badge>
        )}
        {item.content.status === "approved" && (
          <Badge className="absolute top-2 left-2 bg-green-500">
            <CheckCircle className="w-3 h-3 ml-1" /> تمت الموافقة
          </Badge>
        )}
        {item.content.status === "rejected" && (
          <Badge className="absolute top-2 left-2 bg-red-500">
            <XCircle className="w-3 h-3 ml-1" /> مرفوض
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">{item.student?.fullName || "غير معروف"}</span>
            <Badge variant="outline" className="text-xs">
              {item.student?.grade} / {getSectionLabel(item.student?.section)}
            </Badge>
          </div>
          {item.content.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{item.content.description}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(item.content.createdAt)}</span>
            <span>{formatFileSize(item.content.fileSize)}</span>
          </div>
          {showActions && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(item.content.id)}
                disabled={approveMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 ml-1" />
                تم (+10)
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => handleReject(item.content.id)}
                disabled={rejectMutation.isPending}
              >
                <XCircle className="w-4 h-4 ml-1" />
                لا
              </Button>
            </div>
          )}
          {item.content.reviewedBy && (
            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
              راجعه: {item.content.reviewedBy}
              {item.content.reviewedAt && ` - ${formatDate(item.content.reviewedAt)}`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Button
              variant="ghost"
              className="text-white hover:bg-slate-700"
              onClick={() => setLocation("/admin")}
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              العودة
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">إدارة المحتوى</h1>
              <p className="text-sm text-slate-300">مراجعة الصور والفيديوهات</p>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:bg-slate-700"
              onClick={() => {
                refetchPending();
                refetchApproved();
                refetchRejected();
                refetchCount();
              }}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6 px-4">
        {/* Filter Section */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-white">فلترة المحتوى</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">الصف</label>
                <Select value={filterGrade} onValueChange={setFilterGrade}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map(grade => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">الفصل</label>
                <Select value={filterSection} onValueChange={setFilterSection}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="اختر الفصل" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map(section => (
                      <SelectItem key={section.value} value={section.value}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending" className="relative">
              بانتظار المراجعة
              {pendingCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px]">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">تمت الموافقة</TabsTrigger>
            <TabsTrigger value="rejected">مرفوض</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-300">جاري التحميل...</p>
              </div>
            ) : filteredPending.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">لا يوجد محتوى بانتظار المراجعة</h3>
                  <p className="text-muted-foreground">
                    {filterGrade !== "all" || filterSection !== "all" 
                      ? "لا يوجد محتوى يطابق الفلترة المحددة"
                      : "سيظهر هنا المحتوى الجديد من الطلاب"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPending.map((item: any) => (
                  <ContentCard key={item.content.id} item={item} showActions />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {filteredApproved.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">لا يوجد محتوى معتمد</h3>
                  <p className="text-muted-foreground">
                    {filterGrade !== "all" || filterSection !== "all" 
                      ? "لا يوجد محتوى يطابق الفلترة المحددة"
                      : "سيظهر هنا المحتوى الذي تمت الموافقة عليه"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApproved.map((item: any) => (
                  <ContentCard key={item.content.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {filteredRejected.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">لا يوجد محتوى مرفوض</h3>
                  <p className="text-muted-foreground">
                    {filterGrade !== "all" || filterSection !== "all" 
                      ? "لا يوجد محتوى يطابق الفلترة المحددة"
                      : "سيظهر هنا المحتوى المرفوض"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRejected.map((item: any) => (
                  <ContentCard key={item.content.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              معاينة المحتوى
            </DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              {/* Media Preview */}
              <div className="rounded-lg overflow-hidden bg-black">
                {selectedContent.content.contentType === "image" ? (
                  <img
                    src={selectedContent.content.fileUrl}
                    alt="محتوى"
                    className="w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <video
                    src={selectedContent.content.fileUrl}
                    controls
                    className="w-full max-h-[60vh]"
                  />
                )}
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">الطالب:</span>
                  <span className="font-bold mr-2">{selectedContent.student?.fullName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الصف / الفصل:</span>
                  <span className="font-bold mr-2">
                    {selectedContent.student?.grade} / {getSectionLabel(selectedContent.student?.section)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">النوع:</span>
                  <span className="font-bold mr-2">
                    {selectedContent.content.contentType === "image" ? "صورة" : "فيديو"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">الحجم:</span>
                  <span className="font-bold mr-2">{formatFileSize(selectedContent.content.fileSize)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="font-bold mr-2">{formatDate(selectedContent.content.createdAt)}</span>
                </div>
                {selectedContent.content.description && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">الوصف:</span>
                    <p className="font-bold mt-1">{selectedContent.content.description}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedContent.content.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedContent.content.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="w-5 h-5 ml-2" />
                    تم - إضافة 10 نقاط
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedContent.content.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="w-5 h-5 ml-2" />
                    لا - رفض
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
