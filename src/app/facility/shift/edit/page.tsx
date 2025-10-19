import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { ShiftEditForm } from '@/components/shift-edit-form';

export default function ShiftEditPage() {
  return (
    <RoleBasedLayout
      title='シフト簡単作成'
      description='シフトの簡単作成を行います'
    >
      <ShiftEditForm />
    </RoleBasedLayout>
  );
}
