'use client';

import { useState } from 'react';
import { trpc } from '@/src/lib/trpc';
import { ShiftTypeForm } from '@/src/components/master/shift-type-form';

export default function ShiftTypesPage() {
  const [tenantId, setTenantId] = useState('t1');

  const listQuery = trpc.shiftTypes.list.useQuery({ tenantId });
  const createMutation = trpc.shiftTypes.create.useMutation({
    onSuccess: () => listQuery.refetch(),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">シフト形態管理</h1>

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
        <ShiftTypeForm
          onSubmit={async v => {
            await createMutation.mutateAsync({ tenantId, ...v });
          }}
          submitText="シフト形態を追加"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">一覧</h2>
        {listQuery.isLoading ? (
          <p>読み込み中...</p>
        ) : (
          <ul className="space-y-1">
            {(listQuery.data ?? []).map((st: any) => (
              <li key={st.id} className="text-sm">
                <span
                  className="inline-block w-3 h-3 mr-2 align-middle"
                  style={{ backgroundColor: st.color }}
                />
                {st.name} {st.startTime}-{st.endTime} 休憩{st.breakTime}分
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
