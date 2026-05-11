import Link from 'next/link';
import { Building2, Plus, AlertTriangle, CheckCircle, Users, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

const UNIT_TYPE_LABELS: Record<string, string> = {
  organization: 'منظمة', sector: 'قطاع', agency: 'وكالة',
  general_department: 'إدارة عامة', department: 'إدارة', division: 'قسم',
  unit: 'وحدة', committee: 'لجنة', strategic_project: 'مشروع استراتيجي',
  executive_office: 'مكتب تنفيذي',
};

const SENSITIVITY_COLORS: Record<string, string> = {
  low: 'text-sage bg-sage/10', medium: 'text-gold-700 bg-gold-50',
  high: 'text-amber-700 bg-amber-50', critical: 'text-wine bg-rose-50',
};

const UNIT_HIERARCHY = ['organization', 'sector', 'agency', 'general_department', 'department', 'division', 'unit', 'committee', 'strategic_project', 'executive_office'];

function buildTree(units: any[]): any[] {
  const map: Record<string, any> = {};
  const roots: any[] = [];
  units.forEach(u => { map[u.id] = { ...u, children: [] }; });
  units.forEach(u => {
    if (u.parent_unit_id && map[u.parent_unit_id]) {
      map[u.parent_unit_id].children.push(map[u.id]);
    } else {
      roots.push(map[u.id]);
    }
  });
  return roots;
}

function UnitTreeNode({ node, depth = 0 }: { node: any; depth?: number }) {
  const typeLabel = UNIT_TYPE_LABELS[node.unit_type] || node.unit_type;
  const sensColor = SENSITIVITY_COLORS[node.sensitivity_level] || 'text-darkgray bg-gray-50';
  return (
    <div className={`${depth > 0 ? 'border-r-2 border-gold-200 mr-4 pr-4' : ''}`}>
      <div className="flex items-center gap-2 py-2 group hover:bg-gold-50 rounded-lg px-2 transition">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-primary-800 text-sm">{node.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${sensColor}`}>{typeLabel}</span>
            {node.is_critical && <span className="text-xs text-wine">⚠ حرجة</span>}
            {node.has_vacancy && <span className="text-xs text-amber-700">🔴 شاغر</span>}
            {node.needs_successor && <span className="text-xs text-steelblue">↩ يحتاج بديل</span>}
          </div>
          {node.description && <div className="text-xs text-darkgray truncate mt-0.5 max-w-sm">{node.description}</div>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <Link href={`/admin/organization/units/${node.id}/edit`}
            className="text-xs px-2 py-1 border border-gold-200 rounded-lg text-primary-700 hover:bg-gold-50">
            تعديل
          </Link>
          <Link href={`/organization/units/${node.id}`}
            className="text-xs px-2 py-1 border border-primary-200 rounded-lg text-primary-700 hover:bg-primary-50">
            عرض
          </Link>
        </div>
        {node.employee_count > 0 && (
          <div className="text-xs text-darkgray flex items-center gap-1 flex-shrink-0">
            <Users className="h-3 w-3" />{node.employee_count}
          </div>
        )}
      </div>
      {node.children?.length > 0 && (
        <div className="mt-1">
          {node.children.map((child: any) => (
            <UnitTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function AdminOrganizationPage() {
  const supabase = createClient();
  const { data: units } = await supabase
    .from('organization_units')
    .select('*')
    .eq('is_active', true)
    .order('unit_type')
    .order('name');

  const tree = buildTree(units || []);
  const criticalCount = (units || []).filter(u => u.is_critical).length;
  const vacancyCount = (units || []).filter(u => u.has_vacancy).length;
  const successorCount = (units || []).filter(u => u.needs_successor).length;

  // جلب درجات الملاءمة المحسوبة
  const { count: fitCount } = await supabase.from('position_fit_scores').select('id', { count: 'exact', head: true });

  return (
    <div dir="rtl">
      <PageHeader
        title="إدارة الهيكل التنظيمي"
        description="بناء وإدارة الهيكل التنظيمي لمنصة جدير. الهيكل يُستخدم لقياس الملاءمة التنظيمية فقط — لا يُعد أساساً للتصنيف القيادي."
        example="أضف قطاعات وإدارات وأقسام، ثم احسب درجات الملاءمة للمرشحين تلقائياً."
        icon={<Building2 className="h-5 w-5" />}
      />

      {/* إجراءات سريعة */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href="/admin/organization/units/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-bold transition">
          <Plus className="h-4 w-4" />إضافة وحدة تنظيمية
        </Link>
        <ComputeFitButton />
        <Link href="/organization/map"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gold-300 text-primary-700 hover:bg-gold-50 rounded-xl text-sm transition">
          <Briefcase className="h-4 w-4" />خريطة الملاءمة
        </Link>
      </div>

      {/* إحصاءات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-primary-700">{(units || []).length}</div>
          <div className="text-xs text-darkgray">إجمالي الوحدات</div>
        </div>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-wine">{criticalCount}</div>
          <div className="text-xs text-darkgray">وحدات حرجة</div>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-700">{vacancyCount}</div>
          <div className="text-xs text-darkgray">شواغر مفتوحة</div>
        </div>
        <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-gold-700">{fitCount || 0}</div>
          <div className="text-xs text-darkgray">درجات ملاءمة محسوبة</div>
        </div>
      </div>

      {/* الهيكل الشجري */}
      {tree.length > 0 ? (
        <Card title="الهيكل التنظيمي" subtitle="اضغط على وحدة لتعديلها أو عرض تفاصيلها">
          <div className="space-y-1">
            {tree.map(node => <UnitTreeNode key={node.id} node={node} />)}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gold-400 mx-auto mb-3" />
            <p className="text-primary-700 font-bold mb-2">لا توجد وحدات تنظيمية</p>
            <p className="text-sm text-darkgray mb-4">ابدأ ببناء الهيكل التنظيمي لمنظمتك.</p>
            <Link href="/admin/organization/units/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-xl text-sm">
              <Plus className="h-4 w-4" />إضافة أول وحدة
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

function ComputeFitButton() {
  return (
    <form action="/api/organization/fit" method="POST">
      <button type="submit"
        className="inline-flex items-center gap-2 px-4 py-2 border border-sage/40 text-sage hover:bg-sage/10 rounded-xl text-sm transition">
        <CheckCircle className="h-4 w-4" />حساب الملاءمة الآن
      </button>
    </form>
  );
}
