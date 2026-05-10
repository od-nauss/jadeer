'use client';

import { useState } from 'react';
import { Loader2, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/layout/PublicLayout';

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch {}
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />

      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-xl text-gold-200">
            للاستفسار حول منصة جدير أو طلب عرض تنفيذي
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="institutional-card p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-gold-700" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-700 mb-1">البريد الإلكتروني</h3>
                  <p className="text-darkgray text-sm" dir="ltr">jadeer@nauss.edu.sa</p>
                </div>
              </div>

              <div className="institutional-card p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-700 mb-1">الهاتف</h3>
                  <p className="text-darkgray text-sm" dir="ltr">+966 11 234 5678</p>
                </div>
              </div>

              <div className="institutional-card p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-sage/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-sage" />
                </div>
                <div>
                  <h3 className="font-bold text-primary-700 mb-1">العنوان</h3>
                  <p className="text-darkgray text-sm">
                    جامعة نايف العربية للعلوم الأمنية، الرياض، المملكة العربية السعودية
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="institutional-card p-6">
              {success ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 text-sage mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary-700 mb-2">تم استلام رسالتك</h3>
                  <p className="text-darkgray text-sm">سنتواصل معك قريباً.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-primary-700 mb-4">أرسل رسالتك</h3>

                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />

                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    dir="ltr"
                  />

                  <input
                    type="tel"
                    placeholder="رقم الجوال (اختياري)"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="الموضوع"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />

                  <textarea
                    placeholder="الرسالة"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 rounded-lg font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><Send className="h-4 w-4" /><span>إرسال</span></>)}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
