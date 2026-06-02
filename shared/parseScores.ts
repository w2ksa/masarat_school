// مُحلّل نصّي لقائمة الدرجات الملصقة من المستخدم.
// كل سطر بالشكل: رقم_الترتيب  اسم الطالب  الصف  الدرجة
// (مفصولة بمسافات أو Tab). نتجاهل رقم الترتيب والصف، ونأخذ الاسم والدرجة فقط.
export type ParsedScore = { name: string; score: number };

const GRADES = new Set(["أول", "ثاني", "ثالث", "رابع", "خامس", "سادس"]);

export function parseScoresText(text: string): { rows: ParsedScore[]; skipped: string[] } {
  const rows: ParsedScore[] = [];
  const skipped: string[] = [];

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    // افصل بـ Tab أولاً؛ وإن لم تكن مفصولة بـ Tab استخدم المسافات
    let fields = line.split("\t").map((s) => s.trim()).filter((s) => s.length > 0);
    if (fields.length < 2) fields = line.split(/\s+/);

    const score = Number(fields[fields.length - 1]);
    if (!Number.isFinite(score)) {
      skipped.push(line);
      continue;
    }

    // كل ما قبل الدرجة قد يحتوي: [رقم الترتيب] الاسم [الصف]
    let parts = fields.slice(0, fields.length - 1);
    // أزل الصف من النهاية إن وُجد
    if (parts.length && GRADES.has(parts[parts.length - 1])) {
      parts = parts.slice(0, parts.length - 1);
    }
    // أزل رقم الترتيب من البداية إن كان رقماً
    if (parts.length && /^\d+$/.test(parts[0])) {
      parts = parts.slice(1);
    }

    const name = parts.join(" ").replace(/\s+/g, " ").trim();
    if (!name) {
      skipped.push(line);
      continue;
    }
    rows.push({ name, score });
  }

  return { rows, skipped };
}
