import Link from 'next/link';
import { ChevronLeft, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function WhyPage() {
  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          الفرصة المؤسسية
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          لماذا تحتاج منظمتكم <span className="text-gold-400">منصة جدير؟</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          المنظمات الرائدة لا تختلف عن غيرها في امتلاك الكفاءات —
          بل في قدرتها على <strong className="text-gold-300">اكتشافها وتوظيفها في موضعها الصحيح في الوقت المناسب.</strong>
        </p>
      </section>

      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">الواقع الذي تواجهه كل منظمة كبيرة</h2>
          <p className="text-white/50 text-sm">ليست إشكالية قصور — بل إشكالية وفرة وتعقيد</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: '🔭', title: 'ثروة الكفاءات غير المرئية', body: 'في كل منظمة كبيرة توجد كفاءات استثنائية لم تصل بعد إلى دائرة الضوء القيادي، لا لقصور فيها، بل لأن الأدوات التقليدية لا تمتلك القدرة على كشفها وإيصالها.' },
            { icon: '📊', title: 'القرار بحاجة إلى سند أعمق', body: 'قرار التكليف القيادي من أشد القرارات تأثيراً وأكثرها حساسية. صاحب القرار يستحق أدوات تُعطيه ملفاً موضوعياً موثقاً يُعزز حكمته ويحمي خياره.' },
            { icon: '⚖️', title: 'الموظف يستحق فرصة عادلة للإثبات', body: 'الموظف المتميز الذي لا تصله الفرصة يخسر ومنظمته تخسر. منح قناة رسمية لإثبات الجاهزية يرفع الولاء المؤسسي ويُقلل معدلات الاستنزاف الصامت.' },
            { icon: '🏗️', title: 'الصف القيادي لا يُبنى بين عشية وضحاها', body: 'المنظمات التي تبدأ اليوم في بناء قاعدة بيانات قيادية منهجية تمتلك غداً ميزة تنافسية لا يمكن تقليدها بسرعة.' },
          ].map((item) => (
            <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-gold-400/20 transition">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/65 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary-700/30 to-transparent border border-primary-400/20 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-8">التحول المؤسسي مع منصة جدير</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="text-center text-sm font-bold text-white/40 mb-5 pb-2 border-b border-white/10">بدون منظومة متكاملة</div>
            <div className="space-y-3">
              {[
                'قرار التكليف يحتاج وقتاً أطول للتحقق والتوثيق',
                'الكفاءات المخفية تظل بعيدة عن دائرة القرار',
                'صعوبة تقييم الجاهزية من مصادر متعددة موثوقة',
                'الصف القيادي الثاني يُبنى بشكل تدريجي غير منهجي',
                'الاعتراضات على التكليف تفتقر إلى سند بيانات واضح',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/25 flex-shrink-0 mt-1.5" />{item}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-center text-sm font-bold text-gold-300 mb-5 pb-2 border-b border-gold-400/30">مع منصة جدير</div>
            <div className="space-y-3">
              {[
                'ملف موضوعي موثق يُسرّع القرار ويُحصّنه',
                'كشف الكفاءات المخفية وإيصالها لمتخذ القرار',
                'تقييم متعدد المصادر خاضع للحوكمة والمعايير',
                'بناء قاعدة بيانات قيادية حية ومتجددة',
                'قرار التكليف مدعوم بسند تحليلي لا يُطعن فيه',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400 flex-shrink-0 mt-1.5" />{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="text-center bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-10">
        <TrendingUp className="h-12 w-12 text-gold-400 mx-auto mb-5" />
        <blockquote className="text-2xl font-bold text-white mb-4 leading-relaxed">
          "القادة العظماء يمتلكون دائماً أفضل الأدوات —<br />
          <span className="text-gold-400">جدير هي الأداة التي لم تكن متاحة من قبل."</span>
        </blockquote>
        <p className="text-white/50 text-sm max-w-xl mx-auto">
          المنظومة لا تُحدد من يُكلَّف — بل تُحضّر الملف الكامل أمام قيادتكم لتتخذوا قراركم بثقة وبسند موثق.
        </p>
        <Link href="/executive-center/beneficiaries"
          className="inline-flex items-center gap-2 mt-6 text-gold-300 hover:text-gold-200 font-bold transition group">
          من يستفيد من المنصة؟ <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
