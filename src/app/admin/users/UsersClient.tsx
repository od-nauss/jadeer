'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui';
import { UserCog, ToggleLeft, ToggleRight, Loader2, CheckCircle2, X, Plus, Save } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'candidate', label: 'مرشح قيادي' },
  { value: 'hr', label: 'عضو موارد بشرية' },
  { value: 'governance', label: 'لجنة الحوكمة' },
  { value: 'advisor', label: 'مستشار' },
  { value: 'president', label: 'الرئيس' },
  { value: 'admin', label: 'مدير النظام' },
];

const ROLE_VARIANT: Record<string, string> = {
  candidate: 'gold', hr: 'sage', governance: 'wine',
  advisor: 'steelblue', president: 'primary', admin: 'gray',
};

interface User {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  job_title?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  user_roles: { roles: { code: string; name_ar: string } }[];
}

interface Props {
  initialUsers: User[];
}

export function UsersClient({ initialUsers }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: '', email: '', password: '', role: 'candidate', department: '', job_title: '' });
  const [addSaving, setAddSaving] = useState(false);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleRoleSave(userId: string) {
    if (!selectedRole) return;
    setSaving(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_role', role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'فشل تغيير الدور', false); return; }
      setUsers(prev => prev.map(u => u.id !== userId ? u : {
        ...u,
        user_roles: [{ roles: { code: selectedRole, name_ar: ROLE_OPTIONS.find(r => r.value === selectedRole)?.label || selectedRole } }],
      }));
      showToast('تم تغيير الدور بنجاح', true);
      setEditingId(null);
    } finally {
      setSaving(null);
    }
  }

  async function handleToggleActive(userId: string, currentActive: boolean) {
    setSaving(userId + '_toggle');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_active', is_active: !currentActive }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'فشل تحديث الحالة', false); return; }
      setUsers(prev => prev.map(u => u.id !== userId ? u : { ...u, is_active: !currentActive }));
      showToast(!currentActive ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم', true);
    } finally {
      setSaving(null);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.full_name || !addForm.email || !addForm.password) return;
    setAddSaving(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'فشل إنشاء المستخدم', false); return; }
      showToast('تم إنشاء المستخدم بنجاح', true);
      setShowAddForm(false);
      setAddForm({ full_name: '', email: '', password: '', role: 'candidate', department: '', job_title: '' });
      // Reload page to refresh user list
      window.location.reload();
    } finally {
      setAddSaving(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white';

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-bold transition-all ${toast.ok ? 'bg-sage text-white' : 'bg-wine text-white'}`}>
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-darkgray">{users.length} مستخدم مسجّل</div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 btn-primary px-4 py-2 rounded-lg text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          إضافة مستخدم
        </button>
      </div>

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold-200">
              <h2 className="text-lg font-bold text-primary-700">إضافة مستخدم جديد</h2>
              <button onClick={() => setShowAddForm(false)}><X className="h-5 w-5 text-darkgray" /></button>
            </div>
            <form onSubmit={handleAddUser} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">الاسم الكامل *</label>
                <input value={addForm.full_name} onChange={e => setAddForm(p => ({ ...p, full_name: e.target.value }))} className={inputCls} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">البريد الإلكتروني *</label>
                  <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className={inputCls} dir="ltr" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">كلمة المرور *</label>
                  <input type="password" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} className={inputCls} dir="ltr" required minLength={6} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">الإدارة</label>
                  <input value={addForm.department} onChange={e => setAddForm(p => ({ ...p, department: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">المسمى الوظيفي</label>
                  <input value={addForm.job_title} onChange={e => setAddForm(p => ({ ...p, job_title: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">الدور الأولي</label>
                <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))} className={inputCls}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2 border-t border-gold-200">
                <button type="submit" disabled={addSaving} className="flex-1 btn-primary py-2.5 rounded-lg font-bold flex items-center justify-center gap-2">
                  {addSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {addSaving ? 'جارٍ الإنشاء...' : 'إنشاء المستخدم'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 text-darkgray text-sm border border-gold-200 rounded-lg">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-gold-200">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="bg-gold-50 border-b border-gold-200 text-right">
              <th className="py-3 px-4 font-semibold text-primary-700">الاسم</th>
              <th className="py-3 px-4 font-semibold text-primary-700">البريد</th>
              <th className="py-3 px-4 font-semibold text-primary-700">الإدارة</th>
              <th className="py-3 px-4 font-semibold text-primary-700">الدور</th>
              <th className="py-3 px-4 font-semibold text-primary-700">الحالة</th>
              <th className="py-3 px-4 font-semibold text-primary-700">آخر دخول</th>
              <th className="py-3 px-4 font-semibold text-primary-700">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const roles = u.user_roles || [];
              const primaryRole = roles[0]?.roles;
              const isEditing = editingId === u.id;
              const isSavingRole = saving === u.id;
              const isSavingToggle = saving === u.id + '_toggle';

              return (
                <tr key={u.id} className="border-b border-gold-100 hover:bg-gold-50/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-primary-800">{u.full_name}</div>
                    {u.job_title && <div className="text-xs text-darkgray">{u.job_title}</div>}
                  </td>
                  <td className="py-3 px-4 text-xs text-darkgray" dir="ltr">{u.email}</td>
                  <td className="py-3 px-4 text-sm text-darkgray">{u.department || '—'}</td>

                  {/* الدور — قابل للتعديل */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedRole}
                          onChange={e => setSelectedRole(e.target.value)}
                          className="text-xs border border-gold-300 rounded-lg px-2 py-1.5 bg-white focus:ring-1 focus:ring-primary-500 outline-none"
                          autoFocus
                        >
                          <option value="">— اختر —</option>
                          {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <button
                          onClick={() => handleRoleSave(u.id)}
                          disabled={!selectedRole || isSavingRole}
                          className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                          {isSavingRole ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-darkgray hover:text-wine rounded-lg">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {primaryRole ? (
                          <Badge variant={ROLE_VARIANT[primaryRole.code] as any || 'gold'}>
                            {primaryRole.name_ar}
                          </Badge>
                        ) : <span className="text-xs text-darkgray">—</span>}
                        <button
                          onClick={() => { setEditingId(u.id); setSelectedRole(primaryRole?.code || ''); }}
                          className="p-1 text-darkgray hover:text-primary-700 rounded transition"
                          title="تغيير الدور"
                        >
                          <UserCog className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* الحالة — قابلة للتبديل */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleActive(u.id, u.is_active)}
                      disabled={!!isSavingToggle}
                      className="flex items-center gap-1.5 text-xs font-medium transition"
                      title={u.is_active ? 'اضغط لتعطيل' : 'اضغط لتفعيل'}
                    >
                      {isSavingToggle ? (
                        <Loader2 className="h-4 w-4 animate-spin text-darkgray" />
                      ) : u.is_active ? (
                        <><ToggleRight className="h-5 w-5 text-sage" /><span className="text-sage">مفعّل</span></>
                      ) : (
                        <><ToggleLeft className="h-5 w-5 text-darkgray" /><span className="text-darkgray">معطّل</span></>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-xs text-darkgray">
                    {u.last_login_at
                      ? new Date(u.last_login_at).toLocaleDateString('ar-SA')
                      : 'لم يسجل دخول'}
                  </td>

                  <td className="py-3 px-4 text-xs text-darkgray">
                    {new Date(u.created_at).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
