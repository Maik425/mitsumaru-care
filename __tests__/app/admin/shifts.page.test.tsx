import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShiftsPage from '@/src/app/admin/shifts/page';

// tRPCをモック
jest.mock('../../../src/lib/trpc', () => ({
  trpc: {
    shifts: {
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

import { trpc } from '../../../src/app/providers';

describe('ShiftsPage', () => {
  it('シフト管理のタイトルが表示される', () => {
    render(<ShiftsPage />);
    expect(screen.getByText('シフト管理')).toBeInTheDocument();
  });

  it('フォーム入力と作成ミューテーションが呼ばれる', async () => {
    const mutateAsync = jest.fn();
    (trpc.shifts.create.useMutation as jest.Mock).mockReturnValue({
      mutateAsync,
      isLoading: false,
      error: null,
    });

    (trpc.shifts.list.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<ShiftsPage />);

    // 入力
    fireEvent.change(screen.getByLabelText('日付'), {
      target: { value: '2025-01-27' },
    });
    fireEvent.change(screen.getByLabelText('シフト形態ID'), {
      target: { value: 'st1' },
    });

    // 担当者を追加
    fireEvent.click(screen.getByRole('button', { name: '担当者を追加' }));

    // 担当者の入力
    const userIdInputs = screen.getAllByPlaceholderText('ユーザーID');
    const positionIdInputs = screen.getAllByPlaceholderText('ポジションID');

    fireEvent.change(userIdInputs[0], { target: { value: 'u1' } });
    fireEvent.change(positionIdInputs[0], { target: { value: 'p1' } });

    // 送信
    fireEvent.click(screen.getByRole('button', { name: 'シフトを作成' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        tenantId: 't1',
        date: '2025-01-27',
        shiftTypeId: 'st1',
        assignedUsers: [{ userId: 'u1', positionId: 'p1' }],
      });
    });
  });

  it('シフト一覧が表示される', () => {
    const mockData = [
      {
        id: 's1',
        date: '2025-01-27',
        shiftType: { name: '日勤' },
        shiftAssignments: [{ id: 'sa1' }, { id: 'sa2' }],
      },
    ];

    (trpc.shifts.list.useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<ShiftsPage />);

    expect(screen.getByText('2025-01-27')).toBeInTheDocument();
    expect(screen.getByText('シフト形態: 日勤')).toBeInTheDocument();
    expect(screen.getByText('担当者数: 2名')).toBeInTheDocument();
  });

  it('読み込み中の状態が表示される', () => {
    (trpc.shifts.list.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      refetch: jest.fn(),
    });

    render(<ShiftsPage />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});
