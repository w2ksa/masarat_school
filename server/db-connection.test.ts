import { describe, it, expect, afterEach } from "vitest";
import { resolveDatabaseUrl } from "./db";

// متغيرات قد تؤثر على النتيجة — نعيد ضبطها بعد كل اختبار
const KEYS = [
  "DATABASE_URL", "MYSQL_URL", "MYSQL_PUBLIC_URL", "DATABASE_PUBLIC_URL",
  "MYSQLHOST", "MYSQL_HOST", "MYSQLUSER", "MYSQL_USER",
  "MYSQLPASSWORD", "MYSQL_PASSWORD", "MYSQLDATABASE", "MYSQL_DATABASE",
  "MYSQLPORT", "MYSQL_PORT",
];

function clearAll() {
  for (const k of KEYS) delete process.env[k];
}

describe("resolveDatabaseUrl — اكتشاف رابط قاعدة البيانات", () => {
  afterEach(() => clearAll());

  it("يستخدم DATABASE_URL مباشرة", () => {
    clearAll();
    process.env.DATABASE_URL = "mysql://a:b@h:3306/d";
    expect(resolveDatabaseUrl()).toBe("mysql://a:b@h:3306/d");
  });

  it("يستخدم MYSQL_URL عند غياب DATABASE_URL (Railway)", () => {
    clearAll();
    process.env.MYSQL_URL = "mysql://u:p@railway:3306/db";
    expect(resolveDatabaseUrl()).toBe("mysql://u:p@railway:3306/db");
  });

  it("يبني الرابط من المتغيرات المنفصلة لـ Railway", () => {
    clearAll();
    process.env.MYSQLHOST = "containers.railway.app";
    process.env.MYSQLUSER = "root";
    process.env.MYSQLPASSWORD = "pw";
    process.env.MYSQLDATABASE = "railway";
    process.env.MYSQLPORT = "7777";
    expect(resolveDatabaseUrl()).toBe("mysql://root:pw@containers.railway.app:7777/railway");
  });

  it("يُرجع نصاً فارغاً عند عدم وجود أي متغير", () => {
    clearAll();
    expect(resolveDatabaseUrl()).toBe("");
  });
});
