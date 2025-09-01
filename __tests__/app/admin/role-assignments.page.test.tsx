import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoleAssignmentsPage from '@/src/app/admin/role-assignments/page';

// tRPCをモック
jest.mock('../../../src/lib/trpc', () => ({
  trpc: {
    roleAssignments: {
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

describe('RoleAssignmentsPage', () => {
  it('役割表作成のタイトルが表示される', () => {
    render(<RoleAssignmentsPage />);
    expect(screen.getByText('役割表作成')).toBeInTheDocument();
  });

  it('フォーム入力と作成ミューテーションが呼ばれる', async () => {
    const mutateAsync = jest.fn();
    (trpc.roleAssignments.create.useMutation as jest.Mock).mockReturnValue({
      mutateAsync,
      isLoading: false,
      error: null,
    });

    (trpc.roleAssignments.list.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<RoleAssignmentsPage />);

    // 入力
    fireEvent.change(screen.getByLabelText('シフトID'), {
      target: { value: 's1' },
    });
    fireEvent.change(screen.getByLabelText('日付'), {
      target: { value: '2025-01-27' },
    });

    // 担当者詳細を追加
    fireEvent.click(screen.getByRole('button', { name: '担当者を追加' }));

    // 担当者詳細の入力
    const userIdInputs = screen.getAllByPlaceholderText('ユーザーID');
    const roleNameInputs = screen.getAllByPlaceholderText('役割名');
    const startTimeInputs = screen.getAllByPlaceholderText('開始時刻');
    const endTimeInputs = screen.getAllByPlaceholderText('終了時刻');

    fireEvent.change(userIdInputs[0], { target: { value: 'u1' } });
    fireEvent.change(roleNameInputs[0], { target: { value: '看護師' } });
    fireEvent.change(startTimeInputs[0], { target: { value: '09:00' } });
    fireEvent.change(endTimeInputs[0], { target: { value: '18:00' } });

    // 送信
    fireEvent.click(screen.getByRole('button', { name: '役割表を作成' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        tenantId: 't1',
        shiftId: 's1',
        date: '2025-01-27',
        details: [
          {
            userId: 'u1',
            roleName: '看護師',
            startTime: '09:00',
            endTime: '18:00',
            notes: '',
          },
        ],
      });
    });
  });

  it('役割表一覧が表示される', () => {
    const mockData = [
      {
        id: 'ra1',
        date: '2025-01-27',
        shiftId: 's1',
        details: [{ id: 'd1' }, { id: 'd2' }],
      },
    ];

    (trpc.roleAssignments.list.useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<RoleAssignmentsPage />);

    expect(screen.getByText('2025-01-27')).toBeInTheDocument();
    expect(screen.getByText('シフトID: s1')).toBeInTheDocument();
    expect(screen.getByText('担当者数: 2名')).toBeInTheDocument();
  });

  it('読み込み中の状態が表示される', () => {
    (trpc.roleAssignments.list.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      refetch: jest.fn(),
    });

    render(<RoleAssignmentsPage />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });
});
