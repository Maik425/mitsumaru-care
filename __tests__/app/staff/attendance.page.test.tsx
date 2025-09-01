import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AttendancePage from '@/src/app/staff/attendance/page';

// tRPCをモック
jest.mock('../../../src/lib/trpc', () => ({
  trpc: {
    attendance: {
      get: {
        useQuery: jest.fn(() => ({
          data: [],
          isLoading: false,
          refetch: jest.fn(),
        })),
      },
      checkInOut: {
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

describe('AttendancePage', () => {
  it('勤怠管理のタイトルが表示される', () => {
    render(<AttendancePage />);
    expect(screen.getByText('勤怠管理')).toBeInTheDocument();
  });

  it('フォーム入力と出退勤打刻ミューテーションが呼ばれる', async () => {
    const mutateAsync = jest.fn();
    (trpc.attendance.checkInOut.useMutation as jest.Mock).mockReturnValue({
      mutateAsync,
      isLoading: false,
      error: null,
    });

    (trpc.attendance.get.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<AttendancePage />);

    // 入力
    fireEvent.change(screen.getByLabelText('シフトID'), {
      target: { value: 's1' },
    });
    fireEvent.change(screen.getByLabelText('日付'), {
      target: { value: '2025-01-27' },
    });
    fireEvent.change(screen.getByLabelText('時刻'), {
      target: { value: '09:00' },
    });

    // 送信
    fireEvent.click(screen.getByRole('button', { name: '出勤' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        tenantId: 't1',
        shiftId: 's1',
        date: '2025-01-27',
        time: '09:00',
        type: 'CHECK_IN',
        notes: '',
      });
    });
  });

  it('勤怠記録一覧が表示される', () => {
    const mockData = [
      {
        id: 'a1',
        date: '2025-01-27',
        actualStartTime: '09:00',
        actualEndTime: '18:00',
        status: 'CHECKED_IN',
      },
    ];

    (trpc.attendance.get.useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<AttendancePage />);

    expect(screen.getByText('2025-01-27')).toBeInTheDocument();
    expect(screen.getByText('出勤: 09:00')).toBeInTheDocument();
    expect(screen.getByText('退勤: 18:00')).toBeInTheDocument();
    expect(screen.getByText('ステータス: CHECKED_IN')).toBeInTheDocument();
  });

  it('読み込み中の状態が表示される', () => {
    (trpc.attendance.get.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      refetch: jest.fn(),
    });

    render(<AttendancePage />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('退勤ボタンが表示される', () => {
    (trpc.attendance.get.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });

    render(<AttendancePage />);

    // アクションを退勤に変更
    fireEvent.change(screen.getByLabelText('アクション'), {
      target: { value: 'CHECK_OUT' },
    });

    expect(screen.getByRole('button', { name: '退勤' })).toBeInTheDocument();
  });
});
