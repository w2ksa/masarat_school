import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24 * 30, // البيانات صالحة لمدة شهر كامل
      gcTime: 1000 * 60 * 60 * 24 * 30, // الاحتفاظ بالبيانات في الذاكرة لمدة شهر
      refetchOnWindowFocus: false, // لا تحديث عند التركيز على النافذة
      refetchOnMount: false, // لا تحديث عند التحميل
      refetchOnReconnect: false, // لا تحديث عند إعادة الاتصال
      retry: false, // لا إعادة محاولة - لتجنب طلبات تسجيل الدخول المتكررة
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  
  // إذا كان خطأ مصادقة (10001)، نوجه للصفحة الرئيسية
  if (error.message.includes('10001')) {
    console.log("[خطأ مصادقة] - التوجيه للصفحة الرئيسية");
    window.location.href = '/';
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
