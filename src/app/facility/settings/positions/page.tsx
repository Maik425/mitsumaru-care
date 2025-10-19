import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { PositionsManagement } from '@/components/positions-management';

export default function PositionsPage() {
  return (
    <RoleBasedLayout
      title='役職登録'
      description='施設の役職を管理します'
    >
      <PositionsManagement />
    </RoleBasedLayout>
  );
}
