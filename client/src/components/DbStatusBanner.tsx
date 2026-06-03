import { AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * شريط تنبيه يظهر للمدير عندما يعمل الموقع بدون قاعدة بيانات متصلة.
 * في هذه الحالة تكون كل البيانات (النقاط، التصويتات) مؤقتة وتُفقد عند إعادة تشغيل الخادم.
 */
export function DbStatusBanner() {
  // @ts-ignore
  const { data } = trpc.dbStatus.useQuery(undefined, {
    staleTime: 30000,
    refetchInterval: 60000,
  });

  if (!data || data.connected) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="text-sm sm:text-base">
          <p className="font-bold">
            تحذير: الموقع غير متصل بقاعدة البيانات — البيانات الحالية مؤقتة وستُفقد عند إعادة تشغيل الخادم!
          </p>
          <p className="text-red-100 mt-1">
            السبب: {data.hasUrl ? `تعذّر الاتصال (${data.reason || "خطأ في الاتصال"})` : "لم يتم ضبط متغير DATABASE_URL"}.
            يجب ضبط <span className="font-mono bg-red-700 px-1 rounded">DATABASE_URL</span> في إعدادات الاستضافة (Railway)
            حتى تُحفظ النقاط والتصويتات بشكل دائم وتعود بياناتك السابقة.
          </p>
        </div>
      </div>
    </div>
  );
}
