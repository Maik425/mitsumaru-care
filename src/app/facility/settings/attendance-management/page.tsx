import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { AttendanceManagementSettings } from '@/components/attendance-management-settings';

export default function AttendanceManagementPage() {
  return (
    <RoleBasedLayout
      title='勤怠管理登録'
      description='勤怠管理設定を管理します'
    >
      <AttendanceManagementSettings />
    </RoleBasedLayout>
  );
}
