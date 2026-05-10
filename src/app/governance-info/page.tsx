import { ShieldCheck, CheckCircle2, Users, Lock, FileText, AlertTriangle } from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/layout/PublicLayout';

export const dynamic = 'force-dynamic';
export default function GovernanceInfoPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />

      <section className="bg-gradient-to-b from-wine to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck className="h-16 w-16 text-gold-300 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">لجنة الحوكمة</h1>
          <p className="text-xl text-gold-200">صمام العدالة في منصة جدير</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="institutional-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary-700 mb-4">دور لجنة الحوكمة</h2>
            <p className="text-darkgray leading-loose text-lg mb-4">
              لجنة الحوكمة هي الجهة المسؤولة عن مراجعة ملفات المرشحين، اعتماد المقيمين، متابعة تقييم
              360، مراجعة التحليل الذكي، ضبط التحيز، اعتماد التصنيف النهائي، معالجة التظلمات،
              وتوثيق جميع القرارات.
            </p>
            <p className="text-darkgray leading-loose text-lg">
              لا اعتماد لتصنيف نهائي في منصة جدير دون مرور الملف على اللجنة. هذه القاعدة الصارمة هي
              ما يحول النتيجة من رأي شخصي إلى قرار مؤسسي موثق.
            </p>
          </div>

          <h3 className="text-2xl font-bold text-primary-700 mb-4">صلاحيات اللجنة</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              { icon: Users, title: 'اعتماد المقيمين', desc: 'مراجعة قائمة 15 مقترح، اعتماد 7-10 بنسبة 60% على الأقل من اللجنة' },
              { icon: CheckCircle2, title: 'اعتماد التصنيف النهائي', desc: 'كل تصنيف يتطلب توثيق سبب القرار قبل الاعتماد' },
              { icon: AlertTriangle, title: 'مراجعة التحيز', desc: 'كشف التقييمات المتطرفة وتضارب المصالح المحتمل' },
              { icon: FileText, title: 'معالجة التظلمات', desc: '8 أنواع تظلم مع قرارات موثقة لكل حالة' },
              { icon: Lock, title: 'سجل الحوكمة', desc: 'كل قرار حساس يُسجَّل ولا يقبل الحذف من الواجهة' },
              { icon: ShieldCheck, title: 'إعادة الملفات', desc: 'صلاحية إعادة الملف للاستكمال مع تحديد المطلوب' },
            ].map((item, i) => (
              <div key={i} className="institutional-card p-5">
                <item.icon className="h-7 w-7 text-wine mb-2" />
                <h4 className="font-bold text-primary-700 mb-1">{item.title}</h4>
                <p className="text-sm text-darkgray leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="institutional-card p-8 bg-gradient-to-br from-rose-50 to-white border-r-4 border-wine">
            <h3 className="text-xl font-bold text-primary-700 mb-3">القواعد الصارمة</h3>
            <ul className="space-y-3 text-darkgray">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-wine mt-0.5 flex-shrink-0" />
                <span>لا اعتماد لتصنيف نهائي دون قرار موثق من لجنة الحوكمة</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-wine mt-0.5 flex-shrink-0" />
                <span>كل قرار يتطلب: سبب القرار + ملاحظة حوكمية + اسم العضو + التاريخ والوقت</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-wine mt-0.5 flex-shrink-0" />
                <span>لا يمكن حذف سجل الحوكمة من الواجهة</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-wine mt-0.5 flex-shrink-0" />
                <span>لا يمكن تعديل قرار نهائي إلا بصلاحية موثقة</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-wine mt-0.5 flex-shrink-0" />
                <span>الذكاء الاصطناعي محلل مساعد، ولا يصدر قراراً نهائياً</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
