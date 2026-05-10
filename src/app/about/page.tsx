import { Target, Users, ShieldCheck, TrendingUp } from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/layout/PublicLayout';
import { UniversityLogo } from '@/components/branding/Logo';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />

      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <UniversityLogo size="md" className="brightness-0 invert mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">التعريف العام</h1>
          <p className="text-xl text-gold-200">منصة جدير في سطور</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="institutional-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary-700 mb-4">ما هي منصة جدير؟</h2>
            <p className="text-darkgray leading-loose text-lg">
              منصة جدير منصة مؤسسية ذكية لقياس الجدارة القيادية، طوّرتها جامعة نايف العربية للعلوم
              الأمنية لتمكين موظفي المنظمة من إثبات جاهزيتهم القيادية بطريقة منظمة وعادلة، وتمكين
              القيادة من اكتشاف الكفاءات الظاهرة والمخفية عبر منهجية متعددة المصادر تخضع للحوكمة.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="institutional-card p-6 border-r-4 border-gold-500">
              <Target className="h-8 w-8 text-gold-700 mb-3" />
              <h3 className="text-lg font-bold text-primary-700 mb-2">الفكرة</h3>
              <p className="text-sm text-darkgray leading-relaxed">
                منصة واحدة تجمع: ملف قيادي + مبادرات + مؤشرات أداء + اختبارات ذكية + تقييم 360 +
                تحليل ذكي + قرار حوكمي = بطاقة قيادية موثقة.
              </p>
            </div>

            <div className="institutional-card p-6 border-r-4 border-primary-600">
              <Users className="h-8 w-8 text-primary-600 mb-3" />
              <h3 className="text-lg font-bold text-primary-700 mb-2">المنهجية</h3>
              <p className="text-sm text-darkgray leading-relaxed">
                سبعة محاور تقييم بأوزان قابلة للتعديل، تقييم 360 من دائرة ثقة قيادية، تحليل ذكي مساعد،
                ومراجعة لجنة حوكمة قبل اعتماد أي تصنيف.
              </p>
            </div>

            <div className="institutional-card p-6 border-r-4 border-sage">
              <ShieldCheck className="h-8 w-8 text-sage mb-3" />
              <h3 className="text-lg font-bold text-primary-700 mb-2">الحوكمة</h3>
              <p className="text-sm text-darkgray leading-relaxed">
                لجنة الحوكمة تعتمد المقيمين، تراجع التحيز، تصدر القرارات الموثقة. لا اعتماد لتصنيف
                دون قرار اللجنة، ولا حذف لسجل التدقيق.
              </p>
            </div>

            <div className="institutional-card p-6 border-r-4 border-steelblue">
              <TrendingUp className="h-8 w-8 text-steelblue mb-3" />
              <h3 className="text-lg font-bold text-primary-700 mb-2">القيمة</h3>
              <p className="text-sm text-darkgray leading-relaxed">
                للقيادة: رؤية أوضح وبدائل أكثر. للموظف: فرصة عادلة لإثبات الأثر. للموارد البشرية:
                خطط تطوير مبنية على بيانات. للمنظمة: استدامة قيادية.
              </p>
            </div>
          </div>

          <div className="institutional-card p-8 bg-gradient-to-br from-gold-50 to-white">
            <h3 className="text-xl font-bold text-primary-700 mb-3">المستفيدون</h3>
            <ul className="space-y-2 text-darkgray">
              <li className="flex items-start gap-2">
                <span className="text-gold-600 font-bold">•</span>
                <span>
                  <strong className="text-primary-700">القيادة العليا</strong> — لاتخاذ قرارات تكليف
                  مدعومة بالبيانات.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 font-bold">•</span>
                <span>
                  <strong className="text-primary-700">الموظف المتقدم</strong> — لإثبات قدراته
                  وأثره بطريقة منظمة.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 font-bold">•</span>
                <span>
                  <strong className="text-primary-700">الموارد البشرية</strong> — لبناء مسارات
                  تطوير مبنية على فجوات حقيقية.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 font-bold">•</span>
                <span>
                  <strong className="text-primary-700">لجنة الحوكمة</strong> — لضبط العدالة وتوثيق
                  القرارات.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-600 font-bold">•</span>
                <span>
                  <strong className="text-primary-700">المنظمة ككل</strong> — لاستدامة القيادة وعدالة
                  الفرص.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
