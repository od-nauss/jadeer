'use client';

import { useEffect, useState, useCallback } from 'react';
import { Activity, Plus, Pencil, Trash2, ChevronDown, ChevronUp, AlertCircle, Target } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { KpiForm } from '@/components/candidate/KpiForm';
import { AiInsightPanel } from '@/components/candidate/AiInsightPanel';
import { createClient } from '@/lib/supabase/client';

const KPI_TYPE_LABELS: Record<string, string> = {
  operational: 'تشغيلي', strategic: 'استراتيجي', financial: 'مالي', quality: 'جودة',
  time: 'زمني', satisfaction: 'رضا مستفيدين', productivity: 'إنتاجية',
  compliance: 'امتثال', training: 'تدريب', other: 'أخرى',
};

export default function CandidateKPIsPage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('user_id', user.id).maybeSingle();
    if (!profile) { setLoading(false); return; }
    const { data } = await supabase.from('kpis').select('*').eq('candidate_profile_id', profile.id).order('created_at', { ascending: false });
    setKpis(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المؤشر؟')) return;
    setDeleting(id);
    await fetch(`/api/candidate/kpis/${id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
  }

  function openEdit(kpi: any) { setEditItem(kpi); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditItem(null); load(); }

  return (
    <div dir="rtl">
      <PageHeader
        title="مؤشرات الأداء"
        description="ما المؤشرات التي استخدمتها في قيادة العمل وتحسين القرار؟ المؤشر الجيد له مستهدف واضح، نتيجة فعلية، ومصدر بيانات موثوق."
        example="مؤشر وقت إنجاز الطلبات — مستهدف: 3 أيام — محقق: 2.4 يوم — تقارير النظام الشهرية"
        icon={<Activity className="h-5 w-5" />}
      />

      <div className="flex items-center justify-between mb-5">
        <div className="text-sm text-darkgray">
          {kpis.length} مؤشر{kpis.length < 2 ? ' — الحد الأدنى 2 للإرسال' : ''}
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold text-sm">
          <Plus className="h-4 w-4" />
          إضافة مؤشر
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 bg-gold-50 rounded-xl animate-pulse" />)}</div>
      ) : kpis.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-10 w-10" />}
          title="لا توجد مؤشرات بعد"
          description="أضف المؤشرات التي استخدمتها في عملك أو إدارتك. المؤشر الناضج يثبت اعتمادك على البيانات في القرار."
          action={<button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2.5 rounded-lg font-bold">إضافة أول مؤشر</button>}
        />
      ) : (
        <div className="space-y-3">
          {kpis.map((kpi) => {
            const isExpanded = expanded === kpi.id;
            const aiScore = kpi.ai_score;
            return (
              <Card key={kpi.id} className="!p-0 overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  {aiScore !== null && aiScore !== undefined && (
                    <div className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                      aiScore >= 75 ? 'bg-sage' : aiScore >= 55 ? 'bg-primary-600' : aiScore >= 35 ? 'bg-gold-500' : 'bg-wine'
                    }`}>
                      <span className="text-lg leading-none">{Math.round(aiScore)}</span>
                      <span className="opacity-80">%</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-primary-700">{kpi.name}</h3>
                        {kpi.kpi_type && (
                          <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded mt-1 inline-block">
                            {KPI_TYPE_LABELS[kpi.kpi_type] || kpi.kpi_type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(kpi)} className="p-1.5 text-darkgray hover:text-primary-700 hover:bg-gold-50 rounded-lg">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(kpi.id)} disabled={deleting === kpi.id} className="p-1.5 text-darkgray hover:text-wine hover:bg-rose-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => setExpanded(isExpanded ? null : kpi.id)} className="p-1.5 text-darkgray hover:text-primary-700 hover:bg-gold-50 rounded-lg">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      {kpi.target_value && (
                        <div><span className="text-xs text-darkgray">المستهدف </span><span className="font-medium text-primary-700">{kpi.target_value}</span></div>
                      )}
                      {kpi.actual_value && (
                        <div><span className="text-xs text-darkgray">المحقق </span><span className="font-bold text-sage">{kpi.actual_value}</span></div>
                      )}
                      {kpi.is_officially_approved && <Badge variant="sage">معتمد رسمياً</Badge>}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gold-100 bg-gold-50/50 px-4 py-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {kpi.purpose && <div><div className="text-xs font-semibold text-primary-600 mb-1">الغرض</div><p className="text-darkgray">{kpi.purpose}</p></div>}
                      {kpi.used_in_decision && <div><div className="text-xs font-semibold text-primary-600 mb-1">استخدامه في القرار</div><p className="text-darkgray">{kpi.used_in_decision}</p></div>}
                      {kpi.team_impact && <div><div className="text-xs font-semibold text-primary-600 mb-1">أثره على الفريق</div><p className="text-darkgray">{kpi.team_impact}</p></div>}
                      {kpi.evidence && <div><div className="text-xs font-semibold text-primary-600 mb-1">مصدر البيانات</div><p className="text-darkgray">{kpi.evidence}</p></div>}
                    </div>
                    {kpi.ai_feedback && kpi.ai_feedback.length > 0 && (
                      <AiInsightPanel title="ملاحظات التحليل الذكي" feedback={kpi.ai_feedback} collapsed />
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {kpis.length > 0 && kpis.length < 2 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          تحتاج إلى مؤشرين على الأقل قبل الإرسال للجنة.
        </div>
      )}

      {showForm && <KpiForm onClose={closeForm} existing={editItem} />}
    </div>
  );
}
