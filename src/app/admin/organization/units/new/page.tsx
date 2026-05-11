'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2, ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';

const UNIT_TYPES = [
  'organization', 'sector', 'agency', 'general_department', 'department',
  'division', 'unit', 'committee', 'strategic_project', 'executive_office',
];
const UNIT_TYPE_LABELS: Record<string, string> = {
  organization: 'منظمة', sector: 'قطاع', agency: 'وكالة',
  general_department: 'إدارة عامة', department: 'إدارة', division: 'قسم',
  unit: 'وحدة', committee: 'لجنة', strategic_project: 'مشروع استراتيجي',
  executive_office: 'مكتب تنفيذي',
};

const LEADERSHIP_TYPES = [
  { v: 'strategic', l: 'قائد استراتيجي' },
  { v: 'operational', l: 'قائد تشغيلي' },
  { v: 'transformational', l: 'قائد تحويلي' },
  { v: 'innovation', l: 'قائد ابتكاري' },
  { v: 'crisis', l: 'قائد أزمات' },
  { v: 'high_performance_team', l: 'قائد فرق عالية الأداء' },
  { v: 'institutional_development', l: 'قائد تطوير مؤسسي' },
  { v: 'technical', l: 'قائد تقني' },
  { v: 'academic', l: 'قائد أكاديمي' },
  { v: 'executive_admin', l: 'قائد إداري تنفيذي' },
  { v: 'human', l: 'قائد إنساني' },
  { v: 'specialist_leadership', l: 'متخصص قيادي' },
  { v: 'other', l: 'أخرى' },
];

const REQUIRED_SKILLS = [
  'اتخاذ القرار', 'إدارة الفريق', 'إدارة الأزمات', 'التفكير الاستراتيجي',
  'تحليل البيانات', 'استخدام التقنية', 'بناء مؤشرات الأداء', 'إدارة المشاريع',
  'إدارة التغيير', 'التواصل', 'التفاوض', 'إدارة أصحاب العلاقة',
  'الابتكار', 'الضبط التشغيلي', 'الحوكمة', 'المعرفة الأكاديمية',
  'المعرفة الميدانية', 'العمل تحت الضغط',
];

const AXES = [
  { k: 'leadership', l: 'القيادة والتأثير' },
  { k: 'strategic', l: 'التفكير الاستراتيجي' },
  { k: 'performance', l: 'الأداء والإنجاز' },
  { k: 'innovation', l: 'الابتكار والمبادرات' },
  { k: 'team', l: 'رضا الفريق' },
  { k: 'technology', l: 'استخدام التقنية' },
  { k: 'integrity', l: 'النزاهة والالتزام' },
];

export default function NewUnitPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', unit_type: 'department', parent_unit_id: '',
    description: '', main_tasks: '', work_nature: '',
    employee_count: '', sensitivity_level: 'medium', complexity_level: 'medium',
    leadership_need_level: 'medium', impact_level: 'medium',
    is_critical: false, has_vacancy: false, needs_successor: false,
    is_suitable_for_trial: false, is_suitable_for_development: false, notes: '',
  });
  const [reqs, setReqs] = useState({
    leadership_type: '', readiness_level: 'ready_within_year',
    skills: [] as string[], notes: '',
    weights: { leadership: 20, strategic: 15, performance: 15, innovation: 15, team: 15, technology: 10, integrity: 10 },
  });

  const toggleSkill = (skill: string) => {
    setReqs(r => ({
      ...r,
      skills: r.skills.includes(skill) ? r.skills.filter(s => s !== skill) : [...r.skills, skill],
    }));
  };

  const updateWeight = (axis: string, val: number) => {
    setReqs(r => ({ ...r, weights: { ...r.weights, [axis]: val } }));
  };

  async function save() {
    setSaving(true);
    await fetch('/api/organization/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        employee_count: parseInt(form.employee_count) || 0,
        parent_unit_id: form.parent_unit_id || null,
        requirements: reqs,
      }),
    });
    setSaving(false);
    router.push('/admin/organization');
  }

  return (
    <div dir="rtl" className="max-w-2xl mx-auto">
      <Link href="/admin/organization" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-5">
        <ArrowRight className="h-4 w-4" />العودة للهيكل التنظيمي
      </Link>
      <h1 className="text-xl font-bold text-primary-700 flex items-center gap-2 mb-6">
        <Building2 className="h-5 w-5" />إضافة وحدة تنظيمية
      </h1>

      {/* خطوات */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <button key={s} onClick={() => setStep(s)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition ${step === s ? 'bg-primary-700 text-white border-primary-700' : 'border-gold-200 text-darkgray hover:border-gold-400'}`}>
            {s === 1 ? 'بيانات الوحدة' : s === 2 ? 'متطلبات القيادة' : 'الأوزان والمهارات'}
          </button>
        ))}
      </div>

      {/* خطوة 1: بيانات الوحدة */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-primary-700 mb-1">اسم الوحدة *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                placeholder="مثال: إدارة الشؤون المالية" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">نوع الوحدة *</label>
              <select value={form.unit_type} onChange={e => setForm(f => ({ ...f, unit_type: e.target.value }))}
                className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                {UNIT_TYPES.map(t => <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">عدد الموظفين</label>
              <input type="number" value={form.employee_count} onChange={e => setForm(f => ({ ...f, employee_count: e.target.value }))}
                className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">الوصف</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">المهام الرئيسية</label>
            <textarea value={form.main_tasks} onChange={e => setForm(f => ({ ...f, main_tasks: e.target.value }))}
              rows={2} className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'sensitivity_level', label: 'درجة الحساسية', opts: [['low','منخفضة'],['medium','متوسطة'],['high','مرتفعة'],['critical','حرجة']] },
              { key: 'complexity_level', label: 'درجة التعقيد', opts: [['low','منخفضة'],['medium','متوسطة'],['high','مرتفعة']] },
              { key: 'leadership_need_level', label: 'مستوى الاحتياج القيادي', opts: [['low','منخفض'],['medium','متوسط'],['high','مرتفع'],['critical','حرج']] },
              { key: 'impact_level', label: 'مستوى التأثير', opts: [['low','محدود'],['medium','متوسط'],['high','مرتفع'],['strategic','استراتيجي']] },
            ].map(({ key, label, opts }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-primary-700 mb-1">{label}</label>
                <select value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['is_critical', 'وحدة حرجة'],
              ['has_vacancy', 'يوجد منصب شاغر'],
              ['needs_successor', 'تحتاج بديلاً قيادياً'],
              ['is_suitable_for_trial', 'مناسبة للتكليف التجريبي'],
              ['is_suitable_for_development', 'مناسبة للتطوير القيادي'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer p-3 border border-gold-100 rounded-xl hover:bg-gold-50">
                <input type="checkbox" checked={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="rounded text-primary-600" />
                <span className="text-sm text-primary-700">{label}</span>
              </label>
            ))}
          </div>

          <button onClick={() => setStep(2)}
            className="w-full py-2.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition">
            التالي: متطلبات القيادة
          </button>
        </div>
      )}

      {/* خطوة 2: متطلبات القيادة */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">نمط القيادة المطلوب</label>
            <div className="grid grid-cols-2 gap-2">
              {LEADERSHIP_TYPES.map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setReqs(r => ({ ...r, leadership_type: v }))}
                  className={`px-3 py-2 rounded-xl border text-sm text-right transition ${reqs.leadership_type === v ? 'bg-primary-700 text-white border-primary-700' : 'border-gold-200 text-primary-700 hover:border-gold-400'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">مستوى الجاهزية المطلوب</label>
            <div className="flex flex-wrap gap-2">
              {[
                ['ready_now', 'جاهز الآن'],
                ['ready_within_year', 'جاهز خلال سنة'],
                ['promising_with_development', 'واعد مع تطوير'],
                ['specialist_needs_qualification', 'متخصص يحتاج تأهيلاً'],
              ].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setReqs(r => ({ ...r, readiness_level: v }))}
                  className={`px-3 py-1.5 rounded-xl border text-sm transition ${reqs.readiness_level === v ? 'bg-primary-700 text-white border-primary-700' : 'border-gold-200 text-primary-700 hover:border-gold-400'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">ملاحظات</label>
            <textarea value={reqs.notes} onChange={e => setReqs(r => ({ ...r, notes: e.target.value }))}
              rows={2} className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-2 border border-gold-200 rounded-xl text-sm text-primary-700">
              السابق
            </button>
            <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-primary-700 text-white rounded-xl font-bold text-sm">
              التالي: الأوزان والمهارات
            </button>
          </div>
        </div>
      )}

      {/* خطوة 3: الأوزان والمهارات */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-3">الأوزان الخاصة بالوحدة</label>
            <div className="space-y-3">
              {AXES.map(({ k, l }) => (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkgray">{l}</span>
                    <span className="font-bold text-primary-700">{reqs.weights[k as keyof typeof reqs.weights]}%</span>
                  </div>
                  <input type="range" min={5} max={40} step={5}
                    value={reqs.weights[k as keyof typeof reqs.weights]}
                    onChange={e => updateWeight(k, parseInt(e.target.value))}
                    className="w-full accent-primary-600" />
                </div>
              ))}
              <div className="text-xs text-darkgray text-left">
                مجموع الأوزان: {Object.values(reqs.weights).reduce((s, v) => s + v, 0)}%
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">المهارات المطلوبة</label>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_SKILLS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition ${reqs.skills.includes(skill) ? 'bg-primary-700 text-white border-primary-700' : 'border-gold-200 text-primary-700 hover:border-gold-400'}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-2 border border-gold-200 rounded-xl text-sm text-primary-700">
              السابق
            </button>
            <button onClick={save} disabled={saving || !form.name}
              className="flex-1 py-2.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ الوحدة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
