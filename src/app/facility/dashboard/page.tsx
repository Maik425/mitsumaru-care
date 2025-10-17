import { AuthGuard } from '@/components/auth/auth-guard';
import { FacilityDashboard } from '@/components/facility-dashboard';

export default function FacilityDashboardPage() {
  return (
    <AuthGuard requiredRole='facility_admin'>
      <FacilityDashboard />
    </AuthGuard>
  );
}
