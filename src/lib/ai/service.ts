/**
 * AI Service - طبقة الذكاء الاصطناعي الموحدة
 * ============================================
 * تستخدم هذه الطبقة من الخادم فقط (server-only)
 * مفاتيح API محفوظة في متغيرات البيئة
 * قابلة للتبديل بين مزودي AI مختلفين دون إعادة بناء المنصة
 *
 * المزودون المدعومون:
 * - anthropic (Claude API)
 * - openai (GPT API)
 * - custom (أي مزود متوافق مع OpenAI API)
 */

import 'server-only';

export type AIProvider = 'anthropic' | 'openai' | 'custom';

export interface AIAnalysisRequest {
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: 'text' | 'json';
  maxTokens?: number;
  temperature?: number;
}

export interface AIAnalysisResult {
  summary: string;
  scores?: Record<string, number>;
  recommendations?: string[];
  riskFlags?: string[];
  confidenceScore?: number;
  raw: string;
  provider: string;
  model: string;
}

const AI_PROVIDER = (process.env.AI_PROVIDER || 'anthropic') as AIProvider;
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'claude-sonnet-4-5-20250929';
const AI_BASE_URL =
  process.env.AI_BASE_URL ||
  (AI_PROVIDER === 'anthropic'
    ? 'https://api.anthropic.com/v1'
    : 'https://api.openai.com/v1');

/**
 * فحص ما إذا كانت طبقة AI مفعّلة فعلياً
 */
export function isAIConfigured(): boolean {
  return Boolean(AI_API_KEY && AI_API_KEY.length > 10);
}

/**
 * الاستدعاء الموحد للذكاء الاصطناعي
 * يدعم Anthropic و OpenAI
 */
export async function callAI(
  request: AIAnalysisRequest
): Promise<AIAnalysisResult> {
  if (!isAIConfigured()) {
    throw new Error(
      'AI Provider غير مُعدّ. أضف AI_API_KEY في متغيرات البيئة.'
    );
  }

  const systemPrompt = request.systemPrompt;
  const userPrompt = request.responseFormat === 'json'
    ? `${request.userPrompt}\n\nأعد الإجابة بصيغة JSON صالحة فقط بدون أي نص توضيحي خارج JSON.`
    : request.userPrompt;

  const maxTokens = request.maxTokens ?? 1500;
  const temperature = request.temperature ?? 0.5;

  let raw: string;

  if (AI_PROVIDER === 'anthropic') {
    raw = await callAnthropic(systemPrompt, userPrompt, maxTokens, temperature);
  } else {
    raw = await callOpenAICompatible(
      systemPrompt,
      userPrompt,
      maxTokens,
      temperature
    );
  }

  // محاولة تحليل JSON إن طُلب
  let parsed: Partial<AIAnalysisResult> = {};
  if (request.responseFormat === 'json') {
    try {
      const cleaned = raw
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // إن فشل الـparsing، نضع الراو في الـsummary
      parsed = { summary: raw };
    }
  } else {
    parsed = { summary: raw };
  }

  return {
    summary: parsed.summary || raw,
    scores: parsed.scores,
    recommendations: parsed.recommendations,
    riskFlags: parsed.riskFlags,
    confidenceScore: parsed.confidenceScore,
    raw,
    provider: AI_PROVIDER,
    model: AI_MODEL,
  };
}

async function callAnthropic(
  system: string,
  user: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const response = await fetch(`${AI_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((c: { type: string }) => c.type === 'text');
  return textBlock?.text || '';
}

async function callOpenAICompatible(
  system: string,
  user: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// =============================================================
// مساعدات تحليل متخصصة
// =============================================================

/**
 * تحليل الملف القيادي
 */
export async function analyzeProfile(profileData: object): Promise<AIAnalysisResult> {
  return callAI({
    systemPrompt: `أنت محلل قيادي مساعد في منصة جدير.
دورك تحليل ملف قيادي للموظف، وتحديد:
- درجة الاكتمال
- درجة الوضوح
- درجة قابلية التحقق
- درجة الارتباط بالقيادة
- ملاحظات تحسين

أعد الإجابة كـ JSON بالحقول التالية:
{
  "summary": "ملخص نصي قصير",
  "scores": {"completion": 0-100, "clarity": 0-100, "verifiability": 0-100, "leadershipRelevance": 0-100},
  "recommendations": ["توصية 1", "توصية 2"],
  "riskFlags": ["علامة تحذير 1"],
  "confidenceScore": 0-100
}

النبرة: مساعدة وتحسينية، ليست هجومية أو حاكمة.
لا تصدر قراراً نهائياً - أنت تساعد الموظف على تحسين ملفه قبل لجنة الحوكمة.`,
    userPrompt: `حلل الملف القيادي التالي:\n${JSON.stringify(profileData, null, 2)}`,
    responseFormat: 'json',
    maxTokens: 1200,
  });
}

/**
 * تحليل مبادرة
 */
export async function analyzeInitiative(initiative: object): Promise<AIAnalysisResult> {
  return callAI({
    systemPrompt: `أنت محلل مبادرات في منصة جدير.
حلل المبادرة من حيث: قوتها، وضوح الأثر، قابلية التحقق، الابتكار، قابلية الاستدامة، وضوح دور المرشح.

أعد JSON:
{
  "summary": "ملخص",
  "scores": {"strength": 0-100, "impact_clarity": 0-100, "verifiability": 0-100, "innovation": 0-100, "sustainability": 0-100, "role_clarity": 0-100},
  "recommendations": ["..."],
  "riskFlags": ["..."],
  "confidenceScore": 0-100
}`,
    userPrompt: `حلل المبادرة:\n${JSON.stringify(initiative, null, 2)}`,
    responseFormat: 'json',
    maxTokens: 1000,
  });
}

/**
 * تحليل قائمة المقيمين
 */
export async function analyzeEvaluatorsList(
  candidate: object,
  evaluators: object[]
): Promise<AIAnalysisResult> {
  return callAI({
    systemPrompt: `أنت محلل دائرة الثقة القيادية في منصة جدير.
حلل قائمة المقيمين من حيث: التنوع، قوة المعرفة المهنية، قابلية تأكيد المبادرات والمؤشرات، مخاطر التحيز.

أعد JSON:
{
  "summary": "ملخص للجنة الحوكمة",
  "scores": {"diversity": 0-100, "knowledge_strength": 0-100, "verification_capacity": 0-100, "bias_risk": 0-100, "circle_quality": 0-100},
  "recommendations": ["توصية للجنة"],
  "riskFlags": ["..."],
  "confidenceScore": 0-100
}`,
    userPrompt: `المرشح: ${JSON.stringify(candidate, null, 2)}\n\nالمقيمون المقترحون: ${JSON.stringify(evaluators, null, 2)}`,
    responseFormat: 'json',
    maxTokens: 1200,
  });
}

/**
 * توليد ملخص تنفيذي للبطاقة القيادية
 */
export async function generateLeadershipCardSummary(
  cardData: object
): Promise<AIAnalysisResult> {
  return callAI({
    systemPrompt: `أنت محلل تنفيذي في منصة جدير.
ولّد ملخصاً قيادياً تنفيذياً قصيراً (3-5 جمل) يدمج البيانات ويوضح للقيادة:
- لماذا هذا التصنيف
- نقاط القوة الجوهرية
- أكبر مخاطرة
- الجاهزية للتكليف

النبرة: تنفيذية رصينة، واضحة، مدعومة بالبيانات. لست أنت من يقرر، أنت تساعد القيادة على القراءة.`,
    userPrompt: `بطاقة المرشح:\n${JSON.stringify(cardData, null, 2)}`,
    responseFormat: 'text',
    maxTokens: 500,
  });
}
