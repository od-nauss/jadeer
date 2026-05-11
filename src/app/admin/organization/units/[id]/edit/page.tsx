'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Building2, Loader2, ArrowRight, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

const UNIT_TYPES = ['organization','sector','agency','general_department','department','division','unit','committee','strategic_project','executive_office'];
const UNIT_TYPE_LABELS: Record<string, string> = {
  organization: 'منظمة', sector: 'قطاع', agency: 'وكالة',
  general_department: 'إدارة عامة', department: 'إدارة', division: 'قسم',
  unit: 'وحدة', committee: 'لجنة', strategic_project: 'مشروع استراتيجي',
  executive_office: 'مكتب تنفيذي',
};
const LEADERSHIP_TYPES = [
  { v: 'strategic', l: 'قائد استراتيجي' }, { v: 'operational', l: 'قائد تشغيلي' },
  { v: 'transformational', l: 'قائد تحويلي' }, { v: 'innovation', l: 'قائد ابتكاري' },
  { v: 'crisis', l: 'قائد أزمات' }, { v: 'high_performance_team', l: 'قائد فرق عالية الأداء' },
  { v: 'institutional_development', l: 'قائد تطوير مؤسسي' }, { v: 'technical', l: 'قائد تقني' },
  { v: 'academic', l: 'قائد أكاديمي' }, { v: 'executive_admin', l: 'قائد إداري تنفيذي' },
  { v: 'human', l: 'قائد إنساني' }, { v: 'specialist_leadership', l: 'متخصص قيادي' },
];
const REQUIRED_SKILLS = [
  'اتخاذ القرار', 'إدارة الفريق', 'إدارة الأزمات', 'التفكير الاستراتيجي',
  'تحليل البيانات', 'استخدام التقنية', 'بناء مؤشرات الأداء', 'إدارة المشاريع',
  'إدارة التغيير', 'التواصل', 'التفاوض', 'إدارة أصحاب العلاقة',
  'الابتكار', 'الضبط التشغيلي', 'الحوكمة', 'المعرفة الأكاديمية',
  'المعرفة الميدانية', 'العمل تحت الضغط',
];
const AXES = [
  { k: 'leadership', l: 'القيادة والتأثير' }, { k: 'strategic', l: 'التفكير الاستراتيجي' },
  { k: 'performance', l: 'الأداء والإنجاز' }, { k: 'innovation', l: 'الابتكار' },
  { k: 'team', l: 'رضا الفريق' }, { k: 'technology', l: 'استخدام التقنية' },
  { k: 'integrity', l: 'النزاهة والالتزام' },
];

export default function EditUnitPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [reqs, setReqs] = useState({
    leadership_type: '', readiness_level: 'ready_within_year',
    skills: [] as string[], notes: '',
    weights: { leadership: 20, strategic: 15, performance: 15, innovation: 15, team: 15, technology: 10, integrity: 10 },
  });

  useEffect(() => {
    fetch(`/api/organization/units/${unitId}`)
      .then(r => r.json())
      .then(data => {
        setForm(data);
        const req = Array.isArray(data.organization_unit_requirements)
          ? data.organization_unit_requirements[0]
          : data.organization_unit_requirements;
        if (req) {
          setReqs({
            leadership_type: req.required_leadership_type || '',
            readiness_level: req.required_readiness_level || 'ready_within_year',
            skills: (req.required_skills_json as string[]) || [],
            notes: req.notes || '',
            weights: (req.weights_json as any) || { leadership: 20, strategic: 15, performance: 15, innovation: 15, team: 15, technology: 10, integrity: 10 },
          });
        }
        setLoading(false);
      });
  }, [unitId]);

  const toggleSkill = (skill: string) =>
    setReqs(r => ({ ...r, skills: r.skills.includes(skill) ? r.skills.filter(s => s !== skill) : [...r.skills, skill] }));

  async function save() {
    setSaving(true);
    await fetch(`/api/organization/units/${unitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, requirements: reqs }),
    });
    setSaving(false);
    router.push('/admin/organization');
  }

  async function archive() {
    if (!confirm('هل تريد أرشفة هذه الوحدة؟')) return;
    await fetch(`/api/organization/units/${unitId}`, { method: 'DELETE' });
    router.push('/admin/organization');
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;

  return (
    <div dir="rtl" className="max-w-2xl mx-auto">
      <Link href="/admin/organization" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-5">
        <ArrowRight className="h-4 w-4" />العودة للهيكل التنظيمي
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary-700 flex items-center gap-2">
          <Building2 className="h-5 w-5" />تعديل: {form.name}
        </h1>
        <button onClick={archive} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-rose-200 text-wine rounded-xl hover:bg-rose-50">
          <Trash2 className="h-3 w-3" />أرشفة
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-primary-700 mb-1">اسم الوحدة *</label>
            <input value={form.name || ''} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">نوع الوحدة</label>
            <select value={form.unit_type || ''} onChange={e => setForm((f: any) => ({ ...f, unit_type: e.target.value }))}
              className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
              {UNIT_TYPES.map(t => <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">عدد الموظفين</label>
            <input type="number" value={form.employee_count || 0} onChange={e => setForm((f: any) => ({ ...f, employee_count: parseInt(e.target.value) }))}
              className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">الوصف</label>
          <textarea value={form.description || ''} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
            rows={2} className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">المهام الرئيسية</label>
          <textarea value={form.main_tasks || ''} onChange={e => setForm((f: any) => ({ ...f, main_tasks: e.target.value }))}
            rows={2} className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            ['sensitivity_level', 'درجة الحساسية', [['low','منخفضة'],['medium','متوسطة'],['high','مرتفعة'],['critical','حرجة']]],
            ['complexity_level', 'درجة التعقيد', [['low','منخفضة'],['medium','متوسطة'],['high','مرتفعة']]],
            ['leadership_need_level', 'الاحتياج القيادي', [['low','منخفض'],['medium','متوسط'],['high','مرتفع'],['critical','حرج']]],
            ['impact_level', 'مستوى التأثير', [['low','محدود'],['medium','متوسط'],['high','مرتفع'],['strategic','استراتيجي']]],
          ].map(([key, label, opts]) => (
            <div key={key as string}>
              <label className="block text-sm font-medium text-primary-700 mb-1">{label as string}</label>
              <select value={form[key as string] || 'medium'} onChange={e => setForm((f: any) => ({ ...f, [key as string]: e.target.value }))}
                className="w-full border border-gold-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                {(opts as [string, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[['is_critical','وحدة حرجة'],['has_vacancy','يوجد شاغر'],['needs_successor','تحتاج بديلاً'],['is_suitable_for_trial','للتكليف التجريبي'],['is_suitable_for_development','للتطوير القيادي']].map(([key, label]) => (
            <label key={key as string} className="flex items-center gap-2 cursor-pointer p-3 border border-gold-100 rounded-xl hover:bg-gold-50">
              <input type="checkbox" checked={!!form[key as string]}
                onChange={e => setForm((f: any) => ({ ...f, [key as string]: e.target.checked }))}
                className="rounded text-primary-600" />
              <span className="text-sm text-primary-700">{label as string}</span>
            </label>
          ))}
        </div>

        {/* متطلبات القيادة */}
        <div className="border-t border-gold-200 pt-4">
          <h3 className="text-sm font-bold text-primary-700 mb-3">متطلبات القيادة</h3>
          <div className="mb-3">
            <label className="block text-xs text-darkgray mb-2">نمط القيادة المطلوب</label>
            <div className="grid grid-cols-2 gap-2">
              {LEADERSHIP_TYPES.map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setReqs(r => ({ ...r, leadership_type: v }))}
                  className={`px-3 py-1.5 rounded-xl border text-xs text-right transition ${reqs.leadership_type === v ? 'bg-primary-700 text-white border-primary-700' : 'border-gold-200 text-primary-700 hover:border-gold-400'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-darkgray mb-2">المهارات المطلوبة</label>
            <div className="flex flex-wrap gap-1.5">
              {REQUIRED_SKILLS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                  className={`px-2 py-1 rounded-lg border text-xs transition ${reqs.skills.includes(skill) ? 'bg-primary-700 text-white border-primary-700' : 'border-gold-200 text-primary-700 hover:border-gold-400'}`}>
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-darkgray mb-2">الأوزان الخاصة</label>
            <div className="space-y-2">
              {AXES.map(({ k, l }) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-xs text-darkgray w-32">{l}</span>
                  <input type="range" min={5} max={40} step={5}
                    value={reqs.weights[k as keyof typeof reqs.weights] || 15}
                    onChange={e => setReqs(r => ({ ...r, weights: { ...r.weights, [k]: parseInt(e.target.value) } }))}
                    className="flex-1 accent-primary-600" />
                  <span className="text-xs font-bold text-primary-700 w-8">{reqs.weights[k as keyof typeof reqs.weights] || 15}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-2.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
}
