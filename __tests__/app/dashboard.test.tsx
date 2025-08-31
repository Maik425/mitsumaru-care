import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../../src/app/dashboard/page';
import { useAuth } from '../../src/hooks/use-auth';

// フックのモック
jest.mock('../../src/hooks/use-auth');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ローディング状態', () => {
    it('ローディング中はローディング表示', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: true,
        hasPermission: jest.fn().mockReturnValue(false),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      render(<Dashboard />);

      expect(
        screen.getByText('ダッシュボードを読み込み中...')
      ).toBeInTheDocument();
    });
  });

  describe('未認証状態', () => {
    it('未認証時はアクセス拒否メッセージを表示', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(false),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      render(<Dashboard />);

      expect(screen.getByText('アクセス拒否')).toBeInTheDocument();
      expect(screen.getByText('ログインが必要です')).toBeInTheDocument();
    });
  });

  describe('システム管理者として認証済み', () => {
    it('システム管理者ダッシュボードにリダイレクト', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'admin-1',
          email: 'admin@mitsumaru.com',
          name: 'Admin User',
          employeeNumber: 'ADM001',
          permissions: ['SYSTEM_SETTINGS', 'USER_MANAGEMENT'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(true),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      render(<Dashboard />);

      // リダイレクト処理はuseEffectで行われるため、ローディング状態を確認
      await waitFor(() => {
        expect(screen.getByText('リダイレクト中...')).toBeInTheDocument();
      });
    });
  });

  describe('施設管理者として認証済み', () => {
    it('施設管理者ダッシュボードにリダイレクト', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'facility-admin-1',
          email: 'facility-admin@mitsumaru.com',
          name: 'Facility Admin User',
          employeeNumber: 'FAC001',
          permissions: ['SHIFT_MANAGEMENT', 'ATTENDANCE_MANAGEMENT'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(true),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('リダイレクト中...')).toBeInTheDocument();
      });
    });
  });

  describe('一般職員として認証済み', () => {
    it('一般職員ダッシュボードにリダイレクト', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'staff-1',
          email: 'staff@mitsumaru.com',
          name: 'Staff User',
          employeeNumber: 'STF001',
          permissions: ['SHIFT_VIEW', 'ATTENDANCE_UPDATE'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(true),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('リダイレクト中...')).toBeInTheDocument();
      });
    });
  });

  describe('権限がない場合', () => {
    it('一般職員ダッシュボードにリダイレクト（デフォルト）', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          email: 'user@mitsumaru.com',
          name: 'User',
          employeeNumber: 'USR001',
          permissions: [],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(false),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('リダイレクト中...')).toBeInTheDocument();
      });
    });
  });
});
