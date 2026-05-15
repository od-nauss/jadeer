'use client';

import { useEffect, useState, useCallback } from 'react';
import { Briefcase, Plus, Pencil, Trash2, Brain, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { InitiativeForm } from '@/components/candidate/InitiativeForm';
import { AiInsightPanel } from '@/components/candidate/AiInsightPanel';
import { createClient } from '@/lib/supabase/client';

const STATUS_LABELS: Record<string, { label: string; variant: 'sage' | 'gold' | 'primary' | 'wine' }> = {
  draft:     { label: 'مسودة', variant: 'gold' },
  submitted: { label: 'مرسلة للجنة', variant: 'primary' },
  verified:  { label: 'محققة', variant: 'sage' },
  returned:  { label: 'معادة', variant: 'wine' },
};

const TYPE_LABELS: Record<string, string> = {
  operational: 'تشغيلية', strategic: 'استراتيجية', technical: 'تقنية',
  development: 'تطويرية', improvement: 'تحسينية', innovation: 'ابتكارية',
  service: 'خدمية', financial: 'مالية', training: 'تدريبية', other: 'أخرى',
};

export default function CandidateInitiativesPage() {
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
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
    const { data: profile } = await supabase.from('candidate_profiles').select('id, status').eq('user_id', user.id).maybeSingle();
    setProfileId(profile?.id || null);
    if (!profile?.id) { setLoading(false); return; }
    const { data } = await supabase.from('initiatives').select('*').eq('candidate_profile_id', profile.id).order('created_at', { ascending: false });
    setInitiatives(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه المبادرة؟')) return;
    setDeleting(id);
    await fetch(`/api/candidate/initiatives/${id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
  }

  function openEdit(ini: any) { setEditItem(ini); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditItem(null); load(); }

  return (
    <div dir="rtl">
      <PageHeader
        title="المبادرات والإنجازات"
        description="وثّق المبادرات التي قدتها أو شاركت فيها. وضّح المشكلة، دورك الفعلي، الأثر الرقمي، والشهود. لجنة الحوكمة ستراجع كل مبادرة."
        example="أتمتة نظام طلبات الداخلية — قلل وقت المعالجة من 5 أيام إلى يوم — قائد المشروع — تقرير الإدارة شاهد"
        icon={<Briefcase className="h-5 w-5" />}
      />

      {/* شريط الإجراءات */}
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm text-darkgray">
          {initiatives.length} مبادرة{initiatives.length === 0 ? '' : ` — الحد الأدنى 2 للإرسال`}
        </div>
        <button onClick={() => { setEditItem(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg font-bold text-sm transition-colors">
          <Plus className="h-4 w-4" />
          إضافة مبادرة
        </button>
      </div>

      {/* تحذير: الملف القيادي غير مكتمل */}
      {!loading && !profileId && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl mb-5">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-amber-800 text-sm">يجب إكمال الملف القيادي أولاً</div>
            <div className="text-xs text-amber-700 mt-0.5">
              احفظ الملف القيادي بالبيانات الأساسية قبل إضافة المبادرات.
              {' '}<a href="/candidate/profile" className="underline font-bold">اذهب للملف القيادي ←</a>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 bg-gold-50 rounded-xl animate-pulse" />)}
        </div>
      ) : initiatives.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-10 w-10" />}
          title="لا توجد مبادرات بعد"
          description="ابدأ بتوثيق أول مبادرة قدتها أو شاركت فيها. المبادرات الجيدة لها مشكلة واضحة، دور محدد، وأثر قابل للقياس."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2.5 rounded-lg font-bold">
              إضافة أول مبادرة
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {initiatives.map((ini) => {
            const statusInfo = STATUS_LABELS[ini.status] || STATUS_LABELS.draft;
            const aiScore = ini.ai_score;
            const isExpanded = expanded === ini.id;
            return (
              <Card key={ini.id} className="!p-0 overflow-hidden">
                {/* Header Row */}
                <div className="flex items-start gap-3 p-4">
                  {/* AI Score Badge */}
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
                        <h3 className="font-bold text-primary-700">{ini.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {ini.initiative_type && (
                            <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded">
                              {TYPE_LABELS[ini.initiative_type] || ini.initiative_type}
                            </span>
                          )}
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {ini.status === 'draft' && (
                          <>
                            <button onClick={() => openEdit(ini)}
                              className="p-1.5 text-darkgray hover:text-primary-700 hover:bg-gold-50 rounded-lg transition-colors">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(ini.id)} disabled={deleting === ini.id}
                              className="p-1.5 text-darkgray hover:text-wine hover:bg-rose-50 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => setExpanded(isExpanded ? null : ini.id)}
                          className="p-1.5 text-darkgray hover:text-primary-700 hover:bg-gold-50 rounded-lg transition-colors">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick info */}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-darkgray">
                      {ini.achieved_impact && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-sage" />
                          {ini.achieved_impact.substring(0, 60)}{ini.achieved_impact.length > 60 ? '...' : ''}
                        </span>
                      )}
                      {ini.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ini.duration}
                        </span>
                      )}
                      {ini.evidence && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-gold-600" />
                          شواهد مضافة
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gold-100 bg-gold-50/50 px-4 py-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {ini.problem_description && (
                        <div>
                          <div className="text-xs font-semibold text-primary-600 mb-1">المشكلة</div>
                          <p className="text-darkgray">{ini.problem_description}</p>
                        </div>
                      )}
                      {ini.candidate_role && (
                        <div>
                          <div className="text-xs font-semibold text-primary-600 mb-1">دوري</div>
                          <p className="text-darkgray">{ini.candidate_role}</p>
                        </div>
                      )}
                      {ini.impact_metrics && (
                        <div>
                          <div className="text-xs font-semibold text-primary-600 mb-1">مؤشر الأثر</div>
                          <p className="text-darkgray">{ini.impact_metrics}</p>
                        </div>
                      )}
                      {ini.evidence && (
                        <div>
                          <div className="text-xs font-semibold text-primary-600 mb-1">الشواهد</div>
                          <p className="text-darkgray">{ini.evidence}</p>
                        </div>
                      )}
                    </div>
                    {/* دور الموظف flags */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {ini.was_idea_owner && <span className="bg-primary-50 text-primary-700 border border-primary-200 px-2 py-1 rounded">صاحب الفكرة</span>}
                      {ini.led_implementation && <span className="bg-primary-50 text-primary-700 border border-primary-200 px-2 py-1 rounded">قاد التنفيذ</span>}
                      {ini.participated_implementation && <span className="bg-gold-50 text-gold-700 border border-gold-200 px-2 py-1 rounded">شارك في التنفيذ</span>}
                      {ini.coordinated_parties && <span className="bg-gold-50 text-gold-700 border border-gold-200 px-2 py-1 rounded">نسّق بين الجهات</span>}
                      {ini.developed_tool && <span className="bg-blue-50 text-steelblue border border-blue-200 px-2 py-1 rounded">طوّر أداة</span>}
                      {ini.is_sustainable && <span className="bg-green-50 text-sage border border-green-200 px-2 py-1 rounded">قابلة للاستدامة</span>}
                      {ini.is_generalizable && <span className="bg-green-50 text-sage border border-green-200 px-2 py-1 rounded">قابلة للتعميم</span>}
                    </div>
                    {/* AI Feedback */}
                    {ini.ai_feedback && ini.ai_feedback.length > 0 && (
                      <AiInsightPanel title="ملاحظات التحليل الذكي" feedback={ini.ai_feedback} collapsed />
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* الحد الأدنى تنبيه */}
      {initiatives.length > 0 && initiatives.length < 2 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>تحتاج إلى مبادرتين على الأقل قبل إرسال ملفك للجنة الحوكمة.</span>
        </div>
      )}

      {/* نافذة النموذج */}
      {showForm && (
        <InitiativeForm
          profileId={profileId || ''}
          onClose={closeForm}
          existing={editItem}
        />
      )}
    </div>
  );
}
