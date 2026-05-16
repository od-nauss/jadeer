'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Target, Plus, Trash2, CheckCircle2, Clock, ArrowRight, Loader2, Brain } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { READINESS_LEVELS } from '@/lib/utils';

const ACTION_TYPES = [
  { value: 'training_program', label: 'برنامج تدريبي' },
  { value: 'practical_assignment', label: 'تكليف عملي' },
  { value: 'leadership_mentoring', label: 'إرشاد قيادي' },
  { value: 'guided_reading', label: 'قراءة موجهة' },
  { value: 'applied_project', label: 'مشروع تطبيقي' },
  { value: 'job_rotation', label: 'تدوير وظيفي' },
  { value: 'performance_note', label: 'ملاحظة أداء' },
  { value: 'reassessment', label: 'إعادة تقييم' },
];

const ITEM_STATUS = [
  { value: 'not_started', label: 'لم يبدأ', color: 'text-darkgray' },
  { value: 'in_progress', label: 'قيد التنفيذ', color: 'text-steelblue' },
  { value: 'completed', label: 'مكتمل', color: 'text-sage' },
  { value: 'delayed', label: 'متأخر', color: 'text-wine' },
];

function generateAISuggestions(readinessLevel: string, gaps: string[]): Array<{ skill_gap: string; action_type: string; action_description: string }> {
  const baseMap: Record<string, Array<{ skill_gap: string; action_type: string; action_description: string }>> = {
    ready_now: [
      { skill_gap: 'التمكين والتكليف', action_type: 'practical_assignment', action_description: 'تكليف بمشروع قيادي خلال 3 أشهر مع إشراف خفيف.' },
      { skill_gap: 'قيادة الفريق المباشر', action_type: 'leadership_mentoring', action_description: 'إرشاد قيادي أسبوعي لمدة شهرين.' },
    ],
    ready_within_year: [
      { skill_gap: 'التفكير الاستراتيجي', action_type: 'training_program', action_description: 'برنامج في القيادة الاستراتيجية (32 ساعة).' },
      { skill_gap: 'إدارة المبادرات', action_type: 'applied_project', action_description: 'قيادة مبادرة تحسين داخلية مع قياس الأثر.' },
      { skill_gap: 'إعادة تقييم', action_type: 'reassessment', action_description: 'إعادة تقييم بعد 6 أشهر من التطوير.' },
    ],
    promising: [
      { skill_gap: 'تأسيس المهارات القيادية', action_type: 'training_program', action_description: 'برنامج تأسيسي في القيادة (40 ساعة).' },
      { skill_gap: 'مؤشرات الأداء', action_type: 'training_program', action_description: 'ورشة في بناء واستخدام مؤشرات الأداء.' },
      { skill_gap: 'مشروع تطبيقي صغير', action_type: 'applied_project', action_description: 'قيادة مشروع صغير محدد بهدف ونتيجة واضحة.' },
    ],
    high_performance_low_satisfaction: [
      { skill_gap: 'القيادة الإنسانية', action_type: 'training_program', action_description: 'تدريب في إدارة الخلافات والذكاء العاطفي.' },
      { skill_gap: 'رضا الفريق', action_type: 'leadership_mentoring', action_description: 'إرشاد في أساليب بناء الثقة مع الفريق.' },
      { skill_gap: 'قياس رضا الفريق', action_type: 'reassessment', action_description: 'قياس رضا الفريق بعد 3 أشهر من التطوير.' },
    ],
  };

  const suggestions = baseMap[readinessLevel] || baseMap.promising;

  // إضافة اقتراحات بناءً على الفجوات
  if (gaps.includes('الفريق')) suggestions.push({ skill_gap: 'إدارة الفريق', action_type: 'training_program', action_description: 'برنامج في إدارة الفرق عالية الأداء.' });
  if (gaps.includes('التقنية')) suggestions.push({ skill_gap: 'استخدام التقنية والذكاء الاصطناعي', action_type: 'training_program', action_description: 'برنامج في الأدوات الذكية للمديرين.' });

  return suggestions.slice(0, 4);
}

export default function DevelopmentPlanBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;

  const [candidate, setCandidate] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ skill_gap: '', action_type: 'training_program', action_description: '', responsible_party: '', success_indicator: '', target_date: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [profileRes, cardRes, planRes] = await Promise.all([
      supabase.from('candidate_profiles').select('*, users(full_name, job_title, department)').eq('id', candidateId).maybeSingle(),
      supabase.from('leadership_cards').select('total_score, readiness_level, gaps_json, strengths_json, ai_summary').eq('candidate_profile_id', candidateId).maybeSingle(),
      supabase.from('development_plans').select('*').eq('candidate_profile_id', candidateId).maybeSingle(),
    ]);
    setCandidate(profileRes.data as any);
    setCard(cardRes.data as any);
    setPlan(planRes.data as any);
    if (planRes.data) {
      const { data: planItems } = await supabase.from('development_plan_items').select('*').eq('development_plan_id', planRes.data.id).order('created_at');
      setItems(planItems || []);
      const gaps = (cardRes.data?.gaps_json as string[] || []);
      setAiSuggestions(generateAISuggestions(planRes.data.readiness_level, gaps));
    } else if (cardRes.data) {
      setAiSuggestions(generateAISuggestions(cardRes.data.readiness_level, cardRes.data.gaps_json || []));
    }
    setLoading(false);
  }, [candidateId]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove() {
    setSaving(true);
    await fetch(`/api/hr/development-plans/${candidateId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hr_review_status: 'approved', overall_status: 'approved' }),
    });
    setSaving(false); load();
  }

  async function addItem(item: typeof newItem) {
    setAddingItem(true);
    await fetch(`/api/hr/development-plans/${candidateId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item),
    });
    setAddingItem(false); setShowAddForm(false); setNewItem({ skill_gap: '', action_type: 'training_program', action_description: '', responsible_party: '', success_indicator: '', target_date: '', notes: '' });
    load();
  }

  async function updateItemStatus(itemId: string, status: string) {
    await fetch(`/api/hr/development-plans/items/${itemId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    load();
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/hr/development-plans/items/${itemId}`, { method: 'DELETE' });
    load();
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none';
  const labelCls = 'block text-xs font-medium text-primary-700 mb-1';
  const cu = candidate?.users;
  const level = card ? READINESS_LEVELS[card.readiness_level as keyof typeof READINESS_LEVELS] : null;
  const gaps = (card?.gaps_json as string[] || []);
  const strengths = (card?.strengths_json as string[] || []);

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-gold-50 rounded-xl animate-pulse" />)}</div>;

  return (
    <div dir="rtl">
      <Link href="/hr/development-plans" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-4">
        <ArrowRight className="h-4 w-4" />قائمة خطط التطوير
      </Link>

      {/* بطاقة مختصرة للمرشح */}
      <Card className="mb-5 bg-gradient-to-br from-primary-50 to-white border-primary-200">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {cu?.full_name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-primary-700">{cu?.full_name}</h2>
            <div className="text-sm text-darkgray">{cu?.job_title} · {cu?.department}</div>
            <div className="flex items-center gap-3 mt-2">
              {card && <div className="text-2xl font-bold text-gold-700">{Number(card.total_score).toFixed(0)}٪</div>}
              {level && <span className={`text-sm px-3 py-1 rounded-xl font-bold ${level.bg} ${level.color}`}>{level.label_ar}</span>}
              {plan && <Badge variant={plan.overall_status === 'approved' ? 'sage' : 'gold'}>{plan.overall_status}</Badge>}
            </div>
          </div>
          {plan && plan.overall_status !== 'approved' && (
            <button onClick={handleApprove} disabled={saving} className="flex-shrink-0 btn-primary px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60 flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              اعتماد الخطة
            </button>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {strengths.length > 0 && <div><div className="text-xs text-darkgray mb-1">نقاط القوة</div><div className="flex flex-wrap gap-1">{strengths.slice(0, 3).map((s, i) => <span key={i} className="text-xs bg-sage/10 text-sage border border-sage/20 px-2 py-0.5 rounded">{s}</span>)}</div></div>}
          {gaps.length > 0 && <div><div className="text-xs text-darkgray mb-1">الفجوات</div><div className="flex flex-wrap gap-1">{gaps.slice(0, 3).map((g, i) => <span key={i} className="text-xs bg-rose-50 text-wine border border-rose-200 px-2 py-0.5 rounded">{g}</span>)}</div></div>}
        </div>
      </Card>

      {/* توصيات الذكاء الاصطناعي */}
      {aiSuggestions.length > 0 && items.length === 0 && (
        <Card title="توصيات الذكاء الاصطناعي للخطة" className="mb-5 bg-gold-50 border-gold-300">
          <div className="space-y-2">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-2.5 bg-white rounded-lg border border-gold-100">
                <div>
                  <div className="text-sm font-medium text-primary-700">{s.skill_gap}</div>
                  <div className="text-xs text-darkgray mt-0.5">{s.action_description}</div>
                </div>
                <button onClick={() => addItem({ ...newItem, skill_gap: s.skill_gap, action_type: s.action_type, action_description: s.action_description })}
                  className="px-3 py-1 bg-primary-700 text-white text-xs rounded-lg font-bold hover:bg-primary-800 flex-shrink-0">
                  إضافة
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* بنود الخطة */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-primary-700">بنود خطة التطوير ({items.length})</h3>
        <button onClick={() => setShowAddForm(!showAddForm)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 text-white rounded-lg text-sm font-bold hover:bg-primary-800">
          <Plus className="h-4 w-4" />إضافة بند
        </button>
      </div>

      {/* نموذج إضافة بند */}
      {showAddForm && (
        <Card className="mb-4 bg-primary-50 border-primary-200">
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className={labelCls}>الفجوة أو المهارة *</label><input value={newItem.skill_gap} onChange={e => setNewItem(p => ({ ...p, skill_gap: e.target.value }))} className={inputCls} placeholder="مثال: إدارة الفريق" /></div>
            <div><label className={labelCls}>نوع الإجراء</label><select value={newItem.action_type} onChange={e => setNewItem(p => ({ ...p, action_type: e.target.value }))} className={inputCls}>{ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
            <div className="md:col-span-2"><label className={labelCls}>وصف الإجراء</label><textarea rows={2} value={newItem.action_description} onChange={e => setNewItem(p => ({ ...p, action_description: e.target.value }))} className={inputCls} placeholder="وصف تفصيلي للإجراء..." /></div>
            <div><label className={labelCls}>المسؤول عن المتابعة</label><input value={newItem.responsible_party} onChange={e => setNewItem(p => ({ ...p, responsible_party: e.target.value }))} className={inputCls} placeholder="مثال: المدير المباشر" /></div>
            <div><label className={labelCls}>تاريخ الهدف</label><input type="date" value={newItem.target_date} onChange={e => setNewItem(p => ({ ...p, target_date: e.target.value }))} className={inputCls} /></div>
            <div className="md:col-span-2"><label className={labelCls}>مؤشر النجاح</label><input value={newItem.success_indicator} onChange={e => setNewItem(p => ({ ...p, success_indicator: e.target.value }))} className={inputCls} placeholder="ما الذي يثبت اكتمال هذا البند؟" /></div>
          </div>
          <div className="flex gap-3 mt-3">
            <button onClick={() => addItem(newItem)} disabled={addingItem || !newItem.skill_gap} className="btn-primary px-5 py-2 rounded-xl font-bold disabled:opacity-60 flex items-center gap-2">
              {addingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}إضافة البند
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 text-darkgray text-sm">إلغاء</button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-darkgray text-sm">لا توجد بنود بعد. أضف بنوداً يدوياً أو من التوصيات أعلاه.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => {
            const si = ITEM_STATUS.find(s => s.value === item.status) || ITEM_STATUS[0];
            return (
              <Card key={item.id}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-primary-700">{item.skill_gap}</div>
                      <span className="text-xs bg-gold-50 text-gold-700 border border-gold-200 px-2 py-0.5 rounded">{ACTION_TYPES.find(a => a.value === item.action_type)?.label}</span>
                    </div>
                    {item.action_description && <p className="text-sm text-darkgray">{item.action_description}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-darkgray">
                      {item.responsible_party && <span>المسؤول: {item.responsible_party}</span>}
                      {item.target_date && <span>الهدف: {new Date(item.target_date).toLocaleDateString('ar-SA')}</span>}
                      {item.success_indicator && <span>المؤشر: {item.success_indicator}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select value={item.status} onChange={e => updateItemStatus(item.id, e.target.value)}
                      className={`text-xs px-2 py-1 border rounded-lg outline-none ${si.color}`}>
                      {ITEM_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button onClick={() => deleteItem(item.id)} className="p-1 text-darkgray hover:text-wine"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
