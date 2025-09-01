'use client';

import { useState } from 'react';
import { trpc } from '@/src/lib/trpc';
import { AttendanceForm } from '@/src/components/attendance/attendance-form';

export default function AttendancePage() {
  const [tenantId, setTenantId] = useState('t1');
  const [userId, setUserId] = useState('u1');

  const listQuery = trpc.attendance.get.useQuery({
    tenantId,
    userId,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  });
  const checkInOutMutation = trpc.attendance.checkInOut.useMutation({
    onSuccess: () => listQuery.refetch(),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">勤怠管理</h1>

      <div className="space-y-3">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm">テナントID</label>
            <input
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
              className="border px-2 py-1 rounded w-32"
              placeholder="t1"
            />
          </div>
          <div>
            <label className="block text-sm">ユーザーID</label>
            <input
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="border px-2 py-1 rounded w-32"
              placeholder="u1"
            />
          </div>
        </div>
        <AttendanceForm
          onSubmit={async v => {
            await checkInOutMutation.mutateAsync({ tenantId, ...v });
          }}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">勤怠記録</h2>
        {listQuery.isLoading ? (
          <p>読み込み中...</p>
        ) : (
          <ul className="space-y-1">
            {(listQuery.data ?? []).map((attendance: any) => (
              <li key={attendance.id} className="text-sm border p-2 rounded">
                <div className="font-medium">{attendance.date}</div>
                <div>出勤: {attendance.actualStartTime || '未打刻'}</div>
                <div>退勤: {attendance.actualEndTime || '未打刻'}</div>
                <div>ステータス: {attendance.status}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
