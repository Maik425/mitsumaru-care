import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { AttendanceTypesManagement } from '@/components/attendance-types-management';

export default function AttendanceTypesPage() {
  return (
    <RoleBasedLayout
      title='シフト形態管理'
      description='勤怠タイプを管理します'
    >
      <AttendanceTypesManagement />
    </RoleBasedLayout>
  );
}
