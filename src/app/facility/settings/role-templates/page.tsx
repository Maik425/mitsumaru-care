import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { RoleTemplatesManagement } from '@/components/role-templates-management';

export default function RoleTemplatesPage() {
  return (
    <RoleBasedLayout
      title='役割表登録'
      description='役割表テンプレートを管理します'
    >
      <RoleTemplatesManagement />
    </RoleBasedLayout>
  );
}
