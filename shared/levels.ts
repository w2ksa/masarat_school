/**
 * نظام المستويات التحفيزية للطلاب
 * يتم حساب المستوى بناءً على النقاط المكتسبة
 */

export type Level = {
  name: string;
  min: number;
  max: number;
  icon: string;
  color: string;
  description: string;
};

export const LEVELS: Level[] = [
  {
    name: "طالب مبتدئ",
    min: 0,
    max: 99,
    icon: "🎯",
    color: "text-slate-400",
    description: "مرحلة التأسيس - ابدأ رحلتك نحو التميز!",
  },
  {
    name: "مُبادر",
    min: 100,
    max: 199,
    icon: "🌱",
    color: "text-green-500",
    description: "المسار الأول - أنت على الطريق الصحيح!",
  },
  {
    name: "مُجتهد",
    min: 200,
    max: 299,
    icon: "📚",
    color: "text-blue-500",
    description: "المسار الثاني - استمر في التقدم!",
  },
  {
    name: "مُنضبط",
    min: 300,
    max: 399,
    icon: "⚡",
    color: "text-purple-500",
    description: "المسار الثالث - أنت في منتصف الطريق!",
  },
  {
    name: "مُتميز",
    min: 400,
    max: 499,
    icon: "⭐",
    color: "text-orange-500",
    description: "المسار الرابع - أنت قريب من القمة!",
  },
  {
    name: "قُدوة",
    min: 500,
    max: Infinity,
    icon: "👑",
    color: "text-yellow-500",
    description: "المسار الخامس - أنت قدوة للجميع!",
  },
];

/**
 * Get student level based on score
 */
export function getStudentLevel(score: number): Level {
  const level = LEVELS.find((l) => score >= l.min && score <= l.max);
  return level || LEVELS[0];
}

/**
 * Get progress percentage within current level
 */
export function getLevelProgress(score: number): number {
  const level = getStudentLevel(score);
  if (level.max === Infinity) return 100;
  
  const range = level.max - level.min;
  const progress = score - level.min;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

/**
 * Get points needed to reach next level
 */
export function getPointsToNextLevel(score: number): number {
  const level = getStudentLevel(score);
  if (level.max === Infinity) return 0;
  
  return level.max - score + 1;
}
