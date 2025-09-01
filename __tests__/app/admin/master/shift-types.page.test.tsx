import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShiftTypesPage from '@/src/app/admin/master/shift-types/page';

// tRPCをモック
jest.mock('../../../../src/lib/trpc', () => ({
  trpc: {
    shiftTypes: {
      list: {
        useQuery: jest.fn(() => ({
          data: [],
          isLoading: false,
          refetch: jest.fn(),
        })),
      },
      create: {
        useMutation: jest.fn(() => ({
          mutateAsync: jest.fn(),
          isLoading: false,
          error: null,
        })),
      },
    },
  },
}));

import { trpc } from '../../../../src/lib/trpc';

describe('ShiftTypesPage', () => {
  it('シフト形態管理のタイトルが表示される', () => {
    render(<ShiftTypesPage />);
    expect(screen.getByText('シフト形態管理')).toBeInTheDocument();
  });

  it('フォーム入力と作成ミューテーションが呼ばれる', async () => {
    const mutateAsync = jest.fn();
    (trpc.shiftTypes.create.useMutation as jest.Mock).mockReturnValue({
      mutateAsync,
      isLoading: false,
      error: null,
    });

    (trpc.shiftTypes.list.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<ShiftTypesPage />);

    // 入力
    fireEvent.change(screen.getByLabelText('名称'), {
      target: { value: '日勤' },
    });
    fireEvent.change(screen.getByLabelText('開始時刻 (HH:MM)'), {
      target: { value: '09:00' },
    });
    fireEvent.change(screen.getByLabelText('終了時刻 (HH:MM)'), {
      target: { value: '18:00' },
    });
    fireEvent.change(screen.getByLabelText('休憩(分)'), {
      target: { value: '60' },
    });

    // 送信
    fireEvent.click(screen.getByRole('button', { name: 'シフト形態を追加' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        tenantId: 't1',
        name: '日勤',
        startTime: '09:00',
        endTime: '18:00',
        breakTime: 60,
        color: '#2563eb',
      });
    });
  });

  it('シフト形態一覧が表示される', () => {
    const mockData = [
      {
        id: 'st1',
        name: '日勤',
        startTime: '09:00',
        endTime: '18:00',
        breakTime: 60,
        color: '#2563eb',
      },
    ];

    (trpc.shiftTypes.list.useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<ShiftTypesPage />);

    expect(screen.getByText('日勤 09:00-18:00 休憩60分')).toBeInTheDocument();
  });

  it('読み込み中の状態が表示される', () => {
    (trpc.shiftTypes.list.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      refetch: jest.fn(),
    });

    render(<ShiftTypesPage />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});
