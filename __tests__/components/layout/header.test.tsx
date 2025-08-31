import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../../../src/components/layout/header';
import { useAuth } from '../../../src/hooks/use-auth';

// useAuthフックのモック
jest.mock('../../../src/hooks/use-auth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Header', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
  });

  describe('未認証状態', () => {
    it('ログイン前のヘッダーが正しく表示される', () => {
      render(<Header />);

      expect(screen.getByText('みつまるケア')).toBeInTheDocument();
      expect(screen.getByText('職員専用ポータル')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'ログイン' })
      ).toBeInTheDocument();
    });

    it('ナビゲーションメニューが表示されない', () => {
      render(<Header />);

      expect(screen.queryByText('ダッシュボード')).not.toBeInTheDocument();
      expect(screen.queryByText('シフト管理')).not.toBeInTheDocument();
      expect(screen.queryByText('勤怠管理')).not.toBeInTheDocument();
    });
  });

  describe('システム管理者として認証済み', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'admin-1',
          email: 'admin@mitsumaru.com',
          name: 'Admin User',
          employeeNumber: 'ADM001',
          permissions: ['SYSTEM_SETTINGS'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(true),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });
    });

    it('システム管理者のヘッダーが正しく表示される', () => {
      render(<Header />);

      expect(screen.getByText('みつまるケア')).toBeInTheDocument();
      expect(screen.getByText('admin@mitsumaru.com')).toBeInTheDocument();
      expect(screen.getByText('システム管理者')).toBeInTheDocument();
    });

    it('システム管理者用のナビゲーションメニューが表示される', () => {
      render(<Header />);

      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
      expect(screen.getByText('シフト管理')).toBeInTheDocument();
      expect(screen.getByText('勤怠管理')).toBeInTheDocument();
      expect(screen.getByText('管理画面')).toBeInTheDocument();
    });

    it('ユーザーアバターが表示される', () => {
      render(<Header />);

      expect(screen.getByText('AD')).toBeInTheDocument(); // アバターフォールバック
    });
  });

  describe('施設管理者として認証済み', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'facility-admin-1',
          email: 'facility-admin@mitsumaru.com',
          name: 'Facility Admin User',
          employeeNumber: 'FAC001',
          permissions: ['SHIFT_MANAGEMENT'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(true),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });
    });

    it('施設管理者のヘッダーが正しく表示される', () => {
      render(<Header />);

      expect(
        screen.getByText('facility-admin@mitsumaru.com')
      ).toBeInTheDocument();
      expect(screen.getByText('施設管理者')).toBeInTheDocument();
    });

    it('施設管理者用のナビゲーションメニューが表示される（管理画面なし）', () => {
      render(<Header />);

      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
      expect(screen.getByText('シフト管理')).toBeInTheDocument();
      expect(screen.getByText('勤怠管理')).toBeInTheDocument();
      expect(screen.queryByText('管理画面')).not.toBeInTheDocument();
    });
  });

  describe('一般職員として認証済み', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'staff-1',
          email: 'staff@mitsumaru.com',
          name: 'Staff User',
          employeeNumber: 'STF001',
          permissions: ['SHIFT_VIEW'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(true),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });
    });

    it('一般職員のヘッダーが正しく表示される', () => {
      render(<Header />);

      expect(screen.getByText('staff@mitsumaru.com')).toBeInTheDocument();
      expect(screen.getByText('一般職員')).toBeInTheDocument();
    });

    it('一般職員用のナビゲーションメニューが表示される（基本メニューのみ）', () => {
      render(<Header />);

      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
      expect(screen.getByText('シフト管理')).toBeInTheDocument();
      expect(screen.getByText('勤怠管理')).toBeInTheDocument();
      expect(screen.queryByText('管理画面')).not.toBeInTheDocument();
    });
  });

  describe('ユーザーメニュー', () => {
    const mockSignOut = jest.fn();

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          employeeNumber: 'USR001',
          permissions: ['SHIFT_VIEW'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(true),
        signIn: jest.fn(),
        signOut: mockSignOut,
      });
    });

    it('ユーザーアバターが表示される', () => {
      render(<Header />);

      expect(screen.getByText('US')).toBeInTheDocument(); // アバターフォールバック
    });

    it('ユーザー情報が正しく表示される', () => {
      render(<Header />);

      expect(screen.getByText('user@example.com')).toBeInTheDocument();
      expect(screen.getByText('一般職員')).toBeInTheDocument();
    });
  });
});
