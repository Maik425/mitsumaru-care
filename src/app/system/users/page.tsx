import { AuthGuard } from '@/components/auth/auth-guard';
import { UserManagement } from '@/components/user-management';

export default function SystemUsersPage() {
  return (
    <AuthGuard requiredRole='system_admin'>
      <div className='container mx-auto py-6'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>ユーザー管理</h1>
          <p className='text-gray-600 mt-2'>システム内のユーザーを管理します</p>
        </div>
        <UserManagement />
      </div>
    </AuthGuard>
  );
}
