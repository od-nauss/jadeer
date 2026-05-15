/**
 * محرك التصحيح الذكي لاختبارات جدير القيادية
 * ================================================
 * يُصحّح إجابات كل سؤال بناءً على معايير قيادية متخصصة
 * لا توجد إجابة "خاطئة" — كل إجابة تعكس نمطاً قيادياً
 *
 * نظام التصحيح:
 * - أسئلة الاختيار (MCQ/situation/best_decision): لكل خيار درجة محددة
 * - أسئلة الترتيب (priority_ranking): مقارنة مع الترتيب المثالي للقيادة
 * - أسئلة النص القصير (short_text): تحليل العمق والمفاهيم القيادية
 */

// ─────────────────────────────────────────────────────────────────────────────
// درجات كل خيار لكل سؤال في كل اختبار
// المصفوفة: [خيار أ، خيار ب، خيار ج، خيار د]
// ─────────────────────────────────────────────────────────────────────────────
const MCQ_SCORES: Record<string, number[][]> = {
  leadership_influence: [
    [95, 60, 30, 70],  // Q1: منفرداً لفهم السبب ← أفضل / تعجيل الإنجاز ← جيد / رفع التقرير ← ضعيف
    [90, 40, 30, 75],  // Q2: الاستماع والشرح ← أفضل / مشاركة الفريق ← جيد
    [0, 0, 0, 0],      // Q3: ranking — يُصحَّح منفصلاً
    [75, 60, 90, 85],  // Q4: تعرف نقاط القوة ← أفضل / توقعات واضحة ← جيد
    [30, 95, 80, 85],  // Q5: يأتون بأفكار ← أفضل / يدافعون عن الفريق ← جيد
    [0, 0, 0, 0],      // Q6: short_text
    [85, 40, 25, 95],  // Q7: نقاش منظم ثم قرار ← أفضل / تحمل مسؤولية القرار ← جيد
    [70, 95, 50, 55],  // Q8: نفس المعايير التي تطلبها ← أفضل
    [0, 0, 0, 0],      // Q9: short_text
    [30, 95, 20, 50],  // Q10: يُمكّن فريقه ← أفضل
  ],
  strategic_thinking: [
    [75, 90, 50, 35],  // Q1: تشكيل فريق دراسة ← أفضل / تجارب مشابهة ← جيد
    [0, 0, 0, 0],      // Q2: ranking
    [25, 90, 35, 55],  // Q3: البحث عن فرص مجاورة ← أفضل
    [0, 0, 0, 0],      // Q4: short_text
    [25, 95, 55, 60],  // Q5: يرفض ويقترح بديلاً ← أفضل
    [20, 90, 65, 70],  // Q6: يبني سيناريوهات ← أفضل
    [0, 0, 0, 0],      // Q7: short_text
    [20, 45, 90, 55],  // Q8: تعديل النطاق وتنفيذ الأساسيات ← أفضل
    [0, 0, 0, 0],      // Q9: short_text
    [25, 95, 35, 75],  // Q10: الاتجاه العام مع المرونة ← أفضل
  ],
  decision_making: [
    [20, 70, 15, 95],  // Q1: يجمع أكبر قدر في الوقت المتاح ← أفضل
    [0, 0, 0, 0],      // Q2: ranking
    [60, 50, 10, 95],  // Q3: يعترف ويضع خطة تصحيح ← أفضل
    [0, 0, 0, 0],      // Q4: short_text
    [90, 30, 55, 70],  // Q5: يشرح ويستمع ← أفضل
    [10, 90, 55, 80],  // Q6: أكثر خبرة / لتطوير قدرات الفريق ← كلاهما جيد
    [0, 0, 0, 0],      // Q7: short_text
    [30, 75, 20, 90],  // Q8: يجمع بيانات إضافية لحل التعارض ← أفضل
    [0, 0, 0, 0],      // Q9: short_text
    [25, 90, 50, 75],  // Q10: يبحث عن خيار وسط ← أفضل
  ],
  crisis_management: [
    [70, 55, 25, 95],  // Q1: تقييم حجم الأزمة أولاً ← أفضل
    [0, 0, 0, 0],      // Q2: ranking
    [30, 95, 65, 45],  // Q3: يشاركهم الحقيقة ويضع خطة معهم ← أفضل
    [0, 0, 0, 0],      // Q4: short_text
    [20, 90, 30, 65],  // Q5: يُبلّغ ويُنفّذ ← أفضل
    [0, 0, 0, 0],      // Q6: short_text
    [25, 90, 15, 55],  // Q7: دليل واضح أن القرار يزيد الأمور سوءاً ← أفضل
    [25, 90, 20, 70],  // Q8: التواصل الشفاف والسريع ← أفضل
    [0, 0, 0, 0],      // Q9: short_text
    [20, 90, 70, 75],  // Q10: توثيق الدروس ← أفضل
  ],
  emotional_intelligence: [
    [15, 95, 65, 45],  // Q1: يتحدث معه بشكل خاص ← أفضل
    [20, 35, 95, 40],  // Q2: يشكر الملاحظة ويعد بمراجعتها ← أفضل
    [0, 0, 0, 0],      // Q3: ranking
    [0, 0, 0, 0],      // Q4: short_text
    [40, 25, 95, 30],  // Q5: يُعطي نفسه لحظة هدوء ← أفضل
    [0, 0, 0, 0],      // Q6: short_text
    [0, 0, 0, 0],      // Q7: short_text
    [45, 95, 20, 40],  // Q8: يشرح ويُسمح للتعبير عن القلق ← أفضل
    [0, 0, 0, 0],      // Q9: short_text
    [0, 0, 0, 0],      // Q10: short_text
  ],
  team_management: [
    [65, 25, 90, 45],  // Q1: يتحدث مع كل فرد منفرداً ← أفضل
    [25, 55, 95, 65],  // Q2: توزيع بناءً على المهارات مع فرص تطوير ← أفضل
    [0, 0, 0, 0],      // Q3: ranking
    [0, 0, 0, 0],      // Q4: short_text
    [25, 15, 95, 40],  // Q5: يُناقشه لفهم السبب ثم يضع خطة ← أفضل
    [0, 0, 0, 0],      // Q6: short_text
    [0, 0, 0, 0],      // Q7: short_text
    [30, 25, 95, 65],  // Q8: يسمع كل طرف منفرداً ثم يجمعهما ← أفضل
    [0, 0, 0, 0],      // Q9: short_text
    [0, 0, 0, 0],      // Q10: short_text
  ],
  tech_ai_usage: [
    [0, 0, 0, 0],  // Q1: short_text
    [0, 0, 0, 0],  // Q2: short_text
    [0, 0, 0, 0],  // Q3: ranking
    [40, 90, 50, 80], // Q4: يشرح ويُعطيهم وقتاً ← أفضل / يُظهر النتائج ← جيد
    [0, 0, 0, 0],  // Q5: short_text
    [0, 0, 0, 0],  // Q6: short_text
    [55, 95, 45, 30], // Q7: يستخدم التقنية لحل مشكلة حقيقية ← أفضل
    [0, 0, 0, 0],  // Q8: short_text
    [0, 0, 0, 0],  // Q9: short_text
    [0, 0, 0, 0],  // Q10: short_text
  ],
  case_study: [
    [0, 0, 0, 0],      // Q1: short_text
    [0, 0, 0, 0],      // Q2: ranking
    [0, 0, 0, 0],      // Q3: short_text
    [0, 0, 0, 0],      // Q4: short_text
    [25, 90, 70, 75],  // Q5: إبلاغ المدير بالواقع وطلب مراجعة التوقعات ← أفضل
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// الترتيب المثالي لأسئلة الأولويات
// ─────────────────────────────────────────────────────────────────────────────
const IDEAL_RANKINGS: Record<string, string[][]> = {
  leadership_influence: [
    ['بناء الثقة', 'الاستماع الفعّال', 'تطوير الفريق', 'الشفافية', 'الحزم في القرار'],
  ],
  strategic_thinking: [
    ['الأهداف المؤسسية', 'تحليل البيئة الخارجية', 'المخاطر المحتملة', 'الموارد المتاحة', 'نقاط القوة الداخلية'],
  ],
  decision_making: [
    ['تحديد المشكلة بوضوح', 'جمع البيانات', 'توليد الخيارات', 'تقييم المخاطر', 'الاختيار والتنفيذ'],
  ],
  crisis_management: [
    ['تحديد حجم الأزمة', 'إخطار المعنيين', 'وضع خطة طوارئ', 'التنفيذ والمتابعة', 'التقييم والتعلم'],
  ],
  emotional_intelligence: [
    ['الوعي الذاتي', 'التعاطف', 'ضبط النفس', 'الدوافع الذاتية', 'المهارات الاجتماعية'],
  ],
  team_management: [
    ['أهداف موحدة وواضحة', 'الاجتماعات الدورية الفردية', 'التغذية الراجعة البنّاءة', 'بيئة آمنة للتعبير', 'الاحتفاء بالإنجازات'],
  ],
  tech_ai_usage: [
    ['لوحات البيانات والمؤشرات', 'أدوات الذكاء الاصطناعي', 'أتمتة العمليات', 'أنظمة إدارة المشاريع', 'منصات التواصل والتعاون'],
  ],
  case_study: [
    ['قياس الأداء الحالي', 'مقابلة الفريق لفهم التحديات', 'تحديد نقاط الاختناق', 'مراجعة الإجراءات', 'وضع خطة تحسين'],
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// كلمات مفاتيح للنصوص القصيرة
// ─────────────────────────────────────────────────────────────────────────────
const TEXT_KEYWORDS = {
  leadership_high: ['فريق', 'بيانات', 'مؤشر', 'استراتيج', 'تطوير', 'هدف', 'قيادة', 'ثقة', 'نتائج', 'أثر', 'تحسين', 'تمكين'],
  leadership_medium: ['عمل', 'مشكلة', 'حل', 'قرار', 'دعم', 'مساعدة', 'تعاون', 'إنجاز'],
  depth_indicators: ['لأن', 'لذلك', 'بسبب', 'نتيجة', 'مثال', 'تجربت', 'لاحظت', 'تعلمت', 'الدرس'],
};

// ─────────────────────────────────────────────────────────────────────────────
// دالة تصحيح النص القصير
// ─────────────────────────────────────────────────────────────────────────────
function scoreText(text: string): number {
  const t = text.trim().toLowerCase();
  if (!t || t.length < 10) return 20;

  let score = 40; // base

  // طول الإجابة
  if (t.length > 200) score += 25;
  else if (t.length > 100) score += 15;
  else if (t.length > 50) score += 8;

  // كلمات قيادية عالية
  const highCount = TEXT_KEYWORDS.leadership_high.filter(k => t.includes(k)).length;
  score += Math.min(20, highCount * 5);

  // كلمات قيادية متوسطة
  const medCount = TEXT_KEYWORDS.leadership_medium.filter(k => t.includes(k)).length;
  score += Math.min(10, medCount * 2);

  // مؤشرات العمق
  const depthCount = TEXT_KEYWORDS.depth_indicators.filter(k => t.includes(k)).length;
  score += Math.min(10, depthCount * 3);

  return Math.min(95, score);
}

// ─────────────────────────────────────────────────────────────────────────────
// دالة تصحيح الترتيب
// ─────────────────────────────────────────────────────────────────────────────
function scoreRanking(userOrder: string[], idealOrder: string[]): number {
  if (!Array.isArray(userOrder) || !userOrder.length) return 50;
  if (!idealOrder || !idealOrder.length) return 75;

  let matchScore = 0;
  const n = Math.min(userOrder.length, idealOrder.length);

  for (let i = 0; i < n; i++) {
    const userItem = userOrder[i];
    const idealPos = idealOrder.findIndex(item => item.includes(userItem.slice(0, 6)) || userItem.includes(item.slice(0, 6)));

    if (idealPos === i) matchScore += 100;           // exact position
    else if (Math.abs(idealPos - i) === 1) matchScore += 70;  // off by 1
    else if (Math.abs(idealPos - i) === 2) matchScore += 40;  // off by 2
    else matchScore += 15;
  }

  return Math.round(matchScore / n);
}

// ─────────────────────────────────────────────────────────────────────────────
// الدالة الرئيسية لتصحيح الاختبار
// ─────────────────────────────────────────────────────────────────────────────
export interface ScoringResult {
  totalScore: number;         // 0-100
  thinkingPattern: string;    // نمط التفكير القيادي
  leadershipDimension: string;// البُعد القيادي الأبرز
  strengths: string[];        // نقاط قوة محددة
  gaps: string[];             // فجوات محددة
  detailedScores: Record<string, number>; // درجة كل سؤال
}

export function scoreAssessment(
  assessmentCode: string,
  questions: Array<{ id: string; question_type: string; options_json: Record<string, unknown>; display_order: number }>,
  answers: Record<string, unknown>
): ScoringResult {

  const scores = MCQ_SCORES[assessmentCode] || [];
  const idealRankings = IDEAL_RANKINGS[assessmentCode] || [];
  let rankingIndex = 0;

  const detailedScores: Record<string, number> = {};
  let totalRaw = 0;
  let answeredCount = 0;
  const highScoreQuestions: number[] = [];
  const lowScoreQuestions: number[] = [];

  for (let qIdx = 0; qIdx < questions.length; qIdx++) {
    const q = questions[qIdx];
    const answer = answers[q.id];
    const qScore = scores[qIdx];

    let questionScore = 50; // default

    if (q.question_type === 'short_text') {
      questionScore = scoreText(String(answer || ''));
    } else if (q.question_type === 'priority_ranking') {
      const idealOrder = idealRankings[rankingIndex] || [];
      rankingIndex++;
      questionScore = scoreRanking(
        Array.isArray(answer) ? answer as string[] : [],
        idealOrder
      );
    } else if (['multiple_choice', 'situation', 'best_decision', 'case_analysis'].includes(q.question_type)) {
      const options = (q.options_json as any)?.options as string[] || [];
      if (answer && options.length > 0 && qScore && qScore.length > 0) {
        const selectedIdx = options.indexOf(String(answer));
        if (selectedIdx >= 0 && qScore[selectedIdx] !== undefined) {
          questionScore = qScore[selectedIdx];
        } else if (answer) {
          questionScore = 60; // answered but can't determine exact score
        }
      } else if (!answer) {
        questionScore = 0; // unanswered
      }
    }

    detailedScores[q.id] = questionScore;
    if (answer !== undefined && answer !== null && answer !== '') {
      totalRaw += questionScore;
      answeredCount++;
      if (questionScore >= 80) highScoreQuestions.push(qIdx + 1);
      if (questionScore <= 35) lowScoreQuestions.push(qIdx + 1);
    }
  }

  // الدرجة الكلية (تحسب فقط من الأسئلة التي أُجيب عليها)
  const totalScore = answeredCount > 0
    ? Math.min(95, Math.round(totalRaw / answeredCount))
    : 0;

  // نمط التفكير بناءً على كل الإجابات النصية
  const allTextAnswers = questions
    .filter(q => q.question_type === 'short_text')
    .map(q => String(answers[q.id] || ''))
    .join(' ');

  let thinkingPattern = 'تحليلي متوازن';
  if (allTextAnswers.includes('بيانات') || allTextAnswers.includes('مؤشر') || allTextAnswers.includes('قياس'))
    thinkingPattern = 'مدفوع بالبيانات';
  else if (allTextAnswers.includes('فريق') || allTextAnswers.includes('تعاون') || allTextAnswers.includes('ثقة'))
    thinkingPattern = 'إنساني تشاركي';
  else if (allTextAnswers.includes('استراتيج') || allTextAnswers.includes('رؤية') || allTextAnswers.includes('مستقبل'))
    thinkingPattern = 'استراتيجي بعيد المدى';
  else if (allTextAnswers.includes('أداء') || allTextAnswers.includes('إنجاز') || allTextAnswers.includes('نتيجة'))
    thinkingPattern = 'موجّه نحو الإنجاز';
  else if (allTextAnswers.includes('تقنية') || allTextAnswers.includes('نظام') || allTextAnswers.includes('ذكاء'))
    thinkingPattern = 'تقني تحليلي';

  // البُعد القيادي بناءً على الاختبار
  const dimensionMap: Record<string, string> = {
    leadership_influence: 'القيادة والتأثير',
    strategic_thinking: 'التفكير الاستراتيجي',
    decision_making: 'اتخاذ القرار',
    crisis_management: 'إدارة الأزمات',
    emotional_intelligence: 'الذكاء العاطفي',
    team_management: 'إدارة الفريق',
    tech_ai_usage: 'القيادة الرقمية',
    case_study: 'التحليل القيادي',
  };
  const leadershipDimension = dimensionMap[assessmentCode] || 'القيادة العامة';

  // نقاط القوة والفجوات
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (totalScore >= 80) {
    strengths.push(`كفاءة عالية في ${leadershipDimension} (${totalScore}%)`);
  } else if (totalScore >= 65) {
    strengths.push(`أداء جيد في ${leadershipDimension} مع فرص للتحسين`);
  }

  if (highScoreQuestions.length > 0) {
    strengths.push(`استجابة ممتازة في ${highScoreQuestions.length} موقف قيادي`);
  }

  if (totalScore < 65) {
    gaps.push(`يحتاج تطوير في ${leadershipDimension}`);
  }

  if (lowScoreQuestions.length > 0) {
    gaps.push(`نقاط تحتاج مراجعة في ${lowScoreQuestions.length} سيناريوهات`);
  }

  if (answeredCount < questions.length * 0.6) {
    gaps.push('لم يُكمل جميع أسئلة الاختبار');
  }

  return { totalScore, thinkingPattern, leadershipDimension, strengths, gaps, detailedScores };
}

// ─────────────────────────────────────────────────────────────────────────────
// تجميع نتائج جميع الاختبارات وحساب درجة الاختبارات الكلية
// ─────────────────────────────────────────────────────────────────────────────
export function computeAssessmentAxisScore(results: Array<{ assessment_code: string; score: number }>): number {
  if (!results || results.length === 0) return 0;

  const weights: Record<string, number> = {
    leadership_influence: 0.20,
    strategic_thinking: 0.15,
    decision_making: 0.15,
    crisis_management: 0.10,
    emotional_intelligence: 0.15,
    team_management: 0.15,
    tech_ai_usage: 0.10,
    case_study: 0.00, // bonus assessment
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const result of results) {
    const w = weights[result.assessment_code] || 0.05;
    weightedSum += result.score * w;
    totalWeight += w;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// ملخص قيادي من نتائج الاختبارات
// ─────────────────────────────────────────────────────────────────────────────
export function generateAssessmentSummary(
  results: Array<{ assessment_code: string; score: number; thinking_pattern: string }>
): string {
  if (!results || results.length === 0) return 'لم يُكمل أي اختبار بعد.';

  const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const best = results.sort((a, b) => b.score - a.score)[0];
  const worst = [...results].sort((a, b) => a.score - b.score)[0];

  const dimensionMap: Record<string, string> = {
    leadership_influence: 'القيادة والتأثير',
    strategic_thinking: 'التفكير الاستراتيجي',
    decision_making: 'اتخاذ القرار',
    crisis_management: 'إدارة الأزمات',
    emotional_intelligence: 'الذكاء العاطفي',
    team_management: 'إدارة الفريق',
    tech_ai_usage: 'القيادة الرقمية',
    case_study: 'التحليل القيادي',
  };

  const patterns = results.map(r => r.thinking_pattern).filter(Boolean);
  const dominantPattern = patterns.length > 0
    ? patterns.sort((a, b) => patterns.filter(p => p === b).length - patterns.filter(p => p === a).length)[0]
    : 'تحليلي متوازن';

  return [
    `اكتمل ${results.length} اختبار بمتوسط ${avg}%.`,
    `أقوى بُعد: ${dimensionMap[best?.assessment_code] || 'القيادة'} (${best?.score}%).`,
    worst?.score < 65 ? `يحتاج تطوير في: ${dimensionMap[worst?.assessment_code] || 'بعض المحاور'} (${worst?.score}%).` : '',
    `النمط القيادي السائد: ${dominantPattern}.`,
  ].filter(Boolean).join(' ');
}
