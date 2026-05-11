'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Trash2, AlertCircle, CheckCircle2, Send, Copy, Check, Link2, Clock } from 'lucide-react';
import { PageHeader, Card, Badge, EmptyState } from '@/components/ui';
import { NomineeForm } from '@/components/candidate/NomineeForm';
import { AiInsightPanel } from '@/components/candidate/AiInsightPanel';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

const REL_LABELS: Record<string, string> = {
  direct_manager: 'مدير مباشر', previous_manager: 'مدير سابق', peer: 'زميل',
  subordinate: 'مرؤوس', team_member: 'عضو فريق', stakeholder: 'صاحب علاقة',
  project_partner: 'شريك مشروع', internal_beneficiary: 'مستفيد داخلي', other: 'أخرى',
};

const LINK_STATUS_LABEL: Record<string, string> = {
  ready: 'جاهز للإرسال', copied: 'تم النسخ', opened: 'فُتح',
  submitted: 'تم التقييم', expired: 'منتهي', cancelled: 'ملغي',
};

export default function Candidate360Page() {
  const [nominees, setNominees] = useState<any[]>([]);
  const [approvedLinks, setApprovedLinks] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [profileStatus, setProfileStatus] = useState('new');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('candidate_profiles').select('id, status').eq('user_id', user.id).maybeSingle();
    if (profile?.status) setProfileStatus(profile.status);
    const pid = profile?.id || '';

    const [nomRes, linksRes] = await Promise.all([
      fetch('/api/candidate/360'),
      pid ? supabase.from('evaluation_links')
        .select('id, token, status, expires_at, submitted_at, approved_evaluators(full_name, relationship_type)')
        .eq('candidate_profile_id', pid)
        .order('created_at') : { data: [] },
    ]);

    const nomData = await nomRes.json();
    setNominees(nomData.nominees || []);
    setAnalysis(nomData.analysis || null);
    setApprovedLinks((linksRes.data as any[]) || []);
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

  async function handleSubmitToCommittee() {
    setSubmitting(true); setSubmitError(null);
    const res = await fetch('/api/candidate/360/submit', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) { setSubmitError(data.error); setSubmitting(false); return; }
    setSubmitSuccess(true);
    setSubmitting(false);
    load();
  }

  async function copyLink(token: string, id: string) {
    const url = `${window.location.origin}/evaluation/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    // تحديث حالة الرابط إلى "copied"
    await fetch(`/api/governance/links/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_copied' }),
    }).catch(() => {});
  }

  function closeForm() { setShowForm(false); load(); }

  const canEdit = !['awaiting_evaluators', 'awaiting_360', 'under_governance_review', 'approved'].includes(profileStatus);
  const canSubmit = nominees.length >= 15 && canEdit;
  const hasLinks = approvedLinks.length > 0;
  const total = nominees.length;
  const completedLinks = approvedLinks.filter(l => l.status === 'submitted').length;

  const STAGE = (() => {
    if (['awaiting_360', 'under_governance_review', 'approved'].includes(profileStatus)) return 'evaluation';
    if (profileStatus === 'awaiting_evaluators') return 'committee_review';
    return 'nomination';
  })();

  return (
    <div dir="rtl">
      <PageHeader
        title="دائرة الثقة القيادية — تقييم 360°"
        description="رشّح 15 شخصاً يعرفون أداءك المهني. ستراجع لجنة الحوكمة القائمة وتعتمد 7-10 مقيمين، مع ضمان أن 60٪+ من اختيارها لمنع التحيز."
        example="1 مدير مباشر + 3 زملاء + 3 مرؤوسين + 2 أصحاب علاقة + 2 شركاء مشاريع + 4 حسب اللجنة"
        icon={<Users className="h-5 w-5" />}
      />

      {/* مرحلة دائرة الثقة */}
      <div className="mb-5 flex items-center gap-3 overflow-x-auto pb-1">
        {[
          { key: 'nomination', label: '١ · ترشيح 15 مقيماً', done: total >= 15 },
          { key: 'committee_review', label: '٢ · مراجعة اللجنة', done: STAGE === 'evaluation' },
          { key: 'evaluation', label: '٣ · تقييم 360 (روابط)', done: completedLinks >= 7 },
        ].map(({ key, label, done }) => (
          <div key={key} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm whitespace-nowrap transition ${
            STAGE === key ? 'bg-primary-50 border-primary-300 text-primary-700 font-bold' :
            done ? 'bg-green-50 border-green-200 text-sage' :
            'bg-gold-50 border-gold-200 text-darkgray'
          }`}>
            {done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {label}
          </div>
        ))}
      </div>

      {/* تنبيه الحوكمة */}
      <div className="mb-5 p-4 bg-gold-50 border-r-4 border-gold-400 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-gold-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-darkgray leading-relaxed">
          <strong className="text-primary-700">قاعدة الحوكمة:</strong> أنت تقترح 15 مقيماً. اللجنة تعتمد 7-10، و60٪+ منهم من اختيارها.
          بعد الاعتماد ستجد روابط التقييم هنا — أرسلها للمقيمين مباشرةً.
          <strong className="text-wine"> لن تظهر لك نتائج التقييمات التفصيلية.</strong>
        </div>
      </div>

      {/* ── مرحلة الترشيح ── */}
      {STAGE === 'nomination' && (
        <>
          {/* إحصاء */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="institutional-card p-4 text-center">
              <div className="text-3xl font-bold text-primary-700">{total}</div>
              <div className="text-xs text-darkgray mt-1">من 15 مطلوباً</div>
            </div>
            <div className="institutional-card p-4 text-center">
              <div className="text-3xl font-bold text-sage">{nominees.filter(n => n.status === 'approved').length}</div>
              <div className="text-xs text-darkgray mt-1">معتمد من اللجنة</div>
            </div>
            <div className="institutional-card p-4 text-center">
              <div className="text-3xl font-bold text-gold-700">{nominees.filter(n => n.can_verify_initiatives).length}</div>
              <div className="text-xs text-darkgray mt-1">يؤكدون مبادرات</div>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="mb-5">
            <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-l from-primary-600 to-gold-500 rounded-full transition-all" style={{ width: `${(total / 15) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-darkgray mt-1">
              <span>{total} من 15</span>
              {total < 15 ? <span className="text-wine">يتبقى {15 - total}</span> : <span className="text-sage">✓ اكتملت القائمة</span>}
            </div>
          </div>

          {/* التحليل الذكي */}
          {analysis && total >= 3 && (
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
          {total < 15 && (
            <div className="mb-4">
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold text-sm">
                <Plus className="h-4 w-4" />إضافة مقيم ({total}/15)
              </button>
            </div>
          )}

          {/* رسائل */}
          {submitError && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-wine">{submitError}</div>}
          {submitSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-sage">✓ تم إرسال القائمة للجنة الحوكمة بنجاح!</div>}

          {/* قائمة المقيمين */}
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-gold-50 rounded-xl animate-pulse" />)}</div>
          ) : nominees.length === 0 ? (
            <EmptyState icon={<Users className="h-10 w-10" />} title="لا يوجد مقيمون بعد"
              description="ابدأ بإضافة 15 مقيماً من محيطك المهني. نوّع العلاقات للحصول على تقييم شامل."
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
                    <div className="text-xs text-darkgray">{REL_LABELS[n.relationship_type] || n.relationship_type}{n.department && ` · ${n.department}`}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {n.can_verify_initiatives && <span className="text-xs bg-blue-50 text-steelblue border border-blue-100 px-1.5 py-0.5 rounded">مبادرات</span>}
                    {n.can_verify_kpis && <span className="text-xs bg-green-50 text-sage border border-green-100 px-1.5 py-0.5 rounded">مؤشرات</span>}
                    <Badge variant={n.status === 'approved' ? 'sage' : n.status === 'rejected' ? 'wine' : 'gold'}>
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

          {/* زر إرسال القائمة */}
          {canSubmit && !submitSuccess && (
            <div className="mt-6 institutional-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-bold text-primary-700 mb-1">القائمة جاهزة للإرسال</div>
                  <div className="text-sm text-darkgray">
                    لديك {total} مقيماً. بعد الإرسال، لا يمكن تعديل القائمة. ستراجع اللجنة وتعتمد 7-10 مقيمين.
                  </div>
                </div>
                <button onClick={handleSubmitToCommittee} disabled={submitting}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold text-sm disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  إرسال للجنة الحوكمة
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── مرحلة انتظار اللجنة ── */}
      {STAGE === 'committee_review' && (
        <div className="institutional-card p-8 text-center">
          <div className="h-20 w-20 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-gold-600" />
          </div>
          <h3 className="text-xl font-bold text-primary-700 mb-2">قائمتك قيد مراجعة لجنة الحوكمة</h3>
          <p className="text-sm text-darkgray max-w-md mx-auto leading-relaxed">
            أرسلت {nominees.length} مقيماً. اللجنة ستراجع وتعتمد 7-10 مقيمين خلال الأيام القادمة.
            ستصلك إشعار فور اعتماد القائمة وإنشاء الروابط.
          </p>
        </div>
      )}

      {/* ── مرحلة التقييم — عرض الروابط ── */}
      {STAGE === 'evaluation' && (
        <div>
          <div className="mb-4">
            <div className="text-lg font-bold text-primary-700 mb-1">روابط تقييم 360</div>
            <div className="text-sm text-darkgray">
              {completedLinks} من {approvedLinks.length} تقييمات مكتملة.
              انسخ الرابط وأرسله لكل مقيم مباشرةً. كل رابط يستخدم مرة واحدة فقط.
            </div>
          </div>

          {/* شريط اكتمال */}
          <div className="mb-5">
            <div className="h-3 bg-gold-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${completedLinks >= 7 ? 'bg-sage' : 'bg-gold-500'}`}
                style={{ width: `${approvedLinks.length > 0 ? (completedLinks / approvedLinks.length) * 100 : 0}%` }} />
            </div>
            <div className="flex justify-between text-xs text-darkgray mt-1">
              <span>{completedLinks} من {approvedLinks.length} تقييمات مكتملة</span>
              {completedLinks >= 7 ? <span className="text-sage">✓ اكتمل بما يكفي</span> : <span>يُنصح بـ 7 على الأقل</span>}
            </div>
          </div>

          <div className="space-y-2">
            {approvedLinks.map((link) => {
              const ev = link as any;
              const evaluator = ev.approved_evaluators;
              const isCopied = copiedId === link.id;
              const isDone = link.status === 'submitted';
              const isExpired = link.status === 'expired' || link.status === 'cancelled';
              return (
                <div key={link.id} className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                  isDone ? 'bg-green-50 border-green-200' :
                  isExpired ? 'bg-gray-50 border-gray-200 opacity-60' :
                  'bg-white border-gold-200 hover:border-gold-300'
                }`}>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {evaluator?.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-primary-700">{evaluator?.full_name}</div>
                    <div className="text-xs text-darkgray">{REL_LABELS[evaluator?.relationship_type] || evaluator?.relationship_type}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={isDone ? 'sage' : isExpired ? 'gray' : 'gold'}>
                      {LINK_STATUS_LABEL[link.status] || link.status}
                    </Badge>
                    {!isDone && !isExpired && (
                      <button onClick={() => copyLink(link.token, link.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          isCopied ? 'bg-sage text-white' : 'bg-primary-700 text-white hover:bg-primary-800'
                        }`}>
                        {isCopied ? <><Check className="h-3.5 w-3.5" />تم النسخ</> : <><Copy className="h-3.5 w-3.5" />نسخ الرابط</>}
                      </button>
                    )}
                    {isDone && <CheckCircle2 className="h-5 w-5 text-sage" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* تعليمات */}
          <div className="mt-5 p-4 bg-primary-50 border border-primary-200 rounded-xl text-sm text-primary-700">
            <div className="font-semibold mb-1 flex items-center gap-2"><Link2 className="h-4 w-4" />تعليمات الإرسال</div>
            <ul className="text-xs space-y-1 list-disc list-inside text-darkgray">
              <li>انسخ الرابط وأرسله للمقيم عبر البريد أو رسالة مباشرة</li>
              <li>كل رابط فريد ومرتبط باسم المقيم — لا تشارك روابط الآخرين</li>
              <li>الرابط صالح 14 يوماً من تاريخ الإنشاء</li>
              <li><strong className="text-wine">لن تظهر لك إجابات المقيمين أو درجاتهم التفصيلية</strong></li>
            </ul>
          </div>
        </div>
      )}

      {showForm && <NomineeForm onClose={closeForm} />}
    </div>
  );
}
