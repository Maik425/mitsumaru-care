'use client';
import React, { useState } from 'react';

export type AttendanceFormValues = {
  shiftId: string;
  date: string;
  time: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  notes?: string;
};

export function AttendanceForm({
  onSubmit,
  initial,
}: {
  onSubmit: (v: AttendanceFormValues) => void | Promise<void>;
  initial?: Partial<AttendanceFormValues>;
}) {
  const [form, setForm] = useState<AttendanceFormValues>({
    shiftId: initial?.shiftId ?? '',
    date: initial?.date ?? '',
    time: initial?.time ?? '',
    type: initial?.type ?? 'CHECK_IN',
    notes: initial?.notes ?? '',
  });

  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
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
        <label className="block text-sm" htmlFor="time">
          時刻
        </label>
        <input
          id="time"
          type="time"
          value={form.time}
          onChange={e => setForm({ ...form, time: e.target.value })}
          className="border px-2 py-1 rounded w-32"
          required
        />
      </div>

      <div>
        <label className="block text-sm" htmlFor="type">
          アクション
        </label>
        <select
          id="type"
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value as any })}
          className="border px-2 py-1 rounded w-48"
        >
          <option value="CHECK_IN">出勤</option>
          <option value="CHECK_OUT">退勤</option>
        </select>
      </div>

      <div>
        <label className="block text-sm" htmlFor="notes">
          備考
        </label>
        <input
          id="notes"
          value={form.notes || ''}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          className="border px-2 py-1 rounded w-64"
          placeholder="備考を入力"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {form.type === 'CHECK_IN' ? '出勤' : '退勤'}
      </button>
    </form>
  );
}
