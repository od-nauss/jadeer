'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';
import { AiInsightPanel } from '@/components/candidate/AiInsightPanel';
import { createClient } from '@/lib/supabase/client';

// ─── بيانات القوائم المنسدلة ───────────────────────────────────────────────

const QUALIFICATIONS = ['ثانوي', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه', 'زمالة مهنية', 'أخرى'];

const SPECIALIZATIONS = [
  'إدارة الأعمال', 'إدارة عامة', 'إدارة موارد بشرية', 'إدارة مشاريع',
  'قيادة تنظيمية', 'تخطيط استراتيجي',
  'حاسب آلي وتقنية معلومات', 'هندسة برمجيات', 'أمن معلومات', 'ذكاء اصطناعي وبيانات',
  'هندسة صناعية', 'هندسة كهربائية', 'هندسة مدنية', 'هندسة كيميائية',
  'محاسبة', 'مالية واقتصاد', 'اقتصاد', 'إحصاء',
  'قانون', 'علوم سياسية', 'علاقات دولية', 'أمن وطني',
  'طب', 'صحة عامة', 'تمريض', 'صيدلة',
  'تربية وتعليم', 'إرشاد نفسي وتربوي',
  'علوم اجتماعية', 'إعلام واتصال',
  'أخرى',
];

const UNIVERSITIES = [
  // جامعة نايف
  { group: 'جامعة نايف', items: ['جامعة نايف العربية للعلوم الأمنية'] },
  // الجامعات السعودية
  { group: 'الجامعات السعودية', items: [
    'جامعة الملك عبدالعزيز', 'جامعة الملك سعود', 'جامعة الملك فهد للبترول والمعادن',
    'جامعة الملك فيصل', 'جامعة الملك خالد', 'جامعة الإمام محمد بن سعود الإسلامية',
    'الجامعة الإسلامية بالمدينة', 'جامعة أم القرى', 'جامعة طيبة', 'جامعة تبوك',
    'جامعة الجوف', 'جامعة القصيم', 'جامعة حائل', 'جامعة جازان', 'جامعة الباحة',
    'جامعة الحدود الشمالية', 'جامعة شقراء', 'جامعة المجمعة', 'جامعة نجران',
    'جامعة الأميرة نورة بنت عبدالرحمن', 'جامعة الملك سعود للعلوم الصحية',
    'جامعة الفيصل', 'جامعة دار العلوم', 'جامعة عفت',
    'معهد الإدارة العامة', 'المعهد التقني السعودي',
  ]},
  // جامعات الخليج
  { group: 'جامعات الخليج العربي', items: [
    'جامعة الإمارات', 'جامعة خليفة', 'جامعة نيويورك أبوظبي', 'جامعة الشارقة',
    'جامعة الكويت', 'جامعة الخليج للعلوم والتكنولوجيا',
    'جامعة قطر', 'معهد قطر للعلوم والتكنولوجيا والهندسة',
    'جامعة السلطان قابوس', 'الجامعة الألمانية للتكنولوجيا بعُمان',
    'جامعة البحرين', 'الجامعة الخليجية',
  ]},
  // جامعات عربية
  { group: 'الجامعات العربية', items: [
    'جامعة القاهرة', 'الجامعة الأمريكية بالقاهرة',
    'الجامعة الأمريكية ببيروت', 'الجامعة اللبنانية',
    'الجامعة الأردنية', 'جامعة الأردن',
    'جامعة دمشق', 'جامعة حلب',
    'جامعة تونس', 'جامعة الزيتونة',
    'جامعة محمد الخامس', 'جامعة القرويين',
  ]},
  // جامعات دولية
  { group: 'الجامعات الدولية', items: [
    'جامعة هارفارد', 'معهد ماساتشوستس للتكنولوجيا (MIT)',
    'جامعة ستانفورد', 'جامعة أكسفورد', 'جامعة كامبريدج',
    'معهد INSEAD', 'لندن للأعمال (LBS)',
    'جامعة لندن', 'جامعة إمبريال كوليدج',
    'جامعة هارفارد كينيدي للسياسة العامة',
    'جامعة جورج تاون', 'جامعة ميشيغان',
    'جامعة ميلبورن', 'جامعة سيدني',
  ]},
  { group: 'أخرى', items: ['أخرى — اكتب اسم الجامعة'] },
];

const CERTIFICATIONS = [
  // إدارة المشاريع
  'PMP — Project Management Professional',
  'PRINCE2',
  'CAPM — Certified Associate in Project Management',
  'PMI-ACP — Agile Certified Practitioner',
  // أمن المعلومات
  'CISSP', 'CISM', 'CISA', 'CompTIA Security+', 'CEH',
  // مالية ومحاسبة
  'CPA', 'CMA', 'CIA', 'CFA', 'ACCA', 'SOCPA',
  // موارد بشرية
  'SHRM-CP', 'SHRM-SCP', 'PHR', 'SPHR', 'CIPD',
  // جودة وعمليات
  'Six Sigma Green Belt', 'Six Sigma Black Belt', 'ISO 9001', 'ISO 27001',
  // تقنية وبيانات
  'AWS Certified', 'Google Cloud Professional', 'Azure Administrator',
  'PMP Data Science', 'Certified Data Professional',
  // تطوير القيادة
  'CCL Leadership Certification', 'ICF Coaching',
  // سعودية ومتخصصة
  'زمالة هيئة المحاسبين السعوديين', 'شهادة المدققين السعوديين',
];

// ─── نظام تقييم المهارات (5 مستويات) ─────────────────────────────────────

const SKILL_LEVELS = ['لا أملكها', 'أساسي', 'متوسط', 'متقدم', 'خبير'];

const SKILLS_CONFIG = [
  { key: 'leadership_skills',       label: 'القيادة والتأثير',      hint: 'قيادة الفرق، إلهام الآخرين، بناء الثقة' },
  { key: 'technical_skills',        label: 'المهارات التقنية',       hint: 'المعرفة التقنية في مجال تخصصك' },
  { key: 'analytical_skills',       label: 'التحليل واتخاذ القرار', hint: 'تحليل المشكلات، تقييم الخيارات، والقرار المبني على البيانات' },
  { key: 'communication_skills',    label: 'التواصل والإقناع',       hint: 'الخطابة، الكتابة الاحترافية، التفاوض' },
  { key: 'team_management_skills',  label: 'إدارة الفرق والتطوير',  hint: 'بناء الفرق، تطوير الأفراد، إدارة الأداء' },
  { key: 'crisis_management_skills',label: 'إدارة الأزمات والضغط',  hint: 'التعامل مع المواقف الطارئة والضغط الشديد' },
  { key: 'planning_skills',         label: 'التخطيط الاستراتيجي',   hint: 'التخطيط طويل المدى، وضع الأهداف، إدارة الموارد' },
  { key: 'decision_making_skills',  label: 'صنع القرار في الغموض',  hint: 'القرار حين تكون المعلومات ناقصة أو متعارضة' },
];

// ─── الأدوات والأنظمة (تعدد اختيار) ──────────────────────────────────────

const TOOLS_CONFIG = [
  {
    key: 'systems_used',
    label: 'الأنظمة الحكومية والمؤسسية',
    hint: 'الأنظمة التي تستخدمها يومياً في عملك',
    options: ['SAP', 'Oracle ERP', 'Microsoft Dynamics', 'Maximo', 'نظام HRMS', 'بوابة المشتريات الحكومية', 'نظام الأداء الحكومي', 'نظام مكتبي داخلي', 'أخرى'],
  },
  {
    key: 'analysis_tools',
    label: 'أدوات تحليل البيانات',
    hint: 'الأدوات التي تستخدمها لتحليل البيانات واتخاذ القرار',
    options: ['Excel (متقدم)', 'Power BI', 'Tableau', 'Python/R', 'SPSS', 'Google Analytics', 'SQL', 'أخرى'],
  },
  {
    key: 'ai_tools',
    label: 'أدوات الذكاء الاصطناعي',
    hint: 'أدوات الذكاء الاصطناعي التي وظّفتها في عملك',
    options: ['ChatGPT/Claude', 'Copilot Microsoft', 'Midjourney/DALL-E', 'أدوات توليد النصوص', 'تحليل الصور/الفيديو', 'نماذج تعلم آلي مخصصة', 'أخرى'],
  },
  {
    key: 'dashboard_tools',
    label: 'لوحات مؤشرات الأداء (Dashboards)',
    hint: 'أدوات رسم وتصميم لوحات المؤشرات لمتابعة الأداء',
    options: ['Power BI Dashboards', 'Tableau Dashboards', 'Google Data Studio', 'Microsoft SharePoint', 'نظام KPIs داخلي', 'أخرى'],
  },
  {
    key: 'pm_tools',
    label: 'إدارة المشاريع',
    hint: 'الأدوات التي تستخدمها لإدارة المشاريع والمهام',
    options: ['Microsoft Project', 'Jira', 'Trello', 'Asana', 'Monday.com', 'Notion', 'نظام داخلي', 'أخرى'],
  },
  {
    key: 'automation_tools',
    label: 'الأتمتة وتحسين العمليات',
    hint: 'أدوات أتمتة المهام المتكررة أو تحسين العمليات',
    options: ['Power Automate', 'Zapier', 'Python Scripts', 'RPA (Robotic Process Automation)', 'Macros Excel', 'أخرى'],
  },
];

// ─── مكوّن: تقييم المهارة (مقياس 5 مستويات) ─────────────────────────────

function SkillScaleInput({
  label, hint, value, onChange,
}: { label: string; hint: string; value: string[]; onChange: (v: string[]) => void }) {
  const selected = value.length === 1 && SKILL_LEVELS.includes(value[0]) ? value[0] : null;
  return (
    <div className="bg-gold-50 border border-gold-200 rounded-xl p-3">
      <div className="mb-2">
        <div className="font-medium text-primary-700 text-sm">{label}</div>
        <div className="text-xs text-darkgray/70 mt-0.5">{hint}</div>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {SKILL_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(selected === level ? [] : [level])}
            className={`py-1.5 px-1 text-xs rounded-lg border font-medium transition-all text-center ${
              selected === level
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-darkgray border-gold-300 hover:border-primary-400 hover:text-primary-700'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── مكوّن: اختيار متعدد بصناديق اختيار ──────────────────────────────────

function MultiCheckInput({
  label, hint, options, value, onChange,
}: { label: string; hint: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  }
  return (
    <div>
      <div className="font-medium text-primary-700 text-sm mb-0.5">{label}</div>
      <div className="text-xs text-darkgray/70 mb-2">{hint}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-medium transition-all ${
            value.includes(opt)
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-darkgray border-gold-300 hover:border-primary-400'
          }`}>
            <input
              type="checkbox"
              checked={value.includes(opt)}
              onChange={() => toggle(opt)}
              className="sr-only"
            />
            {value.includes(opt) ? '✓ ' : ''}{opt}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── مكوّن: قائمة منسدلة مع خيار "أخرى" (مُصلَح) ─────────────────────────

function SelectWithOther({
  label, options, value, onChange, required,
}: { label: string; options: string[]; value: string; onChange: (v: string) => void; required?: boolean }) {
  // نزيل "أخرى" من القائمة ونضيفها يدوياً
  const cleanOpts = options.filter(o => o !== 'أخرى');
  const isInList = cleanOpts.includes(value);
  // "أخرى" مفعّلة إذا القيمة غير فارغة وغير موجودة في القائمة
  const [showCustom, setShowCustom] = useState(!isInList && value !== '');
  const selectVal = showCustom ? '__OTHER__' : (value || '');

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v === '__OTHER__') {
      setShowCustom(true);
      onChange(''); // يُفرغ القيمة حتى يكتب المستخدم
    } else {
      setShowCustom(false);
      onChange(v);
    }
  }

  return (
    <div>
      <label className={labelCls}>{label}{required && <span className="text-wine mr-0.5">*</span>}</label>
      <select value={selectVal} onChange={handleSelectChange} className={inputCls}>
        <option value="">— اختر —</option>
        {cleanOpts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        <option value="__OTHER__">أخرى (اكتب يدوياً)...</option>
      </select>
      {showCustom && (
        <input
          autoFocus
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="اكتب هنا..."
          className={`${inputCls} mt-2 border-primary-400 ring-1 ring-primary-300`}
        />
      )}
    </div>
  );
}

// ─── مكوّن: قائمة جامعات مُجمَّعة (مُصلَح) ───────────────────────────────

function UniversitySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // جميع الجامعات المحددة مسبقاً
  const knownUnis = UNIVERSITIES.flatMap(g => g.items).filter(i => i !== 'أخرى — اكتب اسم الجامعة');
  const isKnown = knownUnis.includes(value);
  const [showCustom, setShowCustom] = useState(!isKnown && value !== '');
  const selectVal = showCustom ? '__UNI_OTHER__' : (value || '');

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v === '__UNI_OTHER__') {
      setShowCustom(true);
      onChange('');
    } else {
      setShowCustom(false);
      onChange(v);
    }
  }

  return (
    <div>
      <label className={labelCls}>الجهة التعليمية</label>
      <select value={selectVal} onChange={handleChange} className={inputCls}>
        <option value="">— اختر الجامعة —</option>
        {UNIVERSITIES.map(group => (
          <optgroup key={group.group} label={group.group}>
            {group.items
              .filter(uni => uni !== 'أخرى — اكتب اسم الجامعة')
              .map(uni => <option key={uni} value={uni}>{uni}</option>)}
          </optgroup>
        ))}
        <option value="__UNI_OTHER__">أخرى (اكتب اسم الجامعة)...</option>
      </select>
      {showCustom && (
        <input
          autoFocus
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="اكتب اسم الجامعة..."
          className={`${inputCls} mt-2 border-primary-400 ring-1 ring-primary-300`}
        />
      )}
    </div>
  );
}

// ─── مكوّن: اختيار شهادات مهنية (متعدد) ────────────────────────────────

function CertificationsInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = value ? value.split('،').map(s => s.trim()).filter(Boolean) : [];
  function toggle(cert: string) {
    const next = selected.includes(cert)
      ? selected.filter(s => s !== cert)
      : [...selected, cert];
    onChange(next.join('، '));
  }
  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white';
  return (
    <div>
      <label className="block text-sm font-medium text-primary-700 mb-1">الشهادات المهنية</label>
      <div className="text-xs text-darkgray/70 mb-2">اختر ما لديك من شهادات مهنية معتمدة</div>
      <div className="flex flex-wrap gap-2 mb-3">
        {CERTIFICATIONS.map((cert) => (
          <label key={cert} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer text-xs font-medium transition-all ${
            selected.includes(cert)
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-darkgray border-gold-300 hover:border-primary-400'
          }`}>
            <input type="checkbox" checked={selected.includes(cert)} onChange={() => toggle(cert)} className="sr-only" />
            {selected.includes(cert) ? '✓ ' : ''}{cert}
          </label>
        ))}
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="أو اكتب شهادات أخرى مفصولة بفاصلة..."
        className={inputCls}
      />
    </div>
  );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────

export default function CandidateProfilePage() {
  const [form, setForm] = useState<Record<string, any>>({
    full_name: '', email: '', employee_number: '', phone: '',
    department: '', job_title: '', years_of_experience: '',
    qualification: '', specialization: '', educational_institution: '',
    graduation_year: '', professional_certifications: '',
    internal_experience: '', external_experience: '',
    current_tasks: '', past_leadership_tasks: '',
    team_participations: '', committee_participations: '', led_projects: '',
    leadership_skills: [], technical_skills: [], analytical_skills: [],
    communication_skills: [], team_management_skills: [], crisis_management_skills: [],
    planning_skills: [], decision_making_skills: [],
    systems_used: [], analysis_tools: [], ai_tools: [],
    dashboard_tools: [], pm_tools: [], automation_tools: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [completion, setCompletion] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: userData }, { data: profile }] = await Promise.all([
      supabase.from('users').select('full_name, email, employee_number, phone, job_title, department').eq('auth_user_id', user.id).maybeSingle(),
      supabase.from('candidate_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    setForm(prev => ({
      ...prev,
      ...(profile || {}),
      ...(userData ? {
        full_name: userData.full_name || prev.full_name,
        email: userData.email || prev.email,
        employee_number: userData.employee_number || prev.employee_number || '',
        phone: userData.phone || prev.phone || '',
        job_title: profile?.job_title || userData.job_title || prev.job_title || '',
        department: profile?.department || userData.department || prev.department || '',
      } : {}),
    }));
    if (profile?.completion_score) setCompletion(profile.completion_score);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function update(key: string, value: any) { setForm(p => ({ ...p, [key]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false); setSaveError(null);
    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setCompletion(data.completion);
        setAnalysis(data.analysis);
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        setSaveError(data.error || 'حدث خطأ أثناء الحفظ. حاول مرة أخرى.');
      }
    } catch {
      setSaveError('تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-white';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';
  const selectCls = `${inputCls}`;

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gold-50 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div dir="rtl">
      <PageHeader
        title="الملف القيادي"
        description="ملفك الأساسي في منصة جدير. كلما كانت البيانات دقيقة وموثقة، كان التحليل أعمق وأصدق."
        icon={<User className="h-5 w-5" />}
      />

      {/* شريط الاكتمال */}
      <div className="mb-6 institutional-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary-700">اكتمال الملف</span>
          <span className="text-2xl font-bold text-gold-700">{completion}%</span>
        </div>
        <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              completion >= 80 ? 'bg-sage' : completion >= 50 ? 'bg-primary-600' : 'bg-gold-500'
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-darkgray">
          {completion < 50 ? 'ابدأ بإكمال البيانات الأساسية والمؤهلات'
            : completion < 80 ? 'أضف تفاصيل الخبرات وقيّم مهاراتك'
            : 'الملف في مستوى ممتاز ✓'}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ─── البيانات الأساسية ─── */}
        <Card title="البيانات الأساسية">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>الاسم الكامل <span className="text-wine">*</span></label>
              <input value={form.full_name} onChange={e => update('full_name', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>البريد الإلكتروني</label>
              <input type="email" value={form.email} className={`${inputCls} bg-gold-50 cursor-not-allowed`} dir="ltr" readOnly />
            </div>
            <div>
              <label className={labelCls}>رقم الموظف</label>
              <input value={form.employee_number || ''} onChange={e => update('employee_number', e.target.value)} className={inputCls} dir="ltr" />
            </div>
            <div>
              <label className={labelCls}>رقم الجوال</label>
              <input value={form.phone || ''} onChange={e => update('phone', e.target.value)} className={inputCls} dir="ltr" placeholder="05xxxxxxxx" />
            </div>
            <div>
              <label className={labelCls}>الإدارة / القطاع الحالي <span className="text-wine">*</span></label>
              <input value={form.department || ''} onChange={e => update('department', e.target.value)} className={inputCls} placeholder="مثال: إدارة العمليات" />
            </div>
            <div>
              <label className={labelCls}>المسمى الوظيفي الحالي <span className="text-wine">*</span></label>
              <input value={form.job_title || ''} onChange={e => update('job_title', e.target.value)} className={inputCls} placeholder="مثال: مدير قسم التشغيل" />
            </div>
            <div>
              <label className={labelCls}>إجمالي سنوات الخبرة <span className="text-wine">*</span></label>
              <select
                value={form.years_of_experience !== '' && form.years_of_experience !== null ? String(form.years_of_experience) : ''}
                onChange={e => update('years_of_experience', e.target.value ? Number(e.target.value) : '')}
                className={selectCls}
              >
                <option value="">— اختر —</option>
                <option value="0">أقل من سنة</option>
                <option value="2">1 – 3 سنوات</option>
                <option value="4">3 – 5 سنوات</option>
                <option value="7">5 – 10 سنوات</option>
                <option value="12">10 – 15 سنة</option>
                <option value="17">15 – 20 سنة</option>
                <option value="22">أكثر من 20 سنة</option>
              </select>
            </div>
          </div>
        </Card>

        {/* ─── المؤهلات ─── */}
        <Card title="المؤهلات العلمية">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>المؤهل العلمي</label>
              <select value={form.qualification || ''} onChange={e => update('qualification', e.target.value)} className={selectCls}>
                <option value="">— اختر —</option>
                {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            <SelectWithOther
              label="التخصص"
              options={SPECIALIZATIONS}
              value={form.specialization || ''}
              onChange={v => update('specialization', v)}
            />

            <UniversitySelect
              value={form.educational_institution || ''}
              onChange={v => update('educational_institution', v)}
            />

            <div>
              <label className={labelCls}>سنة التخرج</label>
              <select value={form.graduation_year || ''} onChange={e => update('graduation_year', e.target.value)} className={selectCls}>
                <option value="">— اختر —</option>
                {Array.from({ length: 40 }, (_, i) => 2025 - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <CertificationsInput
                value={form.professional_certifications || ''}
                onChange={v => update('professional_certifications', v)}
              />
            </div>
          </div>
        </Card>

        {/* ─── الخبرات القيادية ─── */}
        <Card title="الخبرات القيادية">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-blue-700">
              <strong>نصيحة:</strong> اذكر في كل حقل: المسمى الوظيفي أو المشروع، المدة الزمنية، وأبرز إنجاز أو أثر. البيانات الموثقة بشواهد محددة أقوى تأثيراً في التحليل.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>الخبرة داخل جامعة نايف / المنظمة الحالية</label>
              <textarea rows={3} value={form.internal_experience || ''} onChange={e => update('internal_experience', e.target.value)}
                className={inputCls}
                placeholder="مثال: مدير إدارة العمليات (٢٠٢٠–الآن): قدت فريقاً من ١٢ موظفاً، أطلقت مشروع إعادة هندسة العمليات بنتيجة خفض الوقت ٣٥٪..." />
            </div>
            <div>
              <label className={labelCls}>الخبرة في جهات سابقة خارج المنظمة</label>
              <textarea rows={2} value={form.external_experience || ''} onChange={e => update('external_experience', e.target.value)}
                className={inputCls}
                placeholder="مثال: مشرف عمليات — وزارة الداخلية (٢٠١٥–٢٠٢٠): إدارة ٨ موظفين، تطوير إجراءات تشغيل..." />
            </div>
            <div>
              <label className={labelCls}>مسؤولياتك الحالية الرئيسية</label>
              <textarea rows={2} value={form.current_tasks || ''} onChange={e => update('current_tasks', e.target.value)}
                className={inputCls}
                placeholder="مثال: الإشراف على العمليات اليومية، تقديم تقارير الأداء الشهرية، إدارة ميزانية ..." />
            </div>
            <div>
              <label className={labelCls}>الأدوار القيادية السابقة (مكلفاً بها أو رسمية)</label>
              <textarea rows={2} value={form.past_leadership_tasks || ''} onChange={e => update('past_leadership_tasks', e.target.value)}
                className={inputCls}
                placeholder="مثال: قائد فريق مشروع التحول الرقمي ٢٠٢٢ (٦ أشهر)، رئيس لجنة الجودة ٢٠٢١..." />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>فرق العمل التي شاركت أو قدتها</label>
                <textarea rows={2} value={form.team_participations || ''} onChange={e => update('team_participations', e.target.value)}
                  className={inputCls}
                  placeholder="اسم الفريق — دورك — المدة — الأثر..." />
              </div>
              <div>
                <label className={labelCls}>اللجان التي شاركت فيها</label>
                <textarea rows={2} value={form.committee_participations || ''} onChange={e => update('committee_participations', e.target.value)}
                  className={inputCls}
                  placeholder="اسم اللجنة — دورك — المدة..." />
              </div>
            </div>
            <div>
              <label className={labelCls}>أبرز المشاريع التي قدتها أو شاركت فيها</label>
              <textarea rows={2} value={form.led_projects || ''} onChange={e => update('led_projects', e.target.value)}
                className={inputCls}
                placeholder="اسم المشروع — دورك (قائد / مشارك) — المدة — أبرز مخرجاته..." />
            </div>
          </div>
        </Card>

        {/* ─── تقييم المهارات ─── */}
        <Card title="تقييم المهارات القيادية">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-amber-800">
              <strong>كيف تقيّم نفسك؟</strong> اختر المستوى الذي يعكس تجربتك الفعلية في كل مهارة.
              التقييم يُدعم لاحقاً بتقييم دائرة الثقة (360°) — فكن موضوعياً.
            </p>
            <div className="flex gap-4 mt-2 text-xs text-amber-700">
              <span>• <strong>لا أملكها:</strong> لا خبرة</span>
              <span>• <strong>أساسي:</strong> معرفة نظرية</span>
              <span>• <strong>متوسط:</strong> تطبيق منتظم</span>
              <span>• <strong>متقدم:</strong> كفاءة عالية</span>
              <span>• <strong>خبير:</strong> أدرّب الآخرين</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {SKILLS_CONFIG.map(({ key, label, hint }) => (
              <SkillScaleInput
                key={key}
                label={label}
                hint={hint}
                value={form[key] || []}
                onChange={v => update(key, v)}
              />
            ))}
          </div>
        </Card>

        {/* ─── الأدوات والأنظمة ─── */}
        <Card title="الأدوات والأنظمة المستخدمة">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-blue-700">
              اختر الأدوات التي استخدمتها فعلاً في عملك خلال السنوات الثلاث الماضية.
              لا تختر أدوات تعرفها نظرياً فقط.
            </p>
          </div>
          <div className="space-y-6">
            {TOOLS_CONFIG.map(({ key, label, hint, options }) => (
              <MultiCheckInput
                key={key}
                label={label}
                hint={hint}
                options={options}
                value={form[key] || []}
                onChange={v => update(key, v)}
              />
            ))}
          </div>
        </Card>

        {/* التحليل الذكي */}
        {analysis && (
          <AiInsightPanel
            title="التحليل الذكي للملف"
            scores={{
              completeness: { value: analysis.completeness, label: 'الاكتمال' },
              clarity: { value: analysis.clarity, label: 'الوضوح' },
              verifiability: { value: analysis.verifiability, label: 'قابلية التحقق' },
              leadership: { value: analysis.leadership_relevance, label: 'الارتباط بالقيادة' },
            }}
            feedback={analysis.feedback}
          />
        )}

        {/* زر الحفظ + رسائل */}
        <div className="sticky bottom-4 z-10">
          <div className="institutional-card p-3 shadow-lg space-y-2">
            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-wine">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving
                  ? <><Loader2 className="h-5 w-5 animate-spin" /> جارٍ الحفظ...</>
                  : saved
                  ? <><CheckCircle2 className="h-5 w-5" /> تم الحفظ!</>
                  : <><Save className="h-5 w-5" /> حفظ الملف</>
                }
              </button>
              {saved && <span className="text-sm text-sage font-medium whitespace-nowrap">✓ تم التحديث بنجاح</span>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
