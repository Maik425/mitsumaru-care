'use client';

import { useState } from 'react';
import { trpc } from '@/src/app/providers';
import { RoleAssignmentForm } from '@/src/components/role-assignments/role-assignment-form';

export default function RoleAssignmentsPage() {
  const [tenantId, setTenantId] = useState('t1');

  const listQuery = trpc.roleAssignments.list.useQuery({ tenantId });
  const createMutation = trpc.roleAssignments.create.useMutation({
    onSuccess: () => listQuery.refetch(),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">役割表作成</h1>

      <div className="space-y-3">
        <div>
          <label className="block text-sm">テナントID</label>
          <input
            value={tenantId}
            onChange={e => setTenantId(e.target.value)}
            className="border px-2 py-1 rounded w-64"
            placeholder="t1"
          />
        </div>
        <RoleAssignmentForm
          onSubmit={async v => {
            await createMutation.mutateAsync({ tenantId, ...v });
          }}
          submitText="役割表を作成"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">役割表一覧</h2>
        {listQuery.isLoading ? (
          <p>読み込み中...</p>
        ) : (
          <ul className="space-y-1">
            {(listQuery.data ?? []).map((roleAssignment: any) => (
              <li
                key={roleAssignment.id}
                className="text-sm border p-2 rounded"
              >
                <div className="font-medium">{roleAssignment.date}</div>
                <div>シフトID: {roleAssignment.shiftId}</div>
                <div>担当者数: {roleAssignment.details?.length || 0}名</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
