'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card } from '@/components/ui';
import { AiInsightPanel } from '@/components/candidate/AiInsightPanel';
import { createClient } from '@/lib/supabase/client';

const SKILLS_FIELDS = [
  { key: 'leadership_skills', label: 'المهارات القيادية' },
  { key: 'technical_skills', label: 'المهارات التقنية' },
  { key: 'analytical_skills', label: 'المهارات التحليلية' },
  { key: 'communication_skills', label: 'مهارات الاتصال' },
  { key: 'team_management_skills', label: 'إدارة الفرق' },
  { key: 'crisis_management_skills', label: 'إدارة الأزمات' },
  { key: 'planning_skills', label: 'التخطيط' },
  { key: 'decision_making_skills', label: 'اتخاذ القرار' },
];

const TOOLS_FIELDS = [
  { key: 'systems_used', label: 'الأنظمة المستخدمة' },
  { key: 'analysis_tools', label: 'أدوات التحليل' },
  { key: 'ai_tools', label: 'أدوات الذكاء الاصطناعي' },
  { key: 'dashboard_tools', label: 'لوحات المؤشرات' },
  { key: 'pm_tools', label: 'إدارة المشاريع' },
  { key: 'automation_tools', label: 'الأتمتة' },
];

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');
  function addTag() {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setInput('');
  }
  return (
    <div className="border border-gold-300 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-primary-500">
      {value.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-wine leading-none">×</button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder || 'اكتب ثم Enter' : ''}
        className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
      />
    </div>
  );
}

export default function CandidateProfilePage() {
  const [form, setForm] = useState<Record<string, any>>({
    full_name: '', email: '', employee_number: '', phone: '', department: '', job_title: '',
    years_of_experience: '', qualification: '', specialization: '', educational_institution: '',
    graduation_year: '', professional_certifications: '', internal_experience: '', external_experience: '',
    current_tasks: '', past_leadership_tasks: '', team_participations: '', committee_participations: '',
    led_projects: '', leadership_skills: [], technical_skills: [], analytical_skills: [],
    communication_skills: [], team_management_skills: [], crisis_management_skills: [],
    planning_skills: [], decision_making_skills: [], systems_used: [], analysis_tools: [],
    ai_tools: [], dashboard_tools: [], pm_tools: [], automation_tools: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
    setForm(prev => ({ ...prev, ...(profile || {}), ...(userData ? { full_name: userData.full_name, email: userData.email, employee_number: userData.employee_number || '', phone: userData.phone || '', job_title: userData.job_title || '', department: userData.department || '' } : {}) }));
    if (profile?.completion_score) setCompletion(profile.completion_score);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function update(key: string, value: any) { setForm(p => ({ ...p, [key]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      const res = await fetch('/api/candidate/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { setCompletion(data.completion); setAnalysis(data.analysis); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } finally { setSaving(false); }
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm';
  const labelCls = 'block text-sm font-medium text-primary-700 mb-1';

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gold-50 rounded-xl animate-pulse" />)}</div>;

  return (
    <div dir="rtl">
      <PageHeader
        title="الملف القيادي"
        description="ملفك القيادي الأساسي. احرص على الدقة — لجنة الحوكمة ستراجع كل بيان. البيانات الموثقة بشواهد أقوى أثراً."
        example="في الخبرات: اذكر المسمى، المدة، والإنجاز الأبرز في كل دور. لا تكتفِ بالعناوين العامة."
        icon={<User className="h-5 w-5" />}
      />

      {/* شريط الاكتمال */}
      <div className="mb-6 institutional-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary-700">اكتمال الملف</span>
          <span className="text-2xl font-bold text-gold-700">{completion}%</span>
        </div>
        <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${completion >= 80 ? 'bg-sage' : completion >= 50 ? 'bg-primary-600' : 'bg-gold-500'}`} style={{ width: `${completion}%` }} />
        </div>
        <div className="mt-1.5 text-xs text-darkgray">{completion < 50 ? 'ابدأ بإضافة البيانات الأساسية' : completion < 80 ? 'أضف تفاصيل الخبرات والمهارات' : 'الملف في مستوى جيد ✓'}</div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* البيانات الأساسية */}
        <Card title="البيانات الأساسية">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className={labelCls}>الاسم الكامل</label><input value={form.full_name} onChange={e => update('full_name', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>البريد الإلكتروني</label><input type="email" value={form.email} className={`${inputCls} bg-gold-50`} dir="ltr" readOnly /></div>
            <div><label className={labelCls}>رقم الموظف</label><input value={form.employee_number || ''} onChange={e => update('employee_number', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>رقم الجوال</label><input value={form.phone || ''} onChange={e => update('phone', e.target.value)} className={inputCls} dir="ltr" /></div>
            <div><label className={labelCls}>الإدارة الحالية</label><input value={form.department || ''} onChange={e => update('department', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>المسمى الوظيفي</label><input value={form.job_title || ''} onChange={e => update('job_title', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>سنوات الخبرة الكلية</label><input type="number" value={form.years_of_experience || ''} onChange={e => update('years_of_experience', e.target.value)} className={inputCls} /></div>
          </div>
        </Card>

        {/* المؤهلات */}
        <Card title="المؤهلات">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className={labelCls}>المؤهل العلمي</label><input value={form.qualification || ''} onChange={e => update('qualification', e.target.value)} className={inputCls} placeholder="بكالوريوس / ماجستير / دكتوراه" /></div>
            <div><label className={labelCls}>التخصص</label><input value={form.specialization || ''} onChange={e => update('specialization', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>الجهة التعليمية</label><input value={form.educational_institution || ''} onChange={e => update('educational_institution', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>سنة التخرج</label><input type="number" value={form.graduation_year || ''} onChange={e => update('graduation_year', e.target.value)} className={inputCls} /></div>
            <div className="md:col-span-2"><label className={labelCls}>الشهادات المهنية</label><input value={form.professional_certifications || ''} onChange={e => update('professional_certifications', e.target.value)} className={inputCls} placeholder="PMP، CISA، إلخ..." /></div>
          </div>
        </Card>

        {/* الخبرات */}
        <Card title="الخبرات القيادية">
          <div className="space-y-4">
            {[
              { key: 'internal_experience', label: 'الخبرة داخل المنظمة', rows: 3, hint: 'اذكر المسمى، المدة، والإنجازات الأبرز في كل دور...' },
              { key: 'external_experience', label: 'الخبرة خارج المنظمة', rows: 2, hint: 'أدوار قيادية سابقة في جهات أخرى...' },
              { key: 'current_tasks', label: 'المهام الحالية', rows: 2, hint: 'مسؤولياتك الرئيسية الآن...' },
              { key: 'past_leadership_tasks', label: 'المهام القيادية السابقة', rows: 2, hint: 'أدوار قيادية سابقة داخل المنظمة...' },
            ].map(({ key, label, rows, hint }) => (
              <div key={key}><label className={labelCls}>{label}</label><textarea rows={rows} value={form[key] || ''} onChange={e => update(key, e.target.value)} className={inputCls} placeholder={hint} /></div>
            ))}
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className={labelCls}>فرق العمل التي شاركت فيها</label><textarea rows={2} value={form.team_participations || ''} onChange={e => update('team_participations', e.target.value)} className={inputCls} placeholder="اسم الفريق، الدور، المدة..." /></div>
              <div><label className={labelCls}>اللجان التي شاركت فيها</label><textarea rows={2} value={form.committee_participations || ''} onChange={e => update('committee_participations', e.target.value)} className={inputCls} placeholder="اسم اللجنة، الدور..." /></div>
            </div>
            <div><label className={labelCls}>المشاريع التي قدتها أو شاركت فيها</label><textarea rows={2} value={form.led_projects || ''} onChange={e => update('led_projects', e.target.value)} className={inputCls} placeholder="اسم المشروع، دورك، الأثر..." /></div>
          </div>
        </Card>

        {/* المهارات */}
        <Card title="المهارات">
          <div className="grid md:grid-cols-2 gap-4">
            {SKILLS_FIELDS.map(({ key, label }) => (
              <div key={key}><label className={labelCls}>{label}</label><TagInput value={form[key] || []} onChange={v => update(key, v)} placeholder={`أضف ${label}...`} /></div>
            ))}
          </div>
        </Card>

        {/* الأدوات */}
        <Card title="الأدوات والأنظمة">
          <div className="grid md:grid-cols-2 gap-4">
            {TOOLS_FIELDS.map(({ key, label }) => (
              <div key={key}><label className={labelCls}>{label}</label><TagInput value={form[key] || []} onChange={v => update(key, v)} placeholder={`أضف ${label}...`} /></div>
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

        {/* زر الحفظ */}
        <div className="sticky bottom-4 z-10">
          <div className="institutional-card p-3 flex items-center gap-3 shadow-lg">
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
              {saving ? 'جارٍ الحفظ...' : saved ? 'تم الحفظ!' : 'حفظ الملف'}
            </button>
            {saved && <span className="text-sm text-sage font-medium whitespace-nowrap">✓ تم التحديث</span>}
          </div>
        </div>
      </form>
    </div>
  );
}
