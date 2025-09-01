'use client';

import { useState } from 'react';
import { trpc } from '@/src/lib/trpc';
import { ShiftForm } from '@/src/components/shifts/shift-form';

export default function ShiftsPage() {
  const [tenantId, setTenantId] = useState('t1');

  const listQuery = trpc.shifts.list.useQuery({ tenantId });
  const createMutation = trpc.shifts.create.useMutation({
    onSuccess: () => listQuery.refetch(),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">シフト管理</h1>

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
        <ShiftForm
          onSubmit={async v => {
            await createMutation.mutateAsync({ tenantId, ...v });
          }}
          submitText="シフトを作成"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">シフト一覧</h2>
        {listQuery.isLoading ? (
          <p>読み込み中...</p>
        ) : (
          <ul className="space-y-1">
            {(listQuery.data ?? []).map((shift: any) => (
              <li key={shift.id} className="text-sm border p-2 rounded">
                <div className="font-medium">{shift.date}</div>
                <div>シフト形態: {shift.shiftType?.name}</div>
                <div>担当者数: {shift.shiftAssignments?.length || 0}名</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
