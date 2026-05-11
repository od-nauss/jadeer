'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card, EmptyState } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

const NOTE_TYPES = [
  { value: 'general', label: 'ملاحظة عامة' },
  { value: 'fit', label: 'ملاحظة على الملاءمة' },
  { value: 'readiness', label: 'ملاحظة على الجاهزية' },
  { value: 'development_gap', label: 'ملاحظة على فجوة تطوير' },
  { value: 'strategic', label: 'ملاحظة استراتيجية' },
];

export default function AdvisorNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ candidate_profile_id: '', note_type: 'general', note_text: '', shared_with_governance: false });

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: userData } = await supabase.from('users').select('id').eq('auth_user_id', user.id).maybeSingle();
    if (!userData) return;
    const [notesRes, cardsRes] = await Promise.all([
      supabase.from('advisor_notes').select('*, candidate_profiles(users(full_name))').eq('advisor_user_id', userData.id).order('created_at', { ascending: false }),
      supabase.from('leadership_cards').select('candidate_profile_id, candidate_profiles(users(full_name))').eq('is_published', true).limit(50),
    ]);
    setNotes(notesRes.data || []);
    setCandidates((cardsRes.data || []).map((c: any) => ({ id: c.candidate_profile_id, name: c.candidate_profiles?.users?.full_name })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!form.note_text || form.note_text.length < 10) return;
    setSaving(true);
    const res = await fetch('/api/advisor/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    if (res.ok) { setSuccess(true); setShowForm(false); setForm({ candidate_profile_id: '', note_type: 'general', note_text: '', shared_with_governance: false }); setTimeout(() => setSuccess(false), 2000); load(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذه الملاحظة؟')) return;
    setDeleting(id);
    await fetch('/api/advisor/notes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setDeleting(null); load();
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none';
  const labelCls = 'block text-xs font-medium text-primary-700 mb-1';

  return (
    <div dir="rtl">
      <PageHeader
        title="ملاحظاتي الاستشارية"
        description="مساحة خاصة لملاحظاتك على البطاقات القيادية. تظهر للرئيس فقط ولا تُغيّر أي تصنيف."
        example="مثال: 'المرشح س قوي تشغيلياً لكن أرى أنه يستفيد من خبرة استراتيجية قبل التكليف الكامل.'"
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-darkgray">{notes.length} ملاحظة</div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-bold">
          <Plus className="h-4 w-4" />ملاحظة جديدة
        </button>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-sage">✓ تم حفظ الملاحظة</div>}

      {showForm && (
        <Card className="mb-5 bg-primary-50 border-primary-200">
          <h3 className="font-bold text-primary-700 mb-4">ملاحظة جديدة</h3>
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>المرشح (اختياري)</label>
                <select value={form.candidate_profile_id} onChange={e => setForm(p => ({ ...p, candidate_profile_id: e.target.value }))} className={inputCls}>
                  <option value="">ملاحظة عامة بدون مرشح</option>
                  {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>نوع الملاحظة</label>
                <select value={form.note_type} onChange={e => setForm(p => ({ ...p, note_type: e.target.value }))} className={inputCls}>
                  {NOTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>نص الملاحظة * (10 أحرف على الأقل)</label>
              <textarea rows={4} value={form.note_text} onChange={e => setForm(p => ({ ...p, note_text: e.target.value }))}
                className={inputCls} placeholder="اكتب ملاحظتك الاستشارية هنا..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.shared_with_governance} onChange={e => setForm(p => ({ ...p, shared_with_governance: e.target.checked }))}
                className="rounded border-gold-300 text-primary-600" />
              <span>مشاركة مع لجنة الحوكمة (اختياري)</span>
            </label>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving || form.note_text.length < 10}
                className="flex-1 btn-primary py-2.5 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                حفظ الملاحظة
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 text-darkgray text-sm">إلغاء</button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 bg-gold-50 rounded-xl animate-pulse" />)}</div>
      ) : notes.length === 0 ? (
        <EmptyState icon={<FileText className="h-10 w-10" />} title="لا توجد ملاحظات بعد" description="أضف ملاحظتك الاستشارية الأولى." action={<button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2.5 rounded-lg font-bold">ملاحظة جديدة</button>} />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const n = note as any;
            const typeLabel = NOTE_TYPES.find(t => t.value === n.note_type)?.label || n.note_type;
            return (
              <Card key={n.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 rounded">{typeLabel}</span>
                      {n.candidate_profiles?.users?.full_name && (
                        <span className="text-xs text-gold-700">— {n.candidate_profiles.users.full_name}</span>
                      )}
                      {n.shared_with_governance && <span className="text-xs bg-green-50 text-sage border border-green-200 px-1.5 py-0.5 rounded">مشاركة مع الحوكمة</span>}
                    </div>
                    <p className="text-sm text-primary-800 leading-relaxed">{n.note_text}</p>
                    <div className="text-xs text-darkgray mt-2">{new Date(n.created_at).toLocaleDateString('ar-SA')}</div>
                  </div>
                  <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id} className="p-1.5 text-darkgray hover:text-wine transition-colors flex-shrink-0">
                    {deleting === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
