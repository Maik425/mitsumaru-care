import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { UserManagement } from '@/components/user-management';

export default function SystemUsersPage() {
  return (
    <RoleBasedLayout
      title='ユーザー管理'
      description='システム内のユーザーを管理します'
    >
      <div className='container mx-auto py-6'>
        <UserManagement />
      </div>
    </RoleBasedLayout>
  );
}
