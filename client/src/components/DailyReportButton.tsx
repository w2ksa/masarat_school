import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export function DailyReportButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: reportData, refetch } = trpc.students.getDailyReport.useQuery(undefined, {
    enabled: false, // Don't fetch automatically
  });

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const result = await refetch();
      
      if (!result.data) {
        toast.error("فشل في تحميل التقرير");
        return;
      }

      const report = result.data;
      
      // Create CSV content
      let csvContent = "الترتيب,الاسم,الصف,النقاط\n";
      for (const student of report.students) {
        csvContent += `${student.rank},"${student.fullName}",${student.grade},${student.score}\n`;
      }
      
      // Add summary at the end
      csvContent += `\n\nإحصائيات عامة\n`;
      csvContent += `إجمالي الطلاب,${report.totalStudents}\n`;
      csvContent += `متوسط النقاط,${report.averageScore}\n`;
      csvContent += `\n\nإحصائيات حسب الصف\n`;
      csvContent += `الصف,عدد الطلاب,متوسط النقاط\n`;
      for (const [grade, stats] of Object.entries(report.gradeStats)) {
        csvContent += `${grade},${stats.count},${stats.avgScore}\n`;
      }
      
      // Create download link
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Format date for filename
      const date = new Date().toISOString().split('T')[0];
      link.download = `تقرير_يومي_${date}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("تم تحميل التقرير اليومي بنجاح");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("حدث خطأ أثناء تحميل التقرير");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      className="w-full"
      variant="outline"
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          جاري التحميل...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 ml-2" />
          تحميل التقرير اليومي (CSV)
        </>
      )}
    </Button>
  );
}
