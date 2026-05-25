import Link from 'next/link';
import { ChevronLeft, Star, TrendingUp, Award, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ThreeCardsPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          الابتكار المنهجي في قراءة الكفاءات
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          نظام <span className="text-gold-400">البطاقات الثلاث</span> المترابطة
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          لا تكتفي جدير بالبطاقة القيادية التقليدية — بل تُنتج{' '}
          <span className="text-gold-300 font-bold">ثلاث بطاقات مترابطة</span> تمنح متخذ القرار
          صورة أكثر عمقاً ونضجاً.
        </p>
      </section>

      {/* ─── المشكلة ─── */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">لماذا بطاقة واحدة لا تكفي؟</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              'شخص يمتلك سمات قيادية لكن أثره العملي ضعيف — هل يُكلَّف؟',
              'شخص حقق نتائج استثنائية لكن جاهزيته القيادية أقل — هل يُهمَل؟',
              'بطاقة واحدة تختزل واقعاً معقداً في رقم — وقد يُبنى عليها قرار مصيري.',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-400/20 rounded-xl">
                <span className="text-red-400 text-xl flex-shrink-0">✗</span>
                <p className="text-white/80 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <div className="p-6 bg-gold-500/10 border border-gold-400/30 rounded-2xl text-center">
              <p className="text-gold-300 text-lg font-bold mb-3">الحل: زاويتان + توصية</p>
              <p className="text-white/80 text-sm leading-relaxed">
                هل يملك صفات القيادة؟<br />
                وهل يملك أثراً قابلاً للقياس؟<br />
                <strong className="text-gold-300">ثم توصية واحدة محكمة.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── البطاقات الثلاث ─── */}
      <section className="space-y-5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">البطاقات الثلاث المترابطة</h2>
          <p className="text-white/50 text-sm">كل بطاقة تجيب على سؤال مختلف وتستند إلى مصادر بيانات مختلفة</p>
        </div>

        {/* البطاقة 1 */}
        <div className="bg-primary-800/60 border border-primary-400/30 rounded-2xl overflow-hidden">
          <div className="bg-primary-700 px-6 py-4 flex items-center gap-4">
            <div className="h-9 w-9 rounded-xl bg-gold-500 flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 text-primary-900" />
            </div>
            <div className="flex-1">
              <div className="text-gold-300 text-xs">البطاقة الأولى</div>
              <div className="text-white font-bold">بطاقة الجاهزية القيادية</div>
            </div>
            <div className="text-gold-300 text-xs bg-gold-500/20 px-3 py-1 rounded-lg font-bold">
              هل يملك صفات القيادة؟
            </div>
          </div>
          <div className="p-5 grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-xs mb-2 font-bold">ما تقيسه:</p>
              {['الجاهزية والسلوك القيادي','التأثير والمبادرة','النضج المهني وتحمل المسؤولية','قابلية التطوير','نتائج تقييم 360 درجة'].map((t,i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/70 mb-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary-300 flex-shrink-0" />{t}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white/60 text-xs mb-2 font-bold">المصادر:</p>
              {['المحاور السبعة للجاهزية','تقييم 360 درجة المعتمد','الاختبارات الذكية التكيفية','تحليل الذكاء الاصطناعي'].map((t,i) => (
                <span key={i} className="inline-flex text-xs bg-primary-500/30 text-primary-200 px-2.5 py-1 rounded-lg mr-1 mb-1.5">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* فاصل */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-5 bg-gold-400/40" />
            <span className="text-gold-400 text-xs font-bold bg-gold-500/10 border border-gold-400/30 px-3 py-1 rounded-full">تُكمل الأولى</span>
            <div className="w-px h-5 bg-gold-400/40" />
          </div>
        </div>

        {/* البطاقة 2 */}
        <div className="bg-gold-900/60 border border-gold-400/30 rounded-2xl overflow-hidden">
          <div className="bg-gold-700 px-6 py-4 flex items-center gap-4">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-gold-200 text-xs">البطاقة الثانية</div>
              <div className="text-white font-bold">بطاقة الأداء المتوازن</div>
            </div>
            <div className="text-gold-200 text-xs bg-white/10 px-3 py-1 rounded-lg font-bold">
              هل يملك أثراً عملياً؟
            </div>
          </div>
          <div className="p-5 grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-xs mb-2 font-bold">الأبعاد السبعة:</p>
              {['الأثر المؤسسي الفعلي','جودة الإنجاز والمخرجات','المبادرات والريادة','التعلم والتطوير','العلاقات والعمل الجماعي','الكفاءة التشغيلية','المساهمة في أهداف المنظمة'].map((t,i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/70 mb-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold-300 flex-shrink-0" />{t}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white/60 text-xs mb-2 font-bold">المصادر:</p>
              {['المبادرات الموثقة بالشواهد','مؤشرات الأداء الرسمية (KPIs)','نتائج الاختبارات الذكية','محور الفريق في تقييم 360'].map((t,i) => (
                <span key={i} className="inline-flex text-xs bg-gold-500/20 text-gold-200 px-2.5 py-1 rounded-lg mr-1 mb-1.5">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* فاصل */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-5 bg-sage/40" />
            <span className="text-sage text-xs font-bold bg-sage/10 border border-sage/30 px-3 py-1 rounded-full">تُنتجان معاً</span>
            <div className="w-px h-5 bg-sage/40" />
          </div>
        </div>

        {/* البطاقة 3 */}
        <div className="bg-green-900/60 border border-sage/30 rounded-2xl overflow-hidden">
          <div className="bg-sage px-6 py-4 flex items-center gap-4">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-green-100 text-xs">البطاقة الثالثة</div>
              <div className="text-white font-bold">بطاقة التوصية النهائية</div>
            </div>
            <div className="text-green-100 text-xs bg-white/10 px-3 py-1 rounded-lg font-bold">
              ما مسار هذا المرشح؟
            </div>
          </div>
          <div className="p-5">
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { icon: '🏆', label: 'تمكين قيادي فوري', when: 'جاهزية عالية + أثر عالٍ' },
                { icon: '🎯', label: 'تمكين مع خطة تطوير', when: 'جاهزية عالية + أثر يحتاج تعزيزاً' },
                { icon: '📈', label: 'برنامج إعداد قيادي', when: 'أثر عالٍ + جاهزية تحتاج تطويراً' },
                { icon: '🌱', label: 'مسار تطوير موجّه', when: 'إمكانات واعدة تحتاج استثماراً' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="font-bold text-white text-sm mb-1">{item.icon} {item.label}</div>
                  <div className="text-white/50 text-xs">{item.when}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── الصياغة المؤسسية ─── */}
      <section className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-5">الصياغة المؤسسية</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <p className="text-white/85 text-base leading-loose">
            تعتمد منصة <span className="text-gold-400 font-bold">جدير</span> في قراءة الكفاءات القيادية على{' '}
            <strong className="text-gold-300">بطاقة الجاهزية القيادية</strong> التي تستند إلى مؤشرات الجاهزية
            والسلوك والتأثير وتقييم 360 درجة، وتُدعم بـ<strong className="text-gold-300">بطاقة الأداء المتوازن</strong>{' '}
            التي تربط كفاءة المرشح بأثره الفعلي في العمل ومبادراته وجودة إنجازه ومساهمته في تحقيق أهداف المنظمة.
          </p>
          <p className="text-white/85 text-base leading-loose">
            وبذلك لا تُبنى نتيجة المرشح على الانطباع أو الترشيح الفردي، بل على{' '}
            <strong className="text-gold-300">قراءة مركبة</strong> تجمع بين الجاهزية القيادية والأداء المؤسسي
            القابل للقياس — مما يمنح متخذ القرار صورة أكثر نضجاً ومصداقية.
          </p>
          <div className="border-t border-white/10 pt-4">
            <p className="text-gold-300/80 text-sm italic text-center">
              من يملك الجاهزية، ومن يملك الأثر، ومن يستحق الاستثمار القيادي القادم —
              هذا ما تُجيب عنه منصة جدير بدقة وشفافية وموضوعية.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="text-center pb-8">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/executive-center/methodology"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-primary-900 font-bold px-6 py-3 rounded-xl transition-all">
            منهجية الاحتساب <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link href="/executive-center/demo-models"
            className="inline-flex items-center gap-2 border border-gold-400/50 text-gold-200 hover:bg-white/5 px-6 py-3 rounded-xl transition">
            مشاهدة النماذج التجريبية <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
