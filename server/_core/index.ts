import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.set("trust proxy", 1);

  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");
  const host = process.env.HOST || "0.0.0.0";

  server.listen(port, host, async () => {
    console.log(`Server running on http://${host}:${port}/`);

    // طباعة حالة الاتصال بقاعدة البيانات بوضوح في سجلات التشغيل
    try {
      const { getDbStatus } = await import("../db");
      const status = await getDbStatus();
      if (status.connected) {
        console.log("[Database] ✅ متصل بقاعدة البيانات — البيانات تُحفظ بشكل دائم.");
      } else {
        console.warn(
          `[Database] ⚠️  غير متصل بقاعدة البيانات (${status.reason || "سبب غير معروف"}). ` +
            "الموقع يعمل بنسخة مؤقتة في الذاكرة وستُفقد البيانات عند إعادة التشغيل. " +
            "اضبط DATABASE_URL (أو اربط خدمة MySQL في Railway)."
        );
      }
    } catch (e) {
      console.warn("[Database] تعذّر فحص حالة الاتصال:", e);
    }
  });
}

startServer().catch(console.error);
