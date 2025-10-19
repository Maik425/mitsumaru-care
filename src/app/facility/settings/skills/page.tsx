import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { SkillsManagement } from '@/components/skills-management';

export default function SkillsPage() {
  return (
    <RoleBasedLayout
      title='技能登録'
      description='職員の技能を管理します'
    >
      <SkillsManagement />
    </RoleBasedLayout>
  );
}
