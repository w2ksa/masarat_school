// قائمة الطلاب المميّزين (17) مع الصف والفصل والدرجة — مصدر موثوق متحقَّق منه (160→100).
// تُطبَّق عبر زر في لوحة التحكم: تُحدّث الموجود وتُسجّل الناقص.
export type FeaturedScore = { name: string; grade: string; section: number; score: number };

export const FEATURED_SCORES: FeaturedScore[] = [
  { name: "عبدالعزيز سعيد يحيى ال شويل", grade: "سادس", section: 1, score: 160 },
  { name: "خالد يحي محمد ال شويل", grade: "سادس", section: 3, score: 156 },
  { name: "رياض يحيى علي ال دحمس", grade: "خامس", section: 3, score: 153 },
  { name: "مهند عبدالواحد أحمد الزهراني", grade: "خامس", section: 3, score: 149 },
  { name: "خالد علي محمد الشهري", grade: "سادس", section: 3, score: 145 },
  { name: "خالد سعيد يحيى ال شويل", grade: "خامس", section: 2, score: 141 },
  { name: "نهيان محمد عبدالله مفرح", grade: "خامس", section: 4, score: 138 },
  { name: "عبدالاله عبدالله علي آل كاسي", grade: "خامس", section: 4, score: 134 },
  { name: "عمر ماجد عبدالله الشهري", grade: "خامس", section: 1, score: 130 },
  { name: "حازم عائض محمد عسيري", grade: "رابع", section: 1, score: 126 },
  { name: "بدر شتوي معيض القحطاني", grade: "رابع", section: 2, score: 123 },
  { name: "زايد حسن مريع آل حمدان", grade: "رابع", section: 4, score: 119 },
  { name: "منذر حمد عبدالله حاضر", grade: "رابع", section: 2, score: 115 },
  { name: "سعيد سفر سعيد الشهراني", grade: "سادس", section: 1, score: 111 },
  { name: "عبدالمجيد احمد ابن سعيد آل مالح", grade: "رابع", section: 2, score: 108 },
  { name: "أسامة سعد محمد السناني", grade: "خامس", section: 2, score: 104 },
  { name: "مانع محمد مانع آل محيا", grade: "رابع", section: 2, score: 100 },
];
