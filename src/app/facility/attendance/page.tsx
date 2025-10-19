import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { AttendanceManagement } from '@/components/attendance-management';

export default function AttendanceManagementPage() {
  return (
    <RoleBasedLayout
      title='勤怠確認'
      description='職員の勤怠状況を確認します'
    >
      <AttendanceManagement />
    </RoleBasedLayout>
  );
}
