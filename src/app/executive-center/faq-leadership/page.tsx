'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, Shield, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FAQ = [
  {
    category: 'ضمانات صحة التقييم',
    q: 'كيف نضمن أن يختار الموظف مقيّمين موضوعيين؟',
    a: 'الموظف يقترح أسماء فقط — ولا يملك اعتماد أيٍّ منهم. لجنة الحوكمة هي التي تعتمد 7–10 مقيّمين، وتحدد 60٪ على الأقل منهم، وتستطيع إضافة أو استبعاد أي مقيم. هذا يجعل تركيبة المقيّمين في يد اللجنة لا المرشح.',
  },
  {
    category: 'ضمانات صحة التقييم',
    q: 'ماذا لو أرسل الموظف رابط التقييم لشخص آخر ينوب عنه؟',
    a: 'كل رابط مرتبط باسم المقيم وبريده وعلاقته بالمرشح، ويستخدم مرة واحدة فقط. المنصة تسجل وقت الفتح وعنوان الجهاز. أي حالة مشبوهة تُرفع فوراً للجنة الحوكمة مع مؤشر واضح.',
  },
  {
    category: 'ضمانات صحة التقييم',
    q: 'ماذا لو قيّم أحدهم بدافع المجاملة أو الضغينة؟',
    a: 'المنصة لا تعتمد على تقييم واحد — تحلل توزيع كل المقيّمين وتكشف التقييمات المتطرفة تلقائياً. أي مقيم خارج النطاق الطبيعي يُعرض على اللجنة مع مؤشر واضح، ويمكن استبعاده أو إعادة التقييم.',
  },
  {
    category: 'صحة البيانات والإنجازات',
    q: 'كيف نتحقق من صحة المبادرات التي يذكرها الموظف؟',
    a: 'المبادرات لا تُقبل بمجرد الكتابة — المقيّمون يُسألون عن دور المرشح الحقيقي في كل مبادرة يذكرها. أي تناقض بين ما يدّعيه المرشح وما يؤكده المقيّمون يُرفع للجنة تلقائياً.',
  },
  {
    category: 'صحة البيانات والإنجازات',
    q: 'ماذا لو كان الموظف متميزاً في الأداء لكنه لا يصلح قيادياً؟',
    a: 'المنصة تُفرّق بين الأداء العالي والجاهزية القيادية. حين يكون الأداء الرقمي مرتفعاً ورضا الفريق منخفضاً، يُصنّف المرشح كـ "صاحب إنجاز قوي — لا يناسب القيادة المباشرة حالياً" مع توصية تطوير واضحة.',
  },
  {
    category: 'دور القيادة والقرار',
    q: 'هل نتيجة المنصة تعني تعييناً مباشراً أو إلزاماً؟',
    a: 'لا. النتيجة أداة دعم قرار لا قرار تلقائي. القيادة العليا تحتفظ بالكلمة الأخيرة دائماً — ولا شيء في المنصة يُلزم أو يستبدل سلطة صاحب القرار.',
  },
  {
    category: 'دور القيادة والقرار',
    q: 'هل الذكاء الاصطناعي هو من يُصدر التصنيف القيادي النهائي؟',
    a: 'لا. الذكاء الاصطناعي يُصدر تقريراً تحليلياً أولياً وبطاقة مقترحة — لكن لا تُعتمد أي بطاقة إلا بعد مراجعة لجنة الحوكمة والتصويت على سلامة الإجراء. الذكاء الاصطناعي يُحلّل، واللجنة تعتمد، والقيادة تقرر.',
  },
  {
    category: 'دور القيادة والقرار',
    q: 'ماذا لو اعترضت القيادة على نتيجة مرشح معين؟',
    a: 'الأوزان والمعايير قابلة للتعديل وفق رؤية القيادة في أي وقت. ولجنة الحوكمة تملك آليات التظلم وإعادة المراجعة. الهدف من المنصة إضافة طبقة تحليلية — لا إلغاء الحكمة المؤسسية.',
  },
  {
    category: 'الموظف والعدالة',
    q: 'هل يمكن أن تضر المنصة الموظف الذي لا يحصل على تصنيف مرتفع؟',
    a: 'المنصة تهدف للتطوير لا العقوبة. كل مرشح — حتى من لم يصل للجاهزية — يحصل على خطة تطوير مفصلة وخارطة طريق واضحة. ولكل مرشح الحق في التظلم الرسمي ضمن آلية موثقة ومعتمدة.',
  },
  {
    category: 'الموظف والعدالة',
    q: 'كيف نكتشف الكفاءات التي لم تصل بعد إلى دائرة الضوء الإداري؟',
    a: 'المنصة تُحلّل الأنماط القيادية من خلال المبادرات، تقييم الزملاء، الأثر الفعلي، وحل المشكلات — بغض النظر عن المنصب الرسمي أو مدى الظهور الإداري. أي مرشح يُظهر مؤشرات قيادية استثنائية تصله علامة "قيادة مخفية محتملة" مع ملخص الأدلة.',
  },
  {
    category: 'تقنية وأمان',
    q: 'هل المنصة مناسبة لبيئة أمنية وأكاديمية حساسة كجامعة نايف؟',
    a: 'المنصة مبنية على ثلاثة أعمدة تناسب هذه البيئة: الحوكمة الصارمة مع لجنة مستقلة وسجل تدقيق محمي، الصلاحيات المتدرجة حيث كل طرف يرى ما يحتاجه فقط، والسرية التامة للبيانات التقييمية.',
  },
  {
    category: 'تقنية وأمان',
    q: 'ماذا لو لم يلتزم المقيّمون بالتقييم في الوقت المحدد؟',
    a: 'المنصة تعرض نسبة اكتمال التقييمات مع تذكيرات تلقائية. وتسمح للجنة بتمديد الروابط أو إضافة مقيّمين بدلاء أو إغلاق التقييم كمراجعة مشروطة — مع توثيق السبب في سجل الحوكمة.',
  },
];

const CATEGORIES = Array.from(new Set(FAQ.map(f => f.category)));

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-16 max-w-5xl mx-auto" dir="rtl">

      {/* ─── الافتتاحية ─── */}
      <section className="text-center py-6">
        <div className="inline-block bg-gold-500/15 border border-gold-400/30 rounded-full px-5 py-2 text-gold-300 text-sm font-bold mb-6">
          أسئلة نتوقع طرحها — وإجاباتها
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          أسئلة <span className="text-gold-400">وأجوبة متوقعة</span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
          أسئلة نتوقع أن تُطرح حول المنصة — نُبادر بالإجابة عليها بالأدلة قبل أن تُسأل.
        </p>
      </section>

      {/* ─── التصنيفات ─── */}
      {CATEGORIES.map((cat) => {
        const items = FAQ.filter(f => f.category === cat);
        const startIdx = FAQ.findIndex(f => f.category === cat);
        return (
          <section key={cat}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-xl bg-gold-400/15 flex items-center justify-center">
                <Shield className="h-4 w-4 text-gold-400" />
              </div>
              <h2 className="text-lg font-bold text-gold-300">{cat}</h2>
              <div className="flex-1 h-px bg-gold-400/15" />
            </div>

            <div className="space-y-3">
              {items.map((item, localIdx) => {
                const globalIdx = startIdx + localIdx;
                return (
                  <div
                    key={globalIdx}
                    className={cn(
                      'border rounded-xl overflow-hidden transition-all',
                      openIndex === globalIdx
                        ? 'border-gold-400/40 bg-gold-500/5'
                        : 'border-white/10 bg-white/5'
                    )}
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)}
                      className="w-full px-6 py-4 flex items-center justify-between gap-4 text-right hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <HelpCircle className="h-4 w-4 text-gold-400/70 flex-shrink-0" />
                        <span className="font-bold text-white text-sm leading-relaxed">{item.q}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-gold-400 flex-shrink-0 transition-transform duration-200',
                          openIndex === globalIdx && 'rotate-180'
                        )}
                      />
                    </button>
                    {openIndex === globalIdx && (
                      <div className="px-6 pb-5 pr-14 border-t border-white/5">
                        <p className="text-white/80 leading-loose text-sm pt-4">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ─── الختام ─── */}
      <section className="text-center bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-400/20 rounded-3xl p-10">
        <h2 className="text-xl font-bold text-white mb-3">
          لديك سؤال لا تجده هنا؟
        </h2>
        <p className="text-white/60 text-sm max-w-lg mx-auto leading-relaxed mb-6">
          منصة جدير مبنية على مبدأ الشفافية الكاملة مع القيادة — أي سؤال يُطرح له إجابة مدعومة بالبيانات.
        </p>
        <Link href="/executive-center/decision"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-primary-900 font-bold px-8 py-3 rounded-xl transition-all">
          من الفكرة إلى التنفيذ — القرار المطلوب
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
