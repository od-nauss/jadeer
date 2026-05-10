import { User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PageHeader, Card } from '@/components/ui';

export default async function CandidateProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div>
      <PageHeader
        title="الملف القيادي"
        description="هذه البيانات الأساسية ستكون محور تقييمك. كن دقيقاً وشفافاً، فكل بيان قد يطلب التحقق منه."
        example="في خانة 'الخبرات السابقة'، اذكر المسمى الوظيفي والمدة والإنجازات الأبرز، ولا تتجاهل أصغر الأدوار التي طوّرت قيادتك."
        icon={User}
      />

      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">الاسم الكامل</label>
            <input
              type="text"
              defaultValue={user.full_name}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">رقم الموظف</label>
            <input
              type="text"
              defaultValue={user.employee_number || ''}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">المسمى الوظيفي</label>
            <input
              type="text"
              defaultValue={user.job_title || ''}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">الإدارة</label>
            <input
              type="text"
              defaultValue={user.department || ''}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-700 mb-1">سنوات الخبرة الكلية</label>
            <input
              type="number"
              defaultValue={profile?.years_of_experience || 0}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-700 mb-1">المؤهلات الأكاديمية</label>
            <textarea
              rows={3}
              defaultValue={profile?.academic_qualifications || ''}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="درجة + جامعة + سنة"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-700 mb-1">الخبرات السابقة</label>
            <textarea
              rows={4}
              defaultValue={profile?.previous_experience || ''}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="مسمى وظيفي، جهة، مدة، إنجازات أبرز"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-700 mb-1">المهارات والأدوات</label>
            <textarea
              rows={3}
              defaultValue={profile?.skills_and_tools || ''}
              className="w-full px-3 py-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              placeholder="مثلاً: Power BI، إدارة المشاريع، Six Sigma..."
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gold-200 flex items-center justify-between">
          <div className="text-sm text-darkgray">
            اكتمال الملف: <strong className="text-primary-700">{profile?.completion_score || 0}%</strong>
          </div>
          <button className="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-bold rounded-lg">
            حفظ
          </button>
        </div>
      </Card>
    </div>
  );
}
