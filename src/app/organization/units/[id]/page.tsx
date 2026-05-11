import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Building2, Users, AlertTriangle, Brain, TrendingUp, FileText, History } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { FIT_LEVEL_AR, FIT_LEVEL_COLOR } from '@/lib/ai/analyzerFit';

export const dynamic = 'force-dynamic';

const UNIT_TYPE_LABELS: Record<string, string> = {
  organization: 'منظمة', sector: 'قطاع', agency: 'وكالة',
  general_department: 'إدارة عامة', department: 'إدارة', division: 'قسم',
  unit: 'وحدة', committee: 'لجنة', strategic_project: 'مشروع استراتيجي',
  executive_office: 'مكتب تنفيذي',
};

const READINESS_AR: Record<string, string> = {
  ready_now: 'جاهز الآن', ready_within_year: 'خلال سنة', promising: 'واعد',
  specialist: 'متخصص', not_suitable: 'غير مناسب حالياً',
  high_performance_low_satisfaction: 'أداء عالٍ/رضا منخفض', human_leader: 'قائد إنساني',
};

const TABS = ['data', 'requirements', 'candidates', 'gaps', 'ai', 'succession'];
const TAB_LABELS: Record<string, string> = {
  data: 'بيانات الوحدة', requirements: 'متطلبات القيادة',
  candidates: 'أفضل المرشحين', gaps: 'الفجوات',
  ai: 'تحليل الذكاء الاصطناعي', succession: 'خطة التعاقب',
};

export default async function OrganizationUnitPage({
  params, searchParams
}: { params: { id: string }; searchParams: { tab?: string } }) {
  const tab = searchParams.tab || 'data';
  const supabase = createClient();

  const [{ data: unit }, { data: fitScores }, { data: successionMap }, { data: parent }] = await Promise.all([
    supabase.from('organization_units').select('*, organization_unit_requirements(*)').eq('id', params.id).single(),
    supabase.from('position_fit_scores')
      .select('*, candidate_profiles(id, completion_score, status, users(full_name, job_title, department))')
      .eq('organization_unit_id', params.id)
      .order('fit_score', { ascending: false }),
    supabase.from('succession_maps')
      .select('*, succession_candidates(*, candidate_profiles(users(full_name, job_title)))')
      .eq('organization_unit_id', params.id).single(),
    Promise.resolve({ data: null }),
  ]);

  if (!unit) notFound();

  const reqs = Array.isArray(unit.organization_unit_requirements)
    ? unit.organization_unit_requirements[0]
    : unit.organization_unit_requirements;

  const fitColors = { high: 'text-sage', good: 'text-primary-700', conditional: 'text-amber-700', low: 'text-gold-700', not_suitable: 'text-wine' };

  // تحليل الفجوات
  const allGaps: Record<string, number> = {};
  (fitScores || []).forEach((f: any) => {
    ((f.gaps_json as string[]) || []).forEach(g => { allGaps[g] = (allGaps[g] || 0) + 1; });
  });
  const topGaps = Object.entries(allGaps).sort(([, a], [, b]) => b - a).slice(0, 6);

  const readyNow = (fitScores || []).filter((f: any) =>
    (f.candidate_profiles as any)?.status === 'approved' && f.fit_score >= 80
  );
  const readyYear = (fitScores || []).filter((f: any) => f.fit_score >= 65 && f.fit_score < 80);

  return (
    <div dir="rtl">
      <Link href="/organization/map" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 mb-4">
        <ArrowRight className="h-4 w-4" />خريطة الملاءمة
      </Link>

      {/* رأس الوحدة */}
      <div className="p-6 bg-white border border-gold-200 rounded-2xl mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-700 mb-2">{unit.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">{UNIT_TYPE_LABELS[unit.unit_type] || unit.unit_type}</Badge>
              {unit.is_critical && <Badge variant="wine">وحدة حرجة</Badge>}
              {unit.has_vacancy && <Badge variant="gold">منصب شاغر</Badge>}
              {unit.needs_successor && <Badge variant="primary">تحتاج تعاقباً</Badge>}
            </div>
          </div>
          <div className="flex gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-700">{fitScores?.length || 0}</div>
              <div className="text-xs text-darkgray">مرشح محلل</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-sage">{readyNow.length}</div>
              <div className="text-xs text-darkgray">جاهز الآن</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gold-700">{unit.employee_count || 0}</div>
              <div className="text-xs text-darkgray">موظف</div>
            </div>
          </div>
        </div>
        {unit.description && <p className="text-darkgray text-sm mt-3 leading-relaxed">{unit.description}</p>}

        {/* Admin link */}
        <div className="mt-3 flex gap-2">
          <Link href={`/admin/organization/units/${params.id}/edit`}
            className="text-xs px-3 py-1.5 border border-gold-200 rounded-xl text-primary-700 hover:bg-gold-50">
            تعديل الوحدة
          </Link>
          <Link href={`/hr/competitions/create?unitId=${params.id}&unitName=${encodeURIComponent(unit.name)}`}
            className="text-xs px-3 py-1.5 border border-primary-200 rounded-xl text-primary-700 hover:bg-primary-50">
            إنشاء مسابقة لهذه الوحدة
          </Link>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {TABS.map(t => (
          <Link key={t} href={`?tab=${t}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${tab === t ? 'bg-primary-700 text-white' : 'border border-gold-200 text-primary-700 hover:border-gold-400'}`}>
            {TAB_LABELS[t]}
          </Link>
        ))}
      </div>

      {/* بيانات الوحدة */}
      {tab === 'data' && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="بيانات أساسية">
            <div className="space-y-2 text-sm">
              {[
                ['المهام الرئيسية', unit.main_tasks],
                ['طبيعة العمل', unit.work_nature],
                ['درجة الحساسية', unit.sensitivity_level],
                ['درجة التعقيد', unit.complexity_level],
                ['مستوى التأثير', unit.impact_level],
                ['مستوى الاحتياج القيادي', unit.leadership_need_level],
                ['عدد الموظفين', unit.employee_count],
              ].map(([label, value]) => value ? (
                <div key={label as string} className="flex gap-2">
                  <span className="text-darkgray min-w-40">{label}:</span>
                  <span className="text-primary-700 font-medium">{value}</span>
                </div>
              ) : null)}
            </div>
          </Card>
          <Card title="خصائص الوحدة">
            <div className="grid grid-cols-2 gap-2">
              {[
                ['is_critical', 'وحدة حرجة'],
                ['has_vacancy', 'منصب شاغر'],
                ['needs_successor', 'تحتاج تعاقباً'],
                ['is_suitable_for_trial', 'مناسبة للتكليف التجريبي'],
                ['is_suitable_for_development', 'مناسبة للتطوير القيادي'],
              ].map(([key, label]) => (
                <div key={key as string} className={`p-2 rounded-lg text-xs flex items-center gap-1 ${(unit as any)[key as string] ? 'bg-primary-50 text-primary-700' : 'bg-gray-50 text-gray-400'}`}>
                  {(unit as any)[key as string] ? '✓' : '×'} {label}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* متطلبات القيادة */}
      {tab === 'requirements' && (
        <Card title="متطلبات القيادة لهذه الوحدة">
          {reqs ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-darkgray text-xs mb-1">نمط القيادة المطلوب</div>
                  <div className="font-bold text-primary-700">{reqs.required_leadership_type || '—'}</div>
                </div>
                <div>
                  <div className="text-darkgray text-xs mb-1">مستوى الجاهزية المطلوب</div>
                  <div className="font-bold text-primary-700">{reqs.required_readiness_level || '—'}</div>
                </div>
              </div>
              {reqs.required_skills_json && (reqs.required_skills_json as string[]).length > 0 && (
                <div>
                  <div className="text-darkgray text-xs mb-2">المهارات المطلوبة</div>
                  <div className="flex flex-wrap gap-2">
                    {(reqs.required_skills_json as string[]).map((s: string) => (
                      <span key={s} className="px-2 py-1 bg-primary-50 border border-primary-100 text-primary-700 rounded-lg text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {reqs.weights_json && Object.keys(reqs.weights_json).length > 0 && (
                <div>
                  <div className="text-darkgray text-xs mb-2">الأوزان الخاصة بالوحدة</div>
                  <div className="space-y-1.5">
                    {Object.entries(reqs.weights_json as Record<string, number>).map(([axis, weight]) => (
                      <div key={axis} className="flex items-center gap-2">
                        <span className="text-xs text-darkgray w-40">{axis}</span>
                        <div className="flex-1 h-2 bg-gold-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: `${weight}%` }} />
                        </div>
                        <span className="text-xs font-bold text-primary-700 w-8">{weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-darkgray text-sm mb-3">لم تحدد متطلبات القيادة بعد</p>
              <Link href={`/admin/organization/units/${params.id}/edit`}
                className="text-sm px-4 py-2 bg-primary-700 text-white rounded-xl">
                إضافة المتطلبات
              </Link>
            </div>
          )}
        </Card>
      )}

      {/* أفضل المرشحين */}
      {tab === 'candidates' && (
        <div className="space-y-4">
          {readyNow.length > 0 && (
            <Card title={`جاهزون الآن (${readyNow.length})`} className="border-sage/30">
              <div className="space-y-2">
                {readyNow.map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-sage/5 border border-sage/20 rounded-xl">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                      {(f.candidate_profiles as any)?.users?.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-primary-700">{(f.candidate_profiles as any)?.users?.full_name}</div>
                      <div className="text-xs text-darkgray">{f.fit_reason}</div>
                    </div>
                    <div className="text-2xl font-bold text-sage">{Number(f.fit_score).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(fitScores || []).length > 0 ? (
            <Card title={`جميع المرشحين المحللين (${fitScores?.length})`}>
              <div className="space-y-2">
                {(fitScores || []).map((f: any, idx: number) => {
                  const level = FIT_LEVEL_AR[f.fit_level] || f.fit_level;
                  const color = FIT_LEVEL_COLOR[f.fit_level] || '';
                  return (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-gold-50 border border-gold-100 rounded-xl">
                      <div className="text-xs font-bold text-primary-600 w-5 flex-shrink-0">#{idx + 1}</div>
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                        {(f.candidate_profiles as any)?.users?.full_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-primary-800 text-sm">{(f.candidate_profiles as any)?.users?.full_name}</div>
                        <div className="text-xs text-darkgray truncate">{f.ai_summary?.slice(0, 80)}...</div>
                      </div>
                      <div className="text-center flex-shrink-0">
                        <div className={`text-xl font-bold ${fitColors[f.fit_level as keyof typeof fitColors]}`}>{Number(f.fit_score).toFixed(0)}%</div>
                        <div className={`text-xs px-1.5 py-0.5 rounded border ${color}`}>{level}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8 text-darkgray text-sm">
                لم يتم حساب درجات الملاءمة بعد.
                <form action="/api/organization/fit" method="POST" className="mt-3">
                  <input type="hidden" name="unitId" value={params.id} />
                  <button type="submit" className="px-4 py-2 bg-primary-700 text-white rounded-xl text-sm">حساب الملاءمة الآن</button>
                </form>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* الفجوات */}
      {tab === 'gaps' && (
        <Card title="الفجوات القيادية في الوحدة">
          {topGaps.length > 0 ? (
            <div className="space-y-2">
              {topGaps.map(([gap, count]) => (
                <div key={gap} className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-wine flex-shrink-0" />
                  <span className="flex-1 text-sm text-primary-700">{gap}</span>
                  <span className="text-xs font-bold text-wine">{count} مرشح</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-darkgray text-sm">لا توجد بيانات فجوات بعد.</div>
          )}
        </Card>
      )}

      {/* التحليل الذكي */}
      {tab === 'ai' && (
        <div className="space-y-4">
          {(fitScores || []).slice(0, 3).map((f: any) => (
            <div key={f.id} className="p-5 bg-primary-50 border border-primary-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-gold-600" />
                <span className="font-bold text-primary-700 text-sm">{(f.candidate_profiles as any)?.users?.full_name}</span>
                <span className={`text-sm font-bold ${fitColors[f.fit_level as keyof typeof fitColors]}`}>
                  {Number(f.fit_score).toFixed(0)}%
                </span>
              </div>
              {f.ai_summary && <p className="text-sm text-primary-800 leading-relaxed mb-3">{f.ai_summary}</p>}
              <div className="grid md:grid-cols-2 gap-3">
                {(f.strengths_match_json as string[] || []).length > 0 && (
                  <div>
                    <div className="text-xs text-sage font-bold mb-1">نقاط التوافق</div>
                    <ul className="space-y-0.5">
                      {(f.strengths_match_json as string[]).map((s: string, i: number) => (
                        <li key={i} className="text-xs text-primary-700 flex gap-1"><span className="text-sage">✓</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(f.gaps_json as string[] || []).length > 0 && (
                  <div>
                    <div className="text-xs text-wine font-bold mb-1">الفجوات</div>
                    <ul className="space-y-0.5">
                      {(f.gaps_json as string[]).map((g: string, i: number) => (
                        <li key={i} className="text-xs text-primary-700 flex gap-1"><span className="text-wine">•</span>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {f.recommended_action && (
                <div className="mt-3 p-2 bg-white border border-gold-200 rounded-lg text-xs text-primary-700">
                  <strong>الإجراء المقترح:</strong> {f.recommended_action}
                </div>
              )}
            </div>
          ))}
          {(!fitScores || fitScores.length === 0) && (
            <Card><div className="text-center py-6 text-darkgray text-sm">لا توجد تحليلات بعد. قم بتشغيل حساب الملاءمة.</div></Card>
          )}
        </div>
      )}

      {/* خطة التعاقب */}
      {tab === 'succession' && (
        <Card title="خطة التعاقب الوظيفي">
          {successionMap ? (
            <div>
              <div className="flex gap-3 mb-4">
                <Badge variant={successionMap.risk_level === 'critical' ? 'wine' : successionMap.risk_level === 'high' ? 'gold' : 'sage'}>
                  خطر: {successionMap.risk_level}
                </Badge>
                <Badge variant="primary">{successionMap.status}</Badge>
              </div>
              {successionMap.summary && <p className="text-sm text-darkgray mb-4">{successionMap.summary}</p>}
              {(successionMap.succession_candidates as any[] || []).length > 0 ? (
                <div className="grid md:grid-cols-3 gap-3">
                  {['البديل المباشر', 'الصف الثاني (سنة)', 'الصف الثالث (3 سنوات)'].map((label, idx) => {
                    const sc = (successionMap.succession_candidates as any[]).find(c => c.rank_order === idx + 1);
                    return (
                      <div key={idx} className={`p-4 rounded-xl border ${sc ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-xs text-primary-600 font-bold mb-2">{label}</div>
                        {sc ? (
                          <div>
                            <div className="font-bold text-primary-700">{(sc.candidate_profiles as any)?.users?.full_name}</div>
                            <div className="text-xs text-darkgray">{READINESS_AR[sc.readiness_level] || sc.readiness_level}</div>
                            <div className="text-xs font-bold text-gold-700 mt-1">{sc.fit_score}% ملاءمة</div>
                            {sc.time_to_ready && <div className="text-xs text-steelblue mt-1">التجهيز: {sc.time_to_ready}</div>}
                          </div>
                        ) : <div className="text-xs text-darkgray italic">لم يُحدد بعد</div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-darkgray">لم يُبنَ الصف القيادي بعد.</div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-darkgray text-sm">لم تُبنَ خطة تعاقب لهذه الوحدة بعد.</div>
          )}
        </Card>
      )}
    </div>
  );
}
