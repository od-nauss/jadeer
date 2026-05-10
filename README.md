# منصة جدير

> **منصة مؤسسية لقياس الجدارة القيادية**
> جامعة نايف العربية للعلوم الأمنية © 2026

---

## نظرة عامة

منصة جدير منصة مؤسسية ذكية لقياس الجاهزية القيادية، مبنية على الحوكمة وعدالة الفرص. تجمع المنصة:

- ملف قيادي + مبادرات + مؤشرات أداء
- اختبارات ذكية متعددة الأبعاد
- تقييم 360 من دائرة ثقة قيادية
- تحليل ذكي مساعد (Anthropic / OpenAI)
- لجنة حوكمة تعتمد المقيمين والتصنيفات
- بطاقة قيادية موثقة + خريطة ملاءمة تنظيمية + خطة تطوير فردية

---

## التقنيات المستخدمة

| المكوّن | التقنية |
|--------|---------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes + Server Actions |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (SSR) |
| AI | Anthropic Claude / OpenAI (محول) |
| Icons | lucide-react |
| Charts | Recharts |
| RTL | اللغة العربية كافتراضية، الإنجليزية جاهزة |

---

## المتطلبات قبل البدء

- Node.js 18.17+
- حساب Supabase (مجاني يكفي للتجربة)
- مفتاح Anthropic أو OpenAI API (للذكاء الاصطناعي)
- Git

---

## التثبيت السريع

### 1. تنصيب الاعتمادات

```bash
npm install
```

### 2. إعداد Supabase

1. أنشئ مشروعاً جديداً في [Supabase](https://supabase.com).
2. من قسم **SQL Editor**، نفذ الملفين بالترتيب:
   - `supabase/01_schema.sql` (يبني 70+ جدول + RLS)
   - `supabase/02_seed.sql` (يبني الأدوار، الهيكل التنظيمي، الاختبارات، الصفحات العامة)
3. من **Project Settings → API**، انسخ:
   - `Project URL`
   - `anon public key`
   - `service_role key` (سري - للسيرفر فقط)

### 3. إعداد متغيرات البيئة

أنشئ ملف `.env.local` في جذر المشروع:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Executive Center
EXECUTIVE_CENTER_DEFAULT_CODE=1170

# AI (اختر مزوداً واحداً على الأقل)
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
# أو
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. تعبئة البيانات التجريبية

```bash
npx tsx scripts/seed.ts
```

سيُنشئ هذا السكربت:
- حساب مدير النظام
- 5 حسابات أدوار (رئيس، حوكمة، مستشار، موارد بشرية، مدير)
- 5 ملفات مرشحين تجريبيين كاملة (مع البطاقات القيادية والخطط التطويرية)
- مبادرات + مؤشرات + تقييمات 360 + ملاءمة تنظيمية

### 5. التشغيل

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

---

## بيانات الدخول التجريبية

### الحسابات الأساسية

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| **مدير النظام** | `admin@nauss.edu.sa` | `Zx.321321` |
| الرئيس | `president@nauss.edu.sa` | `Demo@2026` |
| لجنة الحوكمة | `governance@nauss.edu.sa` | `Demo@2026` |
| الموارد البشرية | `hr@nauss.edu.sa` | `Demo@2026` |
| المستشار | `advisor@nauss.edu.sa` | `Demo@2026` |

### المرشحون التجريبيون (5 نماذج قيادية)

| الاسم | الدرجة | التصنيف | البريد |
|------|-------|---------|--------|
| نورة القحطاني | 87% | جاهز الآن | `noura@nauss.edu.sa` |
| فهد المطيري | 81% | إنجاز عالٍ / رضا منخفض | `fahad@nauss.edu.sa` |
| سعد الحارثي | 78% | جاهز خلال سنة | `saad@nauss.edu.sa` |
| هند العتيبي | 76% | قائد إنساني | `hind@nauss.edu.sa` |
| عبدالعزيز الدوسري | 71% | واعد | `abdulaziz@nauss.edu.sa` |

كلمة المرور لجميع المرشحين: `Demo@2026`

### مركز العرض التنفيذي

كلمة الدخول الافتراضية: `1170`
الرابط: `/executive-center/login`

---

## البوابات الست

```
/admin/dashboard          → مدير النظام
/executive/dashboard      → الرئيس
/governance/dashboard     → لجنة الحوكمة
/hr/dashboard             → الموارد البشرية
/advisor/dashboard        → المستشار
/candidate/dashboard      → المرشح
```

---

## النشر إلى الإنتاج (Vercel)

### 1. ادفع الكود إلى GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/jadeer-platform.git
git push -u origin main
```

### 2. ارتبط بـ Vercel

1. ادخل على [vercel.com](https://vercel.com)
2. **New Project** → اختر مستودع GitHub
3. أضف نفس متغيرات البيئة من `.env.local`
4. **Deploy**

### 3. بعد النشر

- حدّث `NEXT_PUBLIC_APP_URL` لرابط النشر
- في Supabase **Authentication → URL Configuration**، أضف رابط Vercel
- اختبر الدخول بحساب admin
- شغّل seed إن لم يكن مُشغّلاً
- احذف البيانات التجريبية من **مدير النظام → إدارة البيانات التجريبية** عند الانتقال للاستخدام الفعلي

---

## هيكل المشروع

```
jadeer-platform/
├── public/
│   ├── images/logo.png
│   └── fonts/ElMessiri-Regular.ttf
├── scripts/
│   └── seed.ts                  ← سكربت البيانات التجريبية
├── supabase/
│   ├── 01_schema.sql            ← مخطط قاعدة البيانات
│   └── 02_seed.sql              ← الأدوار والصفحات والاختبارات
├── src/
│   ├── app/
│   │   ├── (public)             ← الصفحات العامة
│   │   ├── admin/               ← بوابة مدير النظام (11 صفحة)
│   │   ├── executive/           ← بوابة الرئيس (9 صفحات)
│   │   ├── governance/          ← بوابة الحوكمة (9 صفحات)
│   │   ├── hr/                  ← بوابة الموارد (9 صفحات)
│   │   ├── advisor/             ← بوابة المستشار (5 صفحات)
│   │   ├── candidate/           ← بوابة المرشح (10 صفحات)
│   │   ├── executive-center/    ← مركز العرض التنفيذي (15 صفحة)
│   │   ├── evaluation/[token]/  ← صفحة التقييم الخارجي
│   │   ├── organization/        ← الصفحات التنظيمية المشتركة
│   │   └── api/                 ← API endpoints
│   ├── components/
│   │   ├── branding/            ← الهوية البصرية
│   │   ├── layout/              ← Sidebar, Topbar, Layouts
│   │   └── ui/                  ← مكونات قابلة لإعادة الاستخدام
│   ├── lib/
│   │   ├── ai/service.ts        ← خدمة الذكاء الاصطناعي (Anthropic + OpenAI)
│   │   ├── auth/                ← RBAC + Helpers
│   │   ├── supabase/            ← Supabase clients
│   │   └── utils.ts             ← helpers + READINESS_LEVELS
│   └── middleware.ts            ← حماية الطرق
├── tailwind.config.ts           ← الألوان المؤسسية
├── package.json
└── README.md
```

---

## الألوان المؤسسية

```css
--primary:    #2A6364   /* تيل عميق */
--gold:       #C7B08C   /* ذهبي حار */
--ivory:      #F9F9F9   /* أبيض كلاسيكي */
--wine:       #73384B   /* خمري */
--steelblue:  #2E6F8E   /* أزرق فولاذي */
--sage:       #4F8F7A   /* أخضر مريم */
```

الخط الأساسي: **El Messiri** (محمّل من `/public/fonts`).

---

## قواعد الحوكمة

> **القاعدة الذهبية:** لا اعتماد لتصنيف نهائي دون قرار موثق من لجنة الحوكمة.

- كل قرار حساس يُسجَّل في `audit_logs` ولا يقبل الحذف من الواجهة.
- كل تعديل على الأوزان أو القرارات يحتاج: السبب + ملاحظة حوكمية + توقيع رقمي.
- روابط 360 فردية، تستخدم مرة واحدة فقط، 14 يوماً صلاحية.
- 60% من المقيمين يجب أن يكونوا من اختيار اللجنة (لا الموظف وحده).

---

## قائمة الفحص بعد النشر

- [ ] تنفيذ `01_schema.sql` على Supabase
- [ ] تنفيذ `02_seed.sql` على Supabase
- [ ] إضافة متغيرات البيئة على Vercel
- [ ] تشغيل `npx tsx scripts/seed.ts`
- [ ] الدخول بحساب admin والتأكد من ظهور البوابات
- [ ] الدخول إلى مركز العرض التنفيذي بكلمة `1170`
- [ ] الدخول كرئيس ورؤية البطاقات القيادية للنماذج الخمسة
- [ ] الدخول كحوكمة ورؤية الملفات المعتمدة
- [ ] فتح صفحة تقييم خارجي عبر رابط من جدول `evaluation_links`
- [ ] حذف البيانات التجريبية من **مدير النظام → إدارة البيانات التجريبية** قبل الإطلاق الفعلي

---

## الترخيص والملكية

© 2026 جامعة نايف العربية للعلوم الأمنية.
جميع الحقوق محفوظة.

---

## للتواصل والدعم

- البريد: `jadeer@nauss.edu.sa`
- داخل المنصة: قسم "تواصل معنا"
