import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { JobRulesManagement } from '@/components/job-rules-management';

export default function JobRulesPage() {
  return (
    <RoleBasedLayout
      title='職種・配置ルール登録'
      description='職種と配置ルールを管理します'
    >
      <JobRulesManagement />
    </RoleBasedLayout>
  );
}
