'use client';
import React, { useState } from 'react';

export type ShiftTypeFormValues = {
  name: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  color: string;
};

export function ShiftTypeForm({
  onSubmit,
  initial,
  submitText = '追加',
}: {
  onSubmit: (v: ShiftTypeFormValues) => void | Promise<void>;
  initial?: Partial<ShiftTypeFormValues>;
  submitText?: string;
}) {
  const [form, setForm] = useState<ShiftTypeFormValues>({
    name: initial?.name ?? '',
    startTime: initial?.startTime ?? '',
    endTime: initial?.endTime ?? '',
    breakTime: initial?.breakTime ?? 0,
    color: initial?.color ?? '#2563eb',
  });

  return (
    <form
      className="space-y-3"
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <div>
        <label className="block text-sm" htmlFor="name">
          名称
        </label>
        <input
          id="name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border px-2 py-1 rounded w-64"
          placeholder="日勤"
        />
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm" htmlFor="start">
            開始時刻 (HH:MM)
          </label>
          <input
            id="start"
            value={form.startTime}
            onChange={e => setForm({ ...form, startTime: e.target.value })}
            className="border px-2 py-1 rounded w-32"
            placeholder="09:00"
          />
        </div>
        <div>
          <label className="block text-sm" htmlFor="end">
            終了時刻 (HH:MM)
          </label>
          <input
            id="end"
            value={form.endTime}
            onChange={e => setForm({ ...form, endTime: e.target.value })}
            className="border px-2 py-1 rounded w-32"
            placeholder="18:00"
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm" htmlFor="break">
            休憩(分)
          </label>
          <input
            id="break"
            type="number"
            value={form.breakTime}
            onChange={e =>
              setForm({ ...form, breakTime: Number(e.target.value) })
            }
            className="border px-2 py-1 rounded w-24"
            placeholder="60"
          />
        </div>
        <div>
          <label className="block text-sm" htmlFor="color">
            色
          </label>
          <input
            id="color"
            type="color"
            value={form.color}
            onChange={e => setForm({ ...form, color: e.target.value })}
            className="h-9 w-16 border rounded"
          />
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
