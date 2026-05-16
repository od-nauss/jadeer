'use client';

import { useState } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2, X, UserCheck } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'candidate', label: 'مرشح قيادي' },
  { value: 'hr', label: 'عضو موارد بشرية' },
  { value: 'governance', label: 'لجنة الحوكمة' },
  { value: 'advisor', label: 'مستشار' },
  { value: 'president', label: 'الرئيس' },
];

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  job_title?: string | null;
  department?: string | null;
  created_at: string;
}

interface CandidacyRequest {
  id: string;
  justification?: string | null;
  created_at: string;
  users: {
    id: string;
    full_name: string;
    email: string;
    job_title?: string | null;
    department?: string | null;
  };
}

interface Props {
  pendingUsers: PendingUser[];
  candidacyRequests: CandidacyRequest[];
}

export function PendingApprovals({ pendingUsers, candidacyRequests }: Props) {
  const [users, setUsers] = useState<PendingUser[]>(pendingUsers);
  const [requests, setRequests] = useState<CandidacyRequest[]>(candidacyRequests);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; type: 'user' | 'request'; role?: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function approveUser(userId: string) {
    const role = selectedRoles[userId] || 'candidate';
    setProcessing(userId);
    try {
      const res = await fetch('/api/auth/approve-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, action: 'approve' }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'فشل الموافقة', false); return; }
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('تم قبول المستخدم وتفعيل حسابه', true);
    } finally {
      setProcessing(null);
    }
  }

  async function rejectUser(userId: string, reason: string) {
    setProcessing(userId);
    try {
      const res = await fetch('/api/auth/approve-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reject', rejectionReason: reason }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'فشل الرفض', false); return; }
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('تم رفض الطلب', true);
    } finally {
      setProcessing(null);
      setRejectModal(null);
      setRejectReason('');
    }
  }

  async function approveRequest(requestId: string) {
    setProcessing(requestId);
    try {
      const res = await fetch('/api/auth/request-candidacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'approve' }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'فشل الموافقة', false); return; }
      setRequests(prev => prev.filter(r => r.id !== requestId));
      showToast('تم قبول طلب الترشح وإضافة الدور', true);
    } finally {
      setProcessing(null);
    }
  }

  async function rejectRequest(requestId: string, reason: string) {
    setProcessing(requestId);
    try {
      const res = await fetch('/api/auth/request-candidacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action: 'reject', rejectionReason: reason }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'فشل الرفض', false); return; }
      setRequests(prev => prev.filter(r => r.id !== requestId));
      showToast('تم رفض طلب الترشح', true);
    } finally {
      setProcessing(null);
      setRejectModal(null);
      setRejectReason('');
    }
  }

  function handleRejectConfirm() {
    if (!rejectModal) return;
    if (rejectModal.type === 'user') {
      rejectUser(rejectModal.id, rejectReason);
    } else {
      rejectRequest(rejectModal.id, rejectReason);
    }
  }

  const totalPending = users.length + requests.length;

  if (totalPending === 0) {
    return (
      <div className="text-center py-8 text-darkgray">
        <CheckCircle2 className="h-10 w-10 text-sage mx-auto mb-3" />
        <div className="font-medium">لا توجد طلبات معلقة</div>
        <div className="text-sm mt-1">جميع الطلبات تمت مراجعتها</div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-bold ${toast.ok ? 'bg-sage text-white' : 'bg-wine text-white'}`}>
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" dir="rtl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold-200">
              <h3 className="text-lg font-bold text-primary-700">سبب الرفض</h3>
              <button onClick={() => setRejectModal(null)}><X className="h-5 w-5 text-darkgray" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="اكتب سبب الرفض (اختياري)..."
                rows={3}
                className="w-full px-3 py-2 border border-gold-300 rounded-lg text-sm focus:ring-2 focus:ring-wine focus:border-wine outline-none resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRejectConfirm}
                  disabled={!!processing}
                  className="flex-1 py-2.5 bg-wine text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  تأكيد الرفض
                </button>
                <button onClick={() => setRejectModal(null)} className="px-4 py-2.5 text-darkgray text-sm border border-gold-200 rounded-lg">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Registrations */}
      {users.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gold-600" />
            <h3 className="text-base font-bold text-primary-700">طلبات التسجيل المعلقة ({users.length})</h3>
          </div>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="border border-gold-200 rounded-xl p-4 bg-gold-50/40 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="font-bold text-primary-800">{u.full_name}</div>
                  <div className="text-xs text-darkgray mt-0.5" dir="ltr">{u.email}</div>
                  {(u.job_title || u.department) && (
                    <div className="text-xs text-darkgray mt-0.5">
                      {u.job_title}{u.job_title && u.department ? ' — ' : ''}{u.department}
                    </div>
                  )}
                  <div className="text-xs text-darkgray mt-1">
                    تاريخ الطلب: {new Date(u.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={selectedRoles[u.id] || 'candidate'}
                    onChange={e => setSelectedRoles(prev => ({ ...prev, [u.id]: e.target.value }))}
                    className="text-xs border border-gold-300 rounded-lg px-2 py-1.5 bg-white focus:ring-1 focus:ring-primary-500 outline-none"
                  >
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <button
                    onClick={() => approveUser(u.id)}
                    disabled={processing === u.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sage text-white rounded-lg text-xs font-bold hover:bg-sage/90 transition disabled:opacity-60"
                  >
                    {processing === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    قبول
                  </button>
                  <button
                    onClick={() => setRejectModal({ id: u.id, type: 'user' })}
                    disabled={!!processing}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-wine text-wine rounded-lg text-xs font-bold hover:bg-wine/5 transition disabled:opacity-60"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidacy Requests */}
      {requests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-5 w-5 text-steelblue" />
            <h3 className="text-base font-bold text-primary-700">طلبات إضافة دور مرشح ({requests.length})</h3>
          </div>
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="border border-primary-100 rounded-xl p-4 bg-primary-50/30 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="font-bold text-primary-800">{r.users?.full_name}</div>
                  <div className="text-xs text-darkgray mt-0.5" dir="ltr">{r.users?.email}</div>
                  {(r.users?.job_title || r.users?.department) && (
                    <div className="text-xs text-darkgray mt-0.5">
                      {r.users?.job_title}{r.users?.job_title && r.users?.department ? ' — ' : ''}{r.users?.department}
                    </div>
                  )}
                  {r.justification && (
                    <div className="text-xs text-darkgray mt-1 italic">"{r.justification}"</div>
                  )}
                  <div className="text-xs text-darkgray mt-1">
                    تاريخ الطلب: {new Date(r.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => approveRequest(r.id)}
                    disabled={processing === r.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sage text-white rounded-lg text-xs font-bold hover:bg-sage/90 transition disabled:opacity-60"
                  >
                    {processing === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    قبول
                  </button>
                  <button
                    onClick={() => setRejectModal({ id: r.id, type: 'request' })}
                    disabled={!!processing}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-wine text-wine rounded-lg text-xs font-bold hover:bg-wine/5 transition disabled:opacity-60"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
