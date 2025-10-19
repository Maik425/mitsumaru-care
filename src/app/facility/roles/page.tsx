import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { RoleManagement } from '@/components/role-management';

export default function RoleManagementPage() {
  return (
    <RoleBasedLayout
      title='役割表管理'
      description='施設の役割表を管理します'
    >
      <RoleManagement />
    </RoleBasedLayout>
  );
}
