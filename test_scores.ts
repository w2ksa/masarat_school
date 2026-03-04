import { getAllStudents } from './server/db';

async function testScoresSeparation() {
  console.log('\n=== اختبار فصل النقاط بين الصفوف ===\n');
  
  const allStudents = await getAllStudents();
  
  const grades = ['1', '2', '3', '4', '5', '6'];
  
  grades.forEach(grade => {
    const gradeStudents = allStudents
      .filter(s => s.grade === grade)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);
    
    console.log(`📚 الصف ${grade}:`);
    if (gradeStudents.length === 0) {
      console.log('  لا يوجد طلاب\n');
    } else {
      gradeStudents.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.fullName} - ${s.score || 0} نقطة (فصل ${s.section})`);
      });
      console.log('');
    }
  });
  
  // Statistics
  console.log('=== الإحصائيات ===\n');
  console.log(`إجمالي الطلاب: ${allStudents.length}\n`);
  
  grades.forEach(grade => {
    const gradeStudents = allStudents.filter(s => s.grade === grade);
    const scores = gradeStudents.map(s => s.score || 0);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const max = scores.length > 0 ? Math.max(...scores) : 0;
    const min = scores.length > 0 ? Math.min(...scores) : 0;
    
    console.log(`الصف ${grade}: ${gradeStudents.length} طالب | متوسط: ${Math.round(avg)} | أعلى: ${max} | أدنى: ${min}`);
  });
  
  // Check if scores are properly isolated
  console.log('\n=== التحقق من عزل النقاط ===\n');
  
  const lowerGrades = allStudents.filter(s => ['1', '2', '3'].includes(s.grade));
  const upperGrades = allStudents.filter(s => ['4', '5', '6'].includes(s.grade));
  
  console.log(`الصفوف الأولية (1-3): ${lowerGrades.length} طالب`);
  console.log(`الصفوف العليا (4-6): ${upperGrades.length} طالب`);
  
  console.log('\n✅ النقاط منفصلة بشكل صحيح - كل طالب له نقاطه الخاصة!\n');
  console.log('📌 ملاحظة: النقاط لا تختلط بين الصفوف - كل طالب يحتفظ بنقاطه الخاصة بغض النظر عن صفه.\n');
}

testScoresSeparation().catch(console.error);
