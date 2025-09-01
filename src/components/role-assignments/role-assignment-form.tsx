'use client';
import React, { useState } from 'react';

export type RoleAssignmentFormValues = {
  shiftId: string;
  date: string;
  details: Array<{
    userId: string;
    roleName: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }>;
};

export function RoleAssignmentForm({
  onSubmit,
  initial,
  submitText = '作成',
}: {
  onSubmit: (v: RoleAssignmentFormValues) => void | Promise<void>;
  initial?: Partial<RoleAssignmentFormValues>;
  submitText?: string;
}) {
  const [form, setForm] = useState<RoleAssignmentFormValues>({
    shiftId: initial?.shiftId ?? '',
    date: initial?.date ?? '',
    details: initial?.details ?? [],
  });

  const addDetail = () => {
    setForm({
      ...form,
      details: [
        ...form.details,
        { userId: '', roleName: '', startTime: '', endTime: '', notes: '' },
      ],
    });
  };

  const removeDetail = (index: number) => {
    setForm({
      ...form,
      details: form.details.filter((_, i) => i !== index),
    });
  };

  const updateDetail = (
    index: number,
    field: 'userId' | 'roleName' | 'startTime' | 'endTime' | 'notes',
    value: string
  ) => {
    const newDetails = [...form.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setForm({ ...form, details: newDetails });
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
        <label className="block text-sm" htmlFor="shiftId">
          シフトID
        </label>
        <input
          id="shiftId"
          value={form.shiftId}
          onChange={e => setForm({ ...form, shiftId: e.target.value })}
          className="border px-2 py-1 rounded w-64"
          placeholder="s1"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-2">担当者詳細</label>
        <div className="space-y-2">
          {form.details.map((detail, index) => (
            <div
              key={index}
              className="flex gap-2 items-center border p-2 rounded"
            >
              <input
                value={detail.userId}
                onChange={e => updateDetail(index, 'userId', e.target.value)}
                className="border px-2 py-1 rounded w-32"
                placeholder="ユーザーID"
                required
              />
              <input
                value={detail.roleName}
                onChange={e => updateDetail(index, 'roleName', e.target.value)}
                className="border px-2 py-1 rounded w-32"
                placeholder="役割名"
                required
              />
              <input
                value={detail.startTime}
                onChange={e => updateDetail(index, 'startTime', e.target.value)}
                className="border px-2 py-1 rounded w-24"
                placeholder="開始時刻"
                required
              />
              <input
                value={detail.endTime}
                onChange={e => updateDetail(index, 'endTime', e.target.value)}
                className="border px-2 py-1 rounded w-24"
                placeholder="終了時刻"
                required
              />
              <input
                value={detail.notes || ''}
                onChange={e => updateDetail(index, 'notes', e.target.value)}
                className="border px-2 py-1 rounded w-48"
                placeholder="備考"
              />
              <button
                type="button"
                onClick={() => removeDetail(index)}
                className="bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                削除
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDetail}
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
