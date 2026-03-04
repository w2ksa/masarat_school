import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const teacherNames = [
  'عيسى علي عسيري',
  'عصام سمير حسن عاشور',
  'فكري فكري شحاتة عبدالعاطي',
  'أحمد جمعة محمود علي',
  'أحمد إبراهيم يحيى عايض شويل',
  'فارس محمد آل الشيخ',
  'ريان مسفر جبران القحطاني',
  'عبدالله بن محمد الزهراني',
  'سمير نبيل عبد الفتاح',
  'احمد يحيى عوض الباز',
  'محمد حامد عبد الكريم',
  'محمود حمدي محمود',
  'السيد عبد الرازق البلتاجي',
  'محمد علاء السيد',
  'أشرف إسماعيل عبد الرحمن',
  'عبدالمجيد الحسين سليمان الحفظي',
  'أحمد محمود صابر محمود',
  'ناصر محمد عبد العليم علي',
  'هاني محمد عبد البصير',
  'أحمد سامي أحمد النجار',
  'محمد ربيع يونس عبدالغني',
  'محمد عاشور السيد أحمد',
  'محمد المتولي  البارودي',
  'محمد حلمي محمد عبده',
  'سراج الرحمن كمال فاضل',
  'احمد محمد جلال جمعه',
  'عبد الحميد ظريف عبدالمجيد ضبون',
  'السيد رضا عبده ابراهيم',
  'السيد منصور فكري محمد',
  'عصام الدين محمد علي',
  'علي عبد الله فرحان عسيري',
  'فهد أحمد فائع عسيري',
  'عبد الصادق شورى عبدالصادق',
  'محمد السيد اليماني بسيوني',
  'ياسر عزت عبدالمعطي جميل',
  'رضا السيد رضا عبده',
  'خالد أبو المجد أحمد',
  'ياسر أحمد محمد الشهري',
  'بدر فريد سعد عسيري',
  'خليل عبدالله سعيد حدري',
  'سعود آل زايد'
];

const TEACHER_PASSWORD = 'aA12@gsA';

export default function TeacherLogin() {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [password, setPassword] = useState('');
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    if (!selectedTeacher) {
      toast.error('الرجاء اختيار اسم المعلم');
      return;
    }

    if (password !== TEACHER_PASSWORD) {
      toast.error('كلمة المرور غير صحيحة');
      return;
    }

    // Save teacher name in session storage
    sessionStorage.setItem('teacherName', selectedTeacher);
    
    toast.success(`مرحباً ${selectedTeacher}`);
    setLocation('/teacher/voting');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">تسجيل دخول المعلمين</h1>
          <p className="text-slate-400">مسارات - ابتدائية أبها الأهلية</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              اسم المعلم
            </label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-full bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="اختر اسمك من القائمة" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 max-h-[300px]">
                {teacherNames.map((name) => (
                  <SelectItem key={name} value={name} className="text-white hover:bg-slate-800">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              كلمة المرور
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="أدخل كلمة المرور"
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            تسجيل الدخول
          </Button>

          <div className="text-center">
            <button
              onClick={() => setLocation('/')}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
