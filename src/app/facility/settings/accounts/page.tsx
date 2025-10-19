import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { AccountsManagement } from '@/components/accounts-management';

export default function AccountsPage() {
  return (
    <RoleBasedLayout
      title='ログインアカウント登録'
      description='職員のログインアカウントを管理します'
    >
      <AccountsManagement />
    </RoleBasedLayout>
  );
}
