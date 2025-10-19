import { AuthGuard } from '@/components/auth/auth-guard';
import { FacilityManagement } from '@/components/facility-management';
import { RoleBasedLayout } from '@/components/layouts/role-based-layout';

export default function SystemFacilitiesPage() {
  return (
    <AuthGuard requiredRole='system_admin'>
      <RoleBasedLayout
        title='施設管理'
        description='システム内の施設を管理します'
      >
        <div className='container mx-auto py-6'>
          <FacilityManagement />
        </div>
      </RoleBasedLayout>
    </AuthGuard>
  );
}
