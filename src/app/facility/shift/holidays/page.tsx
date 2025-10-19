import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { HolidayManagement } from '@/components/holiday-management';

export default function HolidayManagementPage() {
  return (
    <RoleBasedLayout
      title='休み管理'
      description='職員の休み申請を管理します'
    >
      <HolidayManagement />
    </RoleBasedLayout>
  );
}
