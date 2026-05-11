'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

const NOTE_TYPES = [
  { value: 'data_gap', label: 'نقص بيانات' },
  { value: 'development_need', label: 'احتياج تطوير' },
  { value: 'program_suggestion', label: 'اقتراح برنامج' },
  { value: 'track_suggestion', label: 'اقتراح مسار' },
  { value: 'follow_up', label: 'ملاحظة متابعة' },
  { value: 'delay', label: 'ملاحظة على تأخر' },
  { value: 'plan_note', label: 'ملاحظة على خطة تطوير' },
];

export default function HRNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ candidate_profile_id: '', note_type: 'follow_up', note_text: '', visible_to_candidate: false, visible_to_president: false, sent_to_governance: false });

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: userData } = await supabase.from('users').select('id').eq('auth_user_id', user.id).maybeSingle();
    const [notesRes, profilesRes] = await Promise.all([
      supabase.from('hr_notes').select('*, candidate_profiles(users(full_name))').eq('hr_user_id', userData?.id || '').order('created_at', { ascending: false }),
      supabase.from('candidate_profiles').select('id, users(full_name)').limit(100),
    ]);
    setNotes(notesRes.data || []);
    setCandidates((profilesRes.data || []).map((p: any) => ({ id: p.id, name: (p as any).users?.full_name })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!form.note_text || form.note_text.length < 10) return;
    setSaving(true);
    const res = await fetch('/api/hr/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setSuccess(true); setShowForm(false); setForm({ candidate_profile_id: '', note_type: 'follow_up', note_text: '', visible_to_candidate: false, visible_to_president: false, sent_to_governance: false }); setTimeout(() => setSuccess(false), 2000); load(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch('/api/hr/notes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setDeleting(null); load();
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none';
  const labelCls = 'block text-xs font-medium text-primary-700 mb-1';

  return (
    <div dir="rtl">
      <PageHeader title="ملاحظات الموارد البشرية" description="ملاحظات تطويرية وتشغيلية على ملفات المرشحين. يمكن رفعها للجنة أو إظهارها للمرشح." icon={<FileText className="h-5 w-5" />} />
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-darkgray">{notes.length} ملاحظة</div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-bold text-sm"><Plus className="h-4 w-4" />ملاحظة جديدة</button>
      </div>
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-sage">✓ تم الحفظ</div>}
      {showForm && (
        <Card className="mb-5 bg-primary-50 border-primary-200">
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className={labelCls}>المرشح</label><select value={form.candidate_profile_id} onChange={e => setForm(p => ({ ...p, candidate_profile_id: e.target.value }))} className={inputCls}><option value="">ملاحظة عامة</option>{candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className={labelCls}>النوع</label><select value={form.note_type} onChange={e => setForm(p => ({ ...p, note_type: e.target.value }))} className={inputCls}>{NOTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            </div>
            <div><label className={labelCls}>نص الملاحظة *</label><textarea rows={3} value={form.note_text} onChange={e => setForm(p => ({ ...p, note_text: e.target.value }))} className={inputCls} placeholder="اكتب ملاحظتك..." /></div>
            <div className="flex flex-wrap gap-4">
              {[['visible_to_candidate', 'مرئية للمرشح'], ['visible_to_president', 'مرئية للرئيس'], ['sent_to_governance', 'إرسال للحوكمة']].map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form[k as keyof typeof form] as boolean} onChange={e => setForm(p => ({ ...p, [k]: e.target.checked }))} className="rounded border-gold-300 text-primary-600" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving || form.note_text.length < 10} className="btn-primary px-5 py-2 rounded-xl font-bold disabled:opacity-60 flex items-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}حفظ
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 text-darkgray text-sm">إلغاء</button>
            </div>
          </div>
        </Card>
      )}
      {loading ? <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 bg-gold-50 rounded-xl animate-pulse" />)}</div>
      : notes.length === 0 ? <EmptyState icon={<FileText className="h-10 w-10" />} title="لا توجد ملاحظات" description="أضف أول ملاحظة." action={<button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2.5 rounded-lg font-bold">ملاحظة جديدة</button>} />
      : (
        <div className="space-y-3">
          {notes.map((n: any) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 rounded">{NOTE_TYPES.find(t => t.value === n.note_type)?.label || n.note_type}</span>
                    {n.candidate_profiles?.users?.full_name && <span className="text-xs text-gold-700">— {n.candidate_profiles.users.full_name}</span>}
                    {n.sent_to_governance && <span className="text-xs bg-green-50 text-sage border border-green-200 px-1.5 py-0.5 rounded">للحوكمة</span>}
                  </div>
                  <p className="text-sm text-primary-800 leading-relaxed">{n.note_text}</p>
                  <div className="text-xs text-darkgray mt-1">{new Date(n.created_at).toLocaleDateString('ar-SA')}</div>
                </div>
                <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id} className="p-1.5 text-darkgray hover:text-wine flex-shrink-0">
                  {deleting === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
