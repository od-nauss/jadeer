import { AlertTriangle, Shield, Users, Zap, Eye } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const REL_LABELS: Record<string, string> = {
  direct_manager: 'مدير مباشر', previous_manager: 'مدير سابق', peer: 'زميل',
  subordinate: 'مرؤوس', team_member: 'عضو فريق', stakeholder: 'صاحب علاقة',
  project_partner: 'شريك مشروع', internal_beneficiary: 'مستفيد داخلي', other: 'أخرى',
};

interface ConflictCase {
  type: 'extreme_score' | 'personal_relationship' | 'low_diversity' | 'fast_submission';
  severity: 'high' | 'medium' | 'low';
  candidateName: string;
  candidateId: string;
  description: string;
  detail: string;
}

export default async function GovernanceConflictsPage() {
  const svc = createServiceClient();

  const [
    { data: evaluations },
    { data: nominees },
    { data: evalLinks },
    { data: profiles },
  ] = await Promise.all([
    svc.from('evaluations_360')
      .select('id, candidate_profile_id, overall_score, created_at, updated_at, approved_evaluator_id')
      .order('created_at', { ascending: false })
      .limit(200),
    svc.from('evaluator_nominees')
      .select('id, candidate_profile_id, full_name, relationship_type, has_personal_relationship, email, phone')
      .limit(300),
    svc.from('evaluation_links')
      .select('id, candidate_profile_id, approved_evaluator_id, submitted_at, created_at, status, approved_evaluators(full_name, relationship_type)')
      .eq('status', 'submitted')
      .limit(200),
    svc.from('candidate_profiles')
      .select('id, users(full_name, job_title, department)')
      .limit(100),
  ]);

  // خريطة أسماء المرشحين
  const profileMap: Record<string, string> = {};
  const profileLinkMap: Record<string, string> = {};
  (profiles || []).forEach((p: any) => {
    profileMap[p.id] = p.users?.full_name || '—';
    profileLinkMap[p.id] = p.id;
  });

  const cases: ConflictCase[] = [];

  // ── 1. التقييمات المتطرفة ───────────────────────────────────
  const byCandidate: Record<string, number[]> = {};
  (evaluations || []).forEach(ev => {
    if (!byCandidate[ev.candidate_profile_id]) byCandidate[ev.candidate_profile_id] = [];
    if (ev.overall_score !== null) byCandidate[ev.candidate_profile_id].push(Number(ev.overall_score));
  });
  for (const [pid, scores] of Object.entries(byCandidate)) {
    if (scores.length < 3) continue;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    for (const score of scores) {
      if (Math.abs(score - mean) > 28) {
        const diff = Math.round(Math.abs(score - mean));
        cases.push({
          type: 'extreme_score',
          severity: diff > 40 ? 'high' : 'medium',
          candidateName: profileMap[pid] || '—',
          candidateId: pid,
          description: 'تقييم متطرف مشبوه',
          detail: `درجة ${Math.round(score)}٪ مقابل متوسط ${Math.round(mean)}٪ — فارق ${diff} نقطة`,
        });
        break; // واحدة لكل مرشح
      }
    }
  }

  // ── 2. علاقات شخصية مُعلَنة ────────────────────────────────
  (nominees || []).filter((n: any) => n.has_personal_relationship).forEach((n: any) => {
    cases.push({
      type: 'personal_relationship',
      severity: 'medium',
      candidateName: profileMap[n.candidate_profile_id] || '—',
      candidateId: n.candidate_profile_id,
      description: 'مقيّم أفصح عن علاقة شخصية',
      detail: `${n.full_name} (${REL_LABELS[n.relationship_type] || n.relationship_type}) — أعلن وجود علاقة شخصية مع المرشح`,
    });
  });

  // ── 3. تنوع المقيمين منخفض ────────────────────────────────
  const relByCandidate: Record<string, string[]> = {};
  (evalLinks || []).forEach((l: any) => {
    const rel = (l.approved_evaluators as any)?.relationship_type || 'other';
    if (!relByCandidate[l.candidate_profile_id]) relByCandidate[l.candidate_profile_id] = [];
    relByCandidate[l.candidate_profile_id].push(rel);
  });
  for (const [pid, rels] of Object.entries(relByCandidate)) {
    if (rels.length < 4) continue;
    const freq: Record<string, number> = {};
    rels.forEach(r => { freq[r] = (freq[r] || 0) + 1; });
    const maxRel = Object.entries(freq).sort(([, a], [, b]) => b - a)[0];
    const pct = Math.round((maxRel[1] / rels.length) * 100);
    if (pct >= 70) {
      cases.push({
        type: 'low_diversity',
        severity: 'low',
        candidateName: profileMap[pid] || '—',
        candidateId: pid,
        description: 'تنوع محدود في فئات المقيمين',
        detail: `${pct}٪ من المقيمين ينتمون لفئة "${REL_LABELS[maxRel[0]] || maxRel[0]}" (${maxRel[1]} من ${rels.length})`,
      });
    }
  }

  // ── 4. سرعة إرسال غير معقولة (< 5 دقائق) ─────────────────
  (evalLinks || []).forEach((l: any) => {
    if (!l.submitted_at || !l.created_at) return;
    const diffMin = (new Date(l.submitted_at).getTime() - new Date(l.created_at).getTime()) / 60000;
    if (diffMin < 5 && diffMin > 0) {
      const evalName = (l.approved_evaluators as any)?.full_name || '—';
      cases.push({
        type: 'fast_submission',
        severity: 'medium',
        candidateName: profileMap[l.candidate_profile_id] || '—',
        candidateId: l.candidate_profile_id,
        description: 'إرسال التقييم بسرعة غير معقولة',
        detail: `${evalName} أكمل التقييم في ${Math.round(diffMin)} دقيقة — يُشير لعدم القراءة الدقيقة`,
      });
    }
  });

  // ترتيب حسب الأولوية
  const severityOrder = { high: 0, medium: 1, low: 2 };
  cases.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const highCount = cases.filter(c => c.severity === 'high').length;
  const medCount = cases.filter(c => c.severity === 'medium').length;
  const lowCount = cases.filter(c => c.severity === 'low').length;

  return (
    <div dir="rtl">
      <PageHeader
        title="مراجعة التحيز وتضارب المصالح"
        description="ترصد المنصة آلياً التقييمات المتطرفة والعلاقات الشخصية وضعف تنوع المقيمين. كل حالة تتطلب قرار اللجنة."
        icon={<AlertTriangle className="h-5 w-5" />}
      />

      {/* إحصاءات */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4 text-center bg-rose-50 border border-rose-200">
          <div className="text-3xl font-bold text-wine">{highCount}</div>
          <div className="text-xs text-darkgray mt-1">خطورة عالية</div>
        </div>
        <div className="rounded-xl p-4 text-center bg-amber-50 border border-amber-200">
          <div className="text-3xl font-bold text-amber-700">{medCount}</div>
          <div className="text-xs text-darkgray mt-1">خطورة متوسطة</div>
        </div>
        <div className="rounded-xl p-4 text-center bg-gold-50 border border-gold-200">
          <div className="text-3xl font-bold text-gold-700">{lowCount}</div>
          <div className="text-xs text-darkgray mt-1">خطورة منخفضة</div>
        </div>
      </div>

      {/* دليل المؤشرات */}
      <div className="grid md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Zap, label: 'تقييم متطرف', desc: 'فارق > 28% عن المتوسط', color: 'text-wine bg-rose-50 border-rose-200' },
          { icon: Users, label: 'علاقة شخصية', desc: 'مُعلَنة من المقيم', color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { icon: Shield, label: 'تنوع محدود', desc: 'فئة واحدة > 70%', color: 'text-steelblue bg-blue-50 border-blue-200' },
          { icon: Zap, label: 'إكمال سريع', desc: 'أقل من 5 دقائق', color: 'text-gold-700 bg-gold-50 border-gold-200' },
        ].map(({ icon: Icon, label, desc, color }) => (
          <div key={label} className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${color}`}>
            <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">{label}</div>
              <div className="text-xs opacity-80">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {cases.length === 0 ? (
        <div className="institutional-card p-8 text-center">
          <Shield className="h-12 w-12 text-sage mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary-700 mb-1">لم يُرصد أي تحيز أو تضارب مصالح</h3>
          <p className="text-sm text-darkgray">النتائج نظيفة وضمن النطاق المقبول. ستظهر أي حالات مشبوهة هنا تلقائياً.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c, i) => {
            const sevConfig = {
              high: { label: 'عالية', variant: 'wine' as const, bg: 'bg-rose-50 border-rose-200', icon: '🔴' },
              medium: { label: 'متوسطة', variant: 'gold' as const, bg: 'bg-amber-50 border-amber-200', icon: '🟡' },
              low: { label: 'منخفضة', variant: 'steelblue' as const, bg: 'bg-blue-50 border-blue-200', icon: '🔵' },
            };
            const typeIcons: Record<string, string> = {
              extreme_score: '⚡',
              personal_relationship: '👥',
              low_diversity: '📊',
              fast_submission: '⏱',
            };
            const sev = sevConfig[c.severity];
            return (
              <div key={i} className={`p-4 border rounded-xl ${sev.bg}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{typeIcons[c.type] || '⚠'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-primary-700">{c.candidateName}</span>
                        <Badge variant={sev.variant}>خطورة {sev.label}</Badge>
                      </div>
                      <div className="text-sm font-medium text-primary-700 mb-0.5">{c.description}</div>
                      <div className="text-xs text-darkgray">{c.detail}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/governance/reviews/${c.candidateId}`}
                      className="flex items-center gap-1 text-xs text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition"
                    >
                      <Eye className="h-3 w-3" />مراجعة
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* إجراءات اللجنة */}
      <Card title="إجراءات اللجنة المتاحة" className="mt-6 bg-primary-50 border-primary-200">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { title: 'قبول التقييم', desc: 'قبول التقييم رغم الملاحظة مع توثيق القرار', color: 'text-sage' },
            { title: 'استبعاد التقييم', desc: 'استبعاد التقييم المشبوه من حساب الدرجة', color: 'text-wine' },
            { title: 'طلب تقييم بديل', desc: 'إعادة اختيار مقيم آخر من القائمة', color: 'text-gold-700' },
          ].map(({ title, desc, color }) => (
            <div key={title} className="bg-white rounded-xl p-3">
              <div className={`font-bold text-sm mb-1 ${color}`}>{title}</div>
              <div className="text-xs text-darkgray">{desc}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-darkgray mt-3 border-t border-primary-200 pt-3">
          كل قرار يُوثَّق تلقائياً في سجل الحوكمة مع توقيت وهوية عضو اللجنة المتخذ للقرار.
        </p>
      </Card>
    </div>
  );
}
