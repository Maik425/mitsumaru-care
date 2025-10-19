import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { ShiftCreateForm } from '@/components/shift-create-form';

export default function ShiftCreatePage() {
  return (
    <RoleBasedLayout
      title='シフト詳細設定'
      description='シフトの詳細設定を行います'
    >
      <ShiftCreateForm />
    </RoleBasedLayout>
  );
}
