import { AuthGuard } from '@/components/auth/auth-guard';
import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { SystemSettingsManagement } from '@/components/system-settings-management';

export default function SystemSettingsPage() {
  return (
    <AuthGuard requiredRole='system_admin'>
      <RoleBasedLayout
        title='システム設定管理'
        description='システム全体の設定、通知設定、セキュリティ設定を管理します'
      >
        <div className='container mx-auto py-6'>
          <SystemSettingsManagement />
        </div>
      </RoleBasedLayout>
    </AuthGuard>
  );
}
