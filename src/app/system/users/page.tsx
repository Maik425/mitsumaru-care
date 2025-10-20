import { AuthGuard } from '@/components/auth/auth-guard';
import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { UserManagement } from '@/components/user-management';

export default function SystemUsersPage() {
  return (
    <AuthGuard requiredRole='system_admin'>
      <RoleBasedLayout
        title='ユーザー管理'
        description='システム内のユーザーを管理します'
      >
        <div className='container mx-auto p-6'>
          <UserManagement />
        </div>
      </RoleBasedLayout>
    </AuthGuard>
  );
}
