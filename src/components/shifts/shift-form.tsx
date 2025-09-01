'use client';
import React, { useState } from 'react';

export type ShiftFormValues = {
  date: string;
  shiftTypeId: string;
  assignedUsers: Array<{ userId: string; positionId: string }>;
};

export function ShiftForm({
  onSubmit,
  initial,
  submitText = '作成',
}: {
  onSubmit: (v: ShiftFormValues) => void | Promise<void>;
  initial?: Partial<ShiftFormValues>;
  submitText?: string;
}) {
  const [form, setForm] = useState<ShiftFormValues>({
    date: initial?.date ?? '',
    shiftTypeId: initial?.shiftTypeId ?? '',
    assignedUsers: initial?.assignedUsers ?? [],
  });

  const addAssignedUser = () => {
    setForm({
      ...form,
      assignedUsers: [...form.assignedUsers, { userId: '', positionId: '' }],
    });
  };

  const removeAssignedUser = (index: number) => {
    setForm({
      ...form,
      assignedUsers: form.assignedUsers.filter((_, i) => i !== index),
    });
  };

  const updateAssignedUser = (
    index: number,
    field: 'userId' | 'positionId',
    value: string
  ) => {
    const newAssignedUsers = [...form.assignedUsers];
    newAssignedUsers[index] = { ...newAssignedUsers[index], [field]: value };
    setForm({ ...form, assignedUsers: newAssignedUsers });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div>
        <label className="block text-sm" htmlFor="date">
          日付
        </label>
        <input
          id="date"
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          className="border px-2 py-1 rounded w-48"
          required
        />
      </div>

      <div>
        <label className="block text-sm" htmlFor="shiftTypeId">
          シフト形態ID
        </label>
        <input
          id="shiftTypeId"
          value={form.shiftTypeId}
          onChange={e => setForm({ ...form, shiftTypeId: e.target.value })}
          className="border px-2 py-1 rounded w-64"
          placeholder="st1"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-2">担当者</label>
        <div className="space-y-2">
          {form.assignedUsers.map((user, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                value={user.userId}
                onChange={e =>
                  updateAssignedUser(index, 'userId', e.target.value)
                }
                className="border px-2 py-1 rounded w-32"
                placeholder="ユーザーID"
                required
              />
              <input
                value={user.positionId}
                onChange={e =>
                  updateAssignedUser(index, 'positionId', e.target.value)
                }
                className="border px-2 py-1 rounded w-32"
                placeholder="ポジションID"
                required
              />
              <button
                type="button"
                onClick={() => removeAssignedUser(index)}
                className="bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                削除
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAssignedUser}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            担当者を追加
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {submitText}
      </button>
    </form>
  );
}
