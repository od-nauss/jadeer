'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, XCircle, Plus, AlertCircle, Users,
  Shield, Brain, Loader2, ExternalLink, Info
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { AiInsightPanel } from '@/components/candidate/AiInsightPanel';
import { createClient } from '@/lib/supabase/client';
import { analyzeNominees } from '@/lib/ai/analyzer';

const REL_LABELS: Record<string, string> = {
  direct_manager: 'مدير مباشر', previous_manager: 'مدير سابق', peer: 'زميل',
  subordinate: 'مرؤوس', team_member: 'عضو فريق', stakeholder: 'صاحب علاقة',
  project_partner: 'شريك مشروع', internal_beneficiary: 'مستفيد داخلي', other: 'أخرى',
};

const REL_TYPES = Object.entries(REL_LABELS).map(([value, label]) => ({ value, label }));

interface Nominee {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  relationship_type: string;
  knowledge_duration?: string;
  selection_justification?: string;
  can_verify_initiatives: boolean;
  can_verify_kpis: boolean;
  has_personal_relationship: boolean;
  status: string;
}

interface ApprovedEvaluator {
  id: string;
  full_name: string;
  email: string;
  relationship_type: string;
  committee_selected: boolean;
  added_by_committee: boolean;
  can_verify_initiatives: boolean;
  can_verify_kpis: boolean;
  notes?: string;
}

export default function EvaluatorApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;

  const [candidate, setCandidate] = useState<{ full_name: string; job_title?: string } | null>(null);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [approved, setApproved] = useState<ApprovedEvaluator[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: '', email: '', relationship_type: '', department: '', job_title: '', can_verify_initiatives: false, can_verify_kpis: false, notes: '' });
  const [addSaving, setAddSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: profile }, { data: nomineesData }, { data: approvedData }] = await Promise.all([
      supabase.from('candidate_profiles').select('users(full_name, job_title)').eq('id', candidateId).maybeSingle(),
      supabase.from('evaluator_nominees').select('*').eq('candidate_profile_id', candidateId).order('created_at'),
      supabase.from('approved_evaluators').select('*').eq('candidate_profile_id', candidateId),
    ]);
    const profileTyped = profile as any;
    setCandidate(profileTyped?.users || null);
    setNominees(nomineesData || []);
    setApproved(approvedData || []);

    const analysisData = analyzeNominees((nomineesData || []) as Parameters<typeof analyzeNominees>[0]);
    setAnalysis(analysisData);
    setLoading(false);
  }, [candidateId]);

  useEffect(() => { load(); }, [load]);

  const isApproved = (nomineeId: string) => approved.some(a => a.id === nomineeId || nominees.find(n => n.id === nomineeId && approved.some(ap => ap.full_name === n.full_name && ap.email === n.email)));
  const approvedNomineeIds = new Set(approved.filter(a => a.id).map(a => (nominees.find(n => n.full_name === a.full_name && n.email === a.email)?.id)));

  async function handleApprove(nomineeId: string, committee_selected: boolean) {
    setProcessing(nomineeId); setError(null);
    const res = await fetch(`/api/governance/evaluators/${candidateId}/approve`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomineeId, committee_selected }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setProcessing(null); return; }
    setSuccess('تم الاعتماد'); setTimeout(() => setSuccess(null), 2000);
    setProcessing(null); load();
  }

  async function handleReject(nomineeId: string) {
    setProcessing(nomineeId); setError(null);
    const res = await fetch(`/api/governance/evaluators/${candidateId}/reject`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomineeId }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error); }
    else { setSuccess('تم الاستبعاد'); setTimeout(() => setSuccess(null), 2000); }
    setProcessing(null); load();
  }

  async function handleAddDirect() {
    if (!addForm.full_name || !addForm.email || !addForm.relationship_type) {
      setError('الاسم والبريد والصلة مطلوبة'); return;
    }
    setAddSaving(true); setError(null);
    const res = await fetch(`/api/governance/evaluators/${candidateId}/add`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addForm),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setAddSaving(false); return; }
    setSuccess('تمت الإضافة من اللجنة'); setShowAddForm(false);
    setAddForm({ full_name: '', email: '', relationship_type: '', department: '', job_title: '', can_verify_initiatives: false, can_verify_kpis: false, notes: '' });
    setTimeout(() => setSuccess(null), 2000);
    setAddSaving(false); load();
  }

  async function handleGenerateLinks() {
    setGenerating(true); setError(null);
    const res = await fetch(`/api/governance/evaluators/${candidateId}/generate-links`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expireDays: 14 }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setGenerating(false); return; }
    setSuccess(`تم إنشاء ${data.linksCreated} رابط بنجاح! نسبة اللجنة: ${data.committeePercent}٪`);
    setGenerating(false); router.push(`/governance/360/${candidateId}`);
  }

  // إحصاءات الاعتماد
  const committeeCount = approved.filter(a => a.committee_selected || a.added_by_committee).length;
  const committeePercent = approved.length > 0 ? Math.round((committeeCount / approved.length) * 100) : 0;
  const canGenerate = approved.length >= 7 && approved.length <= 10 && committeePercent >= 60;

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none';
  const labelCls = 'block text-xs font-medium text-primary-700 mb-1';

  if (loading) return (
    <div className="space-y-3 p-6">
      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gold-50 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div dir="rtl">
      {/* رأس الصفحة */}
      <div className="mb-6">
        <Link href="/governance/evaluators" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-3">
          <ArrowRight className="h-4 w-4" />العودة لقائمة المرشحين
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-700">اعتماد المقيمين</h1>
            {candidate && (
              <div className="text-darkgray mt-1">{candidate.full_name} · {candidate.job_title}</div>
            )}
          </div>
          {/* لوحة الإحصاء */}
          <div className="flex gap-3">
            {[
              { val: nominees.length, label: 'مقترح', color: 'text-gold-700' },
              { val: approved.length, label: 'معتمد', color: 'text-sage' },
              { val: committeePercent + '%', label: 'نسبة اللجنة', color: committeePercent >= 60 ? 'text-sage' : 'text-wine' },
            ].map((s, i) => (
              <div key={i} className="institutional-card px-4 py-3 text-center min-w-[80px]">
                <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-darkgray">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* تنبيه الحوكمة */}
      <div className="mb-5 p-4 bg-gold-50 border-r-4 border-gold-400 rounded-xl flex items-start gap-3">
        <Shield className="h-5 w-5 text-gold-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-darkgray">
          <strong className="text-primary-700">قاعدة الحوكمة:</strong> اعتمد 7-10 مقيمين.
          يجب أن تكون نسبة 60٪ على الأقل من اختيار اللجنة (علّمهم كـ"اختيار اللجنة" عند الاعتماد أو أضفهم مباشرةً).
          {!canGenerate && (
            <div className="mt-2 text-wine font-medium">
              {approved.length < 7 && `يجب اعتماد ${7 - approved.length} مقيمين إضافيين. `}
              {approved.length > 10 && `العدد يتجاوز الحد الأقصى. `}
              {committeePercent < 60 && approved.length >= 7 && `نسبة اللجنة (${committeePercent}٪) أقل من 60٪.`}
            </div>
          )}
        </div>
      </div>

      {/* التغذية الراجعة */}
      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-wine">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-sage">{success}</div>}

      {/* شريط التقدم */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1 text-darkgray">
          <span>المعتمدون: {approved.length} / 7-10</span>
          <span className={committeePercent >= 60 ? 'text-sage' : 'text-wine'}>نسبة اللجنة: {committeePercent}٪ (مطلوب ≥60٪)</span>
        </div>
        <div className="h-3 bg-gold-100 rounded-full overflow-hidden flex gap-0.5">
          <div className={`h-full rounded-r-full transition-all ${approved.length >= 7 ? 'bg-sage' : 'bg-gold-500'}`}
            style={{ width: `${Math.min(100, (approved.length / 10) * 100)}%` }} />
        </div>
      </div>

      {/* التحليل الذكي */}
      {analysis && (
        <div className="mb-5">
          <AiInsightPanel
            title="تحليل قائمة المقيمين (ذكاء اصطناعي)"
            scores={{
              diversity: { value: analysis.diversity_score, label: 'التنوع' },
              coverage: { value: analysis.coverage_score, label: 'التغطية' },
            }}
            feedback={analysis.feedback}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* قائمة المقترحين */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary-700">المقيمون المقترحون ({nominees.length})</h3>
          </div>
          <div className="space-y-2">
            {nominees.map((n) => {
              const isProApproved = approved.some(a => a.email === n.email);
              const isRejected = n.status === 'rejected';
              const proc = processing === n.id;
              return (
                <div key={n.id} className={`p-3.5 rounded-xl border transition ${
                  isProApproved ? 'bg-green-50 border-green-200' :
                  isRejected ? 'bg-rose-50 border-rose-200 opacity-60' :
                  'bg-white border-gold-200 hover:border-gold-300'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary-700 truncate">{n.full_name}</span>
                        {isProApproved && <CheckCircle2 className="h-4 w-4 text-sage flex-shrink-0" />}
                        {isRejected && <XCircle className="h-4 w-4 text-wine flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-darkgray">{REL_LABELS[n.relationship_type] || n.relationship_type}{n.department && ` · ${n.department}`}</div>
                      {n.selection_justification && (
                        <div className="text-xs text-darkgray mt-1 line-clamp-1">{n.selection_justification}</div>
                      )}
                      <div className="flex gap-1.5 mt-1">
                        {n.can_verify_initiatives && <span className="text-xs bg-blue-50 text-steelblue border border-blue-100 px-1.5 py-0.5 rounded">مبادرات</span>}
                        {n.can_verify_kpis && <span className="text-xs bg-green-50 text-sage border border-green-100 px-1.5 py-0.5 rounded">مؤشرات</span>}
                        {n.has_personal_relationship && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">علاقة شخصية</span>}
                      </div>
                    </div>
                    {!isProApproved && !isRejected && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => handleApprove(n.id, true)} disabled={!!proc || approved.length >= 10}
                          title="اعتماد كاختيار اللجنة"
                          className="p-1.5 bg-sage text-white rounded-lg hover:bg-sage/80 disabled:opacity-40 text-xs">
                          {proc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => handleApprove(n.id, false)} disabled={!!proc || approved.length >= 10}
                          title="اعتماد من قائمة المرشح"
                          className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 text-xs">
                          {proc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '✓'}
                        </button>
                        <button onClick={() => handleReject(n.id)} disabled={!!proc}
                          className="p-1.5 bg-rose-100 text-wine rounded-lg hover:bg-rose-200 disabled:opacity-40">
                          {proc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* المعتمدون النهائيون + إضافة من اللجنة */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary-700">المعتمدون النهائيون ({approved.length})</h3>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-700 text-white rounded-lg text-xs font-bold hover:bg-primary-800">
              <Plus className="h-3.5 w-3.5" />
              إضافة من اللجنة
            </button>
          </div>

          {/* نموذج الإضافة المباشرة */}
          {showAddForm && (
            <div className="mb-3 p-4 bg-primary-50 border border-primary-200 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-primary-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />إضافة مقيم من اللجنة (يُحسب كاختيار اللجنة)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><label className={labelCls}>الاسم الكامل *</label><input value={addForm.full_name} onChange={e => setAddForm(p => ({ ...p, full_name: e.target.value }))} className={inputCls} /></div>
                <div className="col-span-2"><label className={labelCls}>البريد الإلكتروني *</label><input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className={inputCls} dir="ltr" /></div>
                <div><label className={labelCls}>صلة المقيم *</label>
                  <select value={addForm.relationship_type} onChange={e => setAddForm(p => ({ ...p, relationship_type: e.target.value }))} className={inputCls}>
                    <option value="">اختر</option>
                    {REL_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>الإدارة</label><input value={addForm.department} onChange={e => setAddForm(p => ({ ...p, department: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" checked={addForm.can_verify_initiatives} onChange={e => setAddForm(p => ({ ...p, can_verify_initiatives: e.target.checked }))} className="rounded" /><span>يؤكد مبادرات</span></label>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer"><input type="checkbox" checked={addForm.can_verify_kpis} onChange={e => setAddForm(p => ({ ...p, can_verify_kpis: e.target.checked }))} className="rounded" /><span>يؤكد مؤشرات</span></label>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddDirect} disabled={addSaving} className="flex-1 bg-primary-700 text-white py-2 rounded-lg text-sm font-bold disabled:opacity-60">
                  {addSaving ? 'جارٍ...' : 'إضافة'}
                </button>
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-darkgray text-sm">إلغاء</button>
              </div>
            </div>
          )}

          {/* القائمة النهائية */}
          {approved.length === 0 ? (
            <div className="text-center py-8 text-darkgray text-sm">لا يوجد مقيمون معتمدون بعد.</div>
          ) : (
            <div className="space-y-2">
              {approved.map((a) => (
                <div key={a.id} className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sage flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-primary-700 truncate">{a.full_name}</div>
                      <div className="text-xs text-darkgray">{REL_LABELS[a.relationship_type] || a.relationship_type}</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {a.committee_selected && <Badge variant="primary">اختيار اللجنة</Badge>}
                      {a.added_by_committee && <Badge variant="gold">مضاف من اللجنة</Badge>}
                    </div>
                  </div>
                  {(a.can_verify_initiatives || a.can_verify_kpis) && (
                    <div className="flex gap-1.5 mt-1.5 mr-6">
                      {a.can_verify_initiatives && <span className="text-xs bg-blue-50 text-steelblue border border-blue-100 px-1.5 py-0.5 rounded">مبادرات</span>}
                      {a.can_verify_kpis && <span className="text-xs bg-green-50 text-sage border border-green-100 px-1.5 py-0.5 rounded">مؤشرات</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* زر إنشاء الروابط */}
          <div className="mt-5">
            {canGenerate ? (
              <div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-sage mb-3 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  ✓ الشروط مستوفاة: {approved.length} مقيمين، {committeePercent}٪ من اللجنة. يمكنك إنشاء الروابط الآن.
                </div>
                <button onClick={handleGenerateLinks} disabled={generating}
                  className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                  {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ExternalLink className="h-5 w-5" />}
                  {generating ? 'جارٍ إنشاء الروابط...' : `إنشاء روابط التقييم (${approved.length} روابط)`}
                </button>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <div className="font-semibold mb-1">متطلبات الاعتماد</div>
                <ul className="space-y-0.5 text-xs">
                  <li className={approved.length >= 7 && approved.length <= 10 ? 'text-sage' : 'text-wine'}>
                    {approved.length >= 7 && approved.length <= 10 ? '✓' : '✗'} 7-10 مقيمين معتمدين (حالياً: {approved.length})
                  </li>
                  <li className={committeePercent >= 60 ? 'text-sage' : 'text-wine'}>
                    {committeePercent >= 60 ? '✓' : '✗'} 60٪+ من اللجنة (حالياً: {committeePercent}٪)
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* تعليمات زر الاعتماد */}
      <div className="mt-5 p-4 bg-primary-50 border border-primary-200 rounded-xl text-xs text-primary-700">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>كيفية الاعتماد:</strong>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li>الزر الأخضر (✓ bold) = اعتماد كـ<strong>اختيار اللجنة</strong> (يُحسب في نسبة 60٪)</li>
              <li>الزر الأزرق (✓) = اعتماد من قائمة المرشح (لا يُحسب في نسبة اللجنة)</li>
              <li>الزر الأحمر = استبعاد من القائمة</li>
              <li>زر "إضافة من اللجنة" = يُضاف مباشرةً ويُحسب كاختيار اللجنة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
