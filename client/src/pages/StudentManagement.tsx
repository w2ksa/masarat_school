import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Plus, Trash2, Edit, ArrowRight, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function StudentManagement() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("__all__");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState("أول");
  const [newStudentSection, setNewStudentSection] = useState<number>(1);
  const [editingStudent, setEditingStudent] = useState<{ id: number; name: string } | null>(null);

  // Check authentication - check localStorage first, then sessionStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole") || sessionStorage.getItem("userRole");
    const isAuth = localStorage.getItem("isAuthenticated") || sessionStorage.getItem("isAuthenticated");
    
    if (role !== "admin" || isAuth !== "true") {
      toast.error("يجب تسجيل الدخول كمدير");
      setLocation("/login");
    } else {
      sessionStorage.setItem("userRole", role);
      sessionStorage.setItem("isAuthenticated", isAuth);
    }
  }, [setLocation]);

  const { data: students, isLoading } = trpc.students.list.useQuery({ 
    grade: selectedGrade === "__all__" ? undefined : selectedGrade 
  });
  const utils = trpc.useUtils();

  // @ts-ignore - section field added in server
  const addStudentMutation = trpc.students.addStudent.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      toast.success("تم إضافة الطالب بنجاح");
      setIsAddDialogOpen(false);
      setNewStudentName("");
      setNewStudentGrade("أول");
      setNewStudentSection(1);
    },
    onError: (error) => {
      toast.error(`فشل إضافة الطالب: ${error.message}`);
    },
  });

  const deleteStudentMutation = trpc.students.deleteStudent.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      toast.success("تم حذف الطالب بنجاح");
    },
    onError: (error) => {
      toast.error(`فشل حذف الطالب: ${error.message}`);
    },
  });

  const updateStudentMutation = trpc.students.updateStudentName.useMutation({
    onSuccess: () => {
      utils.students.list.invalidate();
      toast.success("تم تحديث اسم الطالب بنجاح");
      setIsEditDialogOpen(false);
      setEditingStudent(null);
    },
    onError: (error) => {
      toast.error(`فشل تحديث الاسم: ${error.message}`);
    },
  });

  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      toast.error("يرجى إدخال اسم الطالب");
      return;
    }
    (addStudentMutation as any).mutate({ 
      fullName: newStudentName.trim(), 
      grade: newStudentGrade,
      section: newStudentSection
    });
  };

  const handleDeleteStudent = (id: number) => {
    deleteStudentMutation.mutate({ id });
  };

  const handleEditStudent = () => {
    if (!editingStudent || !editingStudent.name.trim()) {
      toast.error("يرجى إدخال اسم صحيح");
      return;
    }
    updateStudentMutation.mutate({ id: editingStudent.id, fullName: editingStudent.name.trim() });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("تم تسجيل الخروج بنجاح");
    setLocation("/login");
  };

  const filteredStudents = students?.filter((student) =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">إدارة الطلاب</h1>
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
              <Button variant="ghost" onClick={() => setLocation("/admin")} className="text-slate-300 text-sm flex-1 sm:flex-none">
                <ArrowRight className="w-4 h-4 ml-1" />
                <span className="hidden sm:inline">لوحة التحكم</span>
                <span className="sm:hidden">رجوع</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="text-sm">
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">قائمة الطلاب {selectedGrade !== "__all__" ? `- الصف ${selectedGrade}` : "- جميع الصفوف"}</CardTitle>
                <CardDescription className="text-slate-400">
                  إجمالي: {filteredStudents?.length || 0} طالب
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة طالب جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">إضافة طالب جديد</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      أدخل اسم الطالب الكامل والصف
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName" className="text-white">اسم الطالب الكامل</Label>
                      <Input
                        id="studentName"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="مثال: أحمد محمد علي"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentGrade" className="text-white">الصف</Label>
                      <Select value={newStudentGrade} onValueChange={setNewStudentGrade}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="أول">الصف الأول الابتدائي</SelectItem>
                          <SelectItem value="ثاني">الصف الثاني الابتدائي</SelectItem>
                          <SelectItem value="ثالث">الصف الثالث الابتدائي</SelectItem>
                          <SelectItem value="رابع">الصف الرابع الابتدائي</SelectItem>
                          <SelectItem value="خامس">الصف الخامس الابتدائي</SelectItem>
                          <SelectItem value="سادس">الصف السادس الابتدائي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentSection" className="text-white">الفصل</Label>
                      <Select value={newStudentSection.toString()} onValueChange={(v) => setNewStudentSection(parseInt(v))}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">فصل أ</SelectItem>
                          <SelectItem value="2">فصل ب</SelectItem>
                          <SelectItem value="3">فصل ج</SelectItem>
                          <SelectItem value="4">فصل د</SelectItem>
                          <SelectItem value="5">فصل هـ</SelectItem>
                          <SelectItem value="6">فصل و</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleAddStudent} disabled={addStudentMutation.isPending}>
                      {addStudentMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="ابحث عن طالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Students List */}
            {isLoading ? (
              <div className="text-center text-slate-400 py-8">جاري التحميل...</div>
            ) : filteredStudents && filteredStudents.length > 0 ? (
              <div className="space-y-2">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-slate-400 font-medium">{index + 1}.</span>
                      <span className="text-white">{student.fullName}</span>
                      <span className="text-xs text-blue-400">الصف {student.grade} - فصل {student.section}</span>
                      <span className="text-xs text-slate-400">({student.score} نقطة)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingStudent({ id: student.id, name: student.fullName });
                          setIsEditDialogOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              هل أنت متأكد من حذف الطالب "{student.fullName}"؟ هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
                              إلغاء
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteStudent(student.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">لا توجد نتائج</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">تعديل اسم الطالب</DialogTitle>
            <DialogDescription className="text-slate-400">
              قم بتعديل الاسم الكامل للطالب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName" className="text-white">اسم الطالب الكامل</Label>
              <Input
                id="editName"
                value={editingStudent?.name || ""}
                onChange={(e) =>
                  setEditingStudent(editingStudent ? { ...editingStudent, name: e.target.value } : null)
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditStudent} disabled={updateStudentMutation.isPending}>
              {updateStudentMutation.isPending ? "جاري التحديث..." : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
