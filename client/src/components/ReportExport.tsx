import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export function ReportExport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: reportData, refetch } = trpc.reports.generateWeeklyReport.useQuery();

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      // إعادة جلب البيانات للتأكد من أنها محدثة
      const { data } = await refetch();
      
      if (!data) {
        toast.error("لا توجد بيانات لتصدير التقرير");
        setIsGenerating(false);
        return;
      }

      // إنشاء محتوى HTML للتقرير
      const reportHTML = generateReportHTML(data);
      
      // فتح نافذة جديدة للطباعة
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        
        // الانتظار قليلاً لتحميل المحتوى ثم فتح نافذة الطباعة
        setTimeout(() => {
          printWindow.print();
          toast.success("تم فتح نافذة الطباعة - يمكنك حفظ التقرير كـ PDF");
        }, 500);
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تصدير التقرير");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportHTML = (data: any) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const getMotivationalLevel = (score: number): string => {
      if (score >= 500) return "قُدوة";
      if (score >= 400) return "مُتميز";
      if (score >= 300) return "مُنضبط";
      if (score >= 200) return "مُجتهد";
      if (score >= 100) return "مُبادر";
      return "طالب مبتدئ";
    };

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير أسبوعي - مسارات</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', sans-serif;
      background: white;
      color: #1e293b;
      padding: 40px;
      line-height: 1.6;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
    }
    
    .header h1 {
      font-size: 32px;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 16px;
      color: #64748b;
    }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 24px;
      color: #1e40af;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-card .value {
      font-size: 36px;
      font-weight: bold;
      color: #1e40af;
    }
    
    .stat-card .label {
      font-size: 14px;
      color: #64748b;
      margin-top: 8px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    th {
      background: #1e40af;
      color: white;
      padding: 12px;
      text-align: right;
      font-weight: 600;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      text-align: right;
    }
    
    tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .rank-badge {
      display: inline-block;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      text-align: center;
      line-height: 30px;
      font-weight: bold;
    }
    
    .rank-badge.gold {
      background: #f59e0b;
    }
    
    .rank-badge.silver {
      background: #94a3b8;
    }
    
    .rank-badge.bronze {
      background: #ea580c;
    }
    
    .footer {
      margin-top: 60px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 تقرير أسبوعي</h1>
    <h2>مسارات</h2>
    <p>${formattedDate}</p>
    <p>الصف الرابع الابتدائي</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="value">${data.totalStudents}</div>
      <div class="label">إجمالي الطلاب</div>
    </div>
    <div class="stat-card">
      <div class="value">${data.topVotedStudents.length}</div>
      <div class="label">الطلاب المصوت عليهم</div>
    </div>
    <div class="stat-card">
      <div class="value">${data.currentPeriod?.status === 'open' ? 'مفتوح' : 'مغلق'}</div>
      <div class="label">حالة التصويت</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">🏆 أعلى 10 طلاب حسب النقاط</h2>
    <table>
      <thead>
        <tr>
          <th>الترتيب</th>
          <th>اسم الطالب</th>
          <th>النقاط</th>
          <th>المستوى</th>
        </tr>
      </thead>
      <tbody>
        ${data.topStudents.map((student: any, index: number) => {
          const level = getMotivationalLevel(student.score || 0);
          const badgeClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
          return `
            <tr>
              <td><span class="rank-badge ${badgeClass}">${index + 1}</span></td>
              <td>${student.fullName}</td>
              <td>${student.score || 0}</td>
              <td>${level}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>

  ${data.topVotedStudents.length > 0 ? `
  <div class="section">
    <h2 class="section-title">⭐ أعلى 5 طلاب حصلوا على تصويتات</h2>
    <table>
      <thead>
        <tr>
          <th>الترتيب</th>
          <th>اسم الطالب</th>
          <th>عدد التصويتات</th>
        </tr>
      </thead>
      <tbody>
        ${data.topVotedStudents.map((item: any, index: number) => {
          const badgeClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
          return `
            <tr>
              <td><span class="rank-badge ${badgeClass}">${index + 1}</span></td>
              <td>${item.student?.fullName || 'غير معروف'}</td>
              <td>${item.count}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="section">
    <h2 class="section-title">📋 ترتيب جميع الطلاب</h2>
    <table>
      <thead>
        <tr>
          <th>الترتيب</th>
          <th>اسم الطالب</th>
          <th>النقاط</th>
        </tr>
      </thead>
      <tbody>
        ${data.students.slice(0, 50).map((student: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${student.fullName}</td>
            <td>${student.score || 0}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${data.students.length > 50 ? `<p style="text-align: center; margin-top: 20px; color: #64748b;">وعرض ${data.students.length - 50} طالب آخرين...</p>` : ''}
  </div>

  <div class="footer">
    <p>تم إنشاء هذا التقرير تلقائياً بواسطة مسارات</p>
    <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
  </div>
</body>
</html>
    `;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          تصدير التقارير
        </CardTitle>
        <CardDescription>
          قم بتصدير تقرير أسبوعي شامل يحتوي على إحصائيات الطلاب والتصويتات
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <h4 className="font-semibold text-foreground mb-2">محتويات التقرير:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>إحصائيات عامة (عدد الطلاب، حالة التصويت)</li>
              <li>أعلى 10 طلاب حسب النقاط</li>
              <li>أعلى 5 طلاب حصلوا على تصويتات</li>
              <li>ترتيب جميع الطلاب حسب النقاط</li>
            </ul>
          </div>

          <Button
            onClick={handleExportPDF}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                جاري إنشاء التقرير...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 ml-2" />
                تصدير التقرير كـ PDF
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            سيتم فتح نافذة الطباعة - اختر "حفظ كـ PDF" لتحميل التقرير
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
