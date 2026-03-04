import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StudentHistoryButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  
  // Get all students
  const { data: students } = trpc.students.list.useQuery({});
  
  // Get student history (enabled only when student is selected)
  const { data: historyData, refetch } = trpc.scoreHistory.getByStudent.useQuery(
    { studentId: selectedStudentId! },
    { enabled: false }
  );

  const handleDownload = async () => {
    if (!selectedStudentId) {
      toast.error("الرجاء اختيار طالب أولاً");
      return;
    }

    try {
      setIsDownloading(true);
      const result = await refetch();
      
      if (!result.data || result.data.length === 0) {
        toast.error("لا يوجد سجل لهذا الطالب");
        return;
      }

      const history = result.data;
      const student = students?.find(s => s.id === selectedStudentId);
      
      if (!student) {
        toast.error("لم يتم العثور على الطالب");
        return;
      }

      // Create text content for PDF
      let content = `سجل الطالب التفصيلي\n\n`;
      content += `الاسم: ${student.fullName}\n`;
      content += `الصف: ${student.grade}\n`;
      content += `النقاط الحالية: ${student.score}\n`;
      content += `\n${"=".repeat(60)}\n\n`;
      content += `السجل التاريخي (من الأحدث للأقدم):\n\n`;
      
      for (const entry of history) {
        const date = new Date(entry.createdAt);
        content += `التاريخ: ${date.toLocaleDateString("ar-SA")} - ${date.toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}\n`;
        content += `البند: ${entry.categoryName}\n`;
        content += `التغيير: ${entry.pointsChange > 0 ? "+" : ""}${entry.pointsChange} نقطة\n`;
        content += `النقاط: ${entry.previousScore} → ${entry.newScore}\n`;
        content += `بواسطة: ${entry.performedBy}\n`;
        if (entry.comment) {
          content += `التعليق: ${entry.comment}\n`;
        }
        content += `${"-".repeat(60)}\n\n`;
      }
      
      // Create download link (as text file for now, can be converted to PDF later)
      const blob = new Blob(["\ufeff" + content], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Format date for filename
      const date = new Date().toISOString().split('T')[0];
      link.download = `سجل_${student.fullName}_${date}.txt`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("تم تحميل سجل الطالب بنجاح");
    } catch (error) {
      console.error("Error downloading student history:", error);
      toast.error("حدث خطأ أثناء تحميل السجل");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Select
        value={selectedStudentId?.toString() || ""}
        onValueChange={(value) => setSelectedStudentId(parseInt(value))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="اختر طالباً..." />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {students?.map((student) => (
            <SelectItem key={student.id} value={student.id.toString()}>
              {student.fullName} - {student.grade} - {student.score} نقطة
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        onClick={handleDownload}
        className="w-full"
        variant="outline"
        disabled={isDownloading || !selectedStudentId}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            جاري التحميل...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 ml-2" />
            تحميل سجل الطالب
          </>
        )}
      </Button>
    </div>
  );
}
