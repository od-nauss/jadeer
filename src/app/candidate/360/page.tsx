'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Trash2, AlertCircle, CheckCircle2, Clock, Brain } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { NomineeForm } from '@/components/candidate/NomineeForm';
import { AiInsightPanel } from '@/components/candidate/AiInsightPanel';
import { createClient } from '@/lib/supabase/client';

const REL_LABELS: Record<string, string> = {
  direct_manager: 'مدير مباشر', previous_manager: 'مدير سابق', peer: 'زميل',
  subordinate: 'مرؤوس', team_member: 'عضو فريق', stakeholder: 'صاحب علاقة',
  project_partner: 'شريك في مشروع', internal_beneficiary: 'مستفيد داخلي', other: 'أخرى',
};

const STATUS_COLORS: Record<string, 'sage' | 'gold' | 'wine' | 'primary'> = {
  pending: 'gold', approved: 'sage', rejected: 'wine',
};

export default function Candidate360Page() {
  const [nominees, setNominees] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [profileStatus, setProfileStatus] = useState('new');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('candidate_profiles').select('id, status').eq('user_id', user.id).maybeSingle();
    if (profile?.status) setProfileStatus(profile.status);

    const res = await fetch('/api/candidate/360');
    const data = await res.json();
    setNominees(data.nominees || []);
    setAnalysis(data.analysis || null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المقيم؟')) return;
    setDeleting(id);
    await fetch(`/api/candidate/360/${id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
  }

  function closeForm() { setShowForm(false); load(); }

  const canEdit = !['awaiting_evaluators', 'awaiting_360', 'under_governance_review', 'approved'].includes(profileStatus);
  const total = nominees.length;
  const remaining = Math.max(0, 15 - total);

  return (
    <div dir="rtl">
      <PageHeader
        title="دائرة الثقة القيادية — تقييم 360°"
        description="رشّح 15 شخصاً يعرفون أداءك المهني من زوايا مختلفة. لجنة الحوكمة ستعتمد 7-10 منهم، وتضمن أن 60% على الأقل من اختيارها لمنع التحيز."
        example="1 مدير مباشر + 3 زملاء + 3 مرؤوسين + 2 أصحاب علاقة + 2 شركاء مشاريع + 4 حسب تقدير اللجنة"
        icon={<Users className="h-5 w-5" />}
      />

      {/* تنبيه الحوكمة */}
      <div className="mb-5 p-4 bg-gold-50 border-r-4 border-gold-400 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-gold-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-darkgray leading-relaxed">
          <strong className="text-primary-700">قاعدة الحوكمة:</strong> أنت تقترح 15 مقيماً —
          اللجنة تعتمد 7-10 ويجب أن يكون 60%+ من اختيارها. هذا ضامن عدالة تقييمك.
          لا يمكن تعديل القائمة بعد إرسالها للجنة.
        </div>
      </div>

      {/* إحصاء */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="institutional-card p-4 text-center">
          <div className="text-3xl font-bold text-primary-700">{total}</div>
          <div className="text-xs text-darkgray mt-1">من 15 مرشحاً</div>
        </div>
        <div className="institutional-card p-4 text-center">
          <div className="text-3xl font-bold text-sage">{nominees.filter(n => n.status === 'approved').length}</div>
          <div className="text-xs text-darkgray mt-1">معتمدون</div>
        </div>
        <div className="institutional-card p-4 text-center">
          <div className="text-3xl font-bold text-gold-700">{nominees.filter(n => n.can_verify_initiatives).length}</div>
          <div className="text-xs text-darkgray mt-1">يؤكدون المبادرات</div>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="mb-5">
        <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-l from-primary-600 to-gold-500 rounded-full transition-all" style={{ width: `${(total / 15) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-darkgray mt-1">
          <span>{total} مقيم مقترح</span>
          {remaining > 0 ? <span className="text-wine">يتبقى {remaining}</span> : <span className="text-sage">✓ اكتملت القائمة</span>}
        </div>
      </div>

      {/* التحليل الذكي للقائمة */}
      {analysis && nominees.length >= 3 && (
        <div className="mb-5">
          <AiInsightPanel
            title="تحليل تنوع قائمة المقيمين"
            scores={{
              diversity: { value: analysis.diversity_score, label: 'التنوع' },
              coverage: { value: analysis.coverage_score, label: 'التغطية' },
            }}
            feedback={analysis.feedback}
          />
        </div>
      )}

      {/* زر الإضافة */}
      {canEdit && total < 15 && (
        <div className="mb-4">
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold text-sm">
            <Plus className="h-4 w-4" />
            إضافة مقيم ({total}/15)
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-gold-50 rounded-xl animate-pulse" />)}</div>
      ) : nominees.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="لا يوجد مقيمون بعد"
          description="ابدأ بإضافة 15 شخصاً من محيطك المهني. نوّع العلاقات لتحصل على تقييم أكثر شمولاً وعدلاً."
          action={<button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2.5 rounded-lg font-bold">إضافة أول مقيم</button>}
        />
      ) : (
        <div className="space-y-2">
          {nominees.map((n) => (
            <div key={n.id} className="flex items-center gap-3 p-3.5 bg-gold-50 border border-gold-200 rounded-xl hover:border-gold-300 transition">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {n.full_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-primary-700 truncate">{n.full_name}</div>
                <div className="text-xs text-darkgray">
                  {REL_LABELS[n.relationship_type] || n.relationship_type}
                  {n.department && ` · ${n.department}`}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {n.can_verify_initiatives && <span title="يؤكد المبادرات" className="text-xs bg-blue-50 text-steelblue border border-blue-200 px-1.5 py-0.5 rounded">مبادرات</span>}
                {n.can_verify_kpis && <span title="يؤكد المؤشرات" className="text-xs bg-green-50 text-sage border border-green-200 px-1.5 py-0.5 rounded">مؤشرات</span>}
                <Badge variant={STATUS_COLORS[n.status] || 'gold'}>
                  {n.status === 'pending' ? 'بانتظار اللجنة' : n.status === 'approved' ? 'معتمد' : n.status === 'rejected' ? 'مستبعد' : n.status}
                </Badge>
                {canEdit && n.status === 'pending' && (
                  <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                    className="p-1 text-darkgray hover:text-wine transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <NomineeForm onClose={closeForm} />}
    </div>
  );
}
