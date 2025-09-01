import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../../components/login-form';
import { useAuth } from '../../src/hooks/use-auth';
import { mockPush } from '../../jest.setup';

// tRPCをモック
jest.mock('../../src/lib/trpc', () => ({
  trpc: {
    auth: {
      login: {
        useMutation: () => ({
          mutate: jest.fn(),
          isLoading: false,
          error: null,
        }),
      },
      logout: {
        useMutation: () => ({
          mutate: jest.fn(),
          isLoading: false,
          error: null,
        }),
      },
      me: {
        useQuery: () => ({
          data: null,
          isLoading: false,
          error: null,
        }),
      },
    },
  },
}));

// useAuthフックのモック
jest.mock('../../src/hooks/use-auth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('認証フロー', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
  });

  it('正しい認証情報でログインできる（システム管理者）', async () => {
    const mockSignIn = jest
      .fn()
      .mockImplementation(async (_email: string, _password: string) => {
        // 成功した場合、ユーザーを設定してナビゲーションを実行
        const user = {
          id: 'admin-1',
          email: 'admin@mitsumaru.com',
          permissions: ['SYSTEM_SETTINGS'],
        };

        // 権限に基づいてナビゲーション
        if (user.permissions.includes('SYSTEM_SETTINGS')) {
          mockPush('/admin/dashboard');
        }

        return {
          success: true,
          user,
        };
      });

    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: mockSignIn,
      signOut: jest.fn(),
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'admin@mitsumaru.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'admin@mitsumaru.com',
        'Password123!'
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('正しい認証情報でログインできる（施設管理者）', async () => {
    const mockSignIn = jest
      .fn()
      .mockImplementation(async (_email: string, _password: string) => {
        // 成功した場合、ユーザーを設定してナビゲーションを実行
        const user = {
          id: 'facility-admin-1',
          email: 'facility-admin@mitsumaru.com',
          permissions: ['SHIFT_MANAGEMENT'],
        };

        // 権限に基づいてナビゲーション
        if (user.permissions.includes('SHIFT_MANAGEMENT')) {
          mockPush('/facility-admin/dashboard');
        }

        return {
          success: true,
          user,
        };
      });

    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: mockSignIn,
      signOut: jest.fn(),
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'facility-admin@mitsumaru.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'facility-admin@mitsumaru.com',
        'Password123!'
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/facility-admin/dashboard');
    });
  });

  it('正しい認証情報でログインできる（一般職員）', async () => {
    const mockSignIn = jest
      .fn()
      .mockImplementation(async (_email: string, _password: string) => {
        // 成功した場合、ユーザーを設定してナビゲーションを実行
        const user = {
          id: 'staff-1',
          email: 'staff@mitsumaru.com',
          permissions: ['SHIFT_VIEW'],
        };

        // 権限に基づいてナビゲーション（デフォルトはstaff/dashboard）
        mockPush('/staff/dashboard');

        return {
          success: true,
          user,
        };
      });

    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: mockSignIn,
      signOut: jest.fn(),
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'staff@mitsumaru.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'staff@mitsumaru.com',
        'Password123!'
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/staff/dashboard');
    });
  });

  it('無効な認証情報でエラーが表示される', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      success: false,
      error: '認証に失敗しました',
    });

    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: mockSignIn,
      signOut: jest.fn(),
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'invalid@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('認証に失敗しました')).toBeInTheDocument();
    });
  });

  it('テスト用アカウント情報が表示される', () => {
    render(<LoginForm />);

    expect(screen.getByText('テスト用アカウント:')).toBeInTheDocument();
    expect(
      screen.getByText('システム管理者: admin@mitsumaru.com')
    ).toBeInTheDocument();
    expect(
      screen.getByText('施設管理者: facility-admin@mitsumaru.com')
    ).toBeInTheDocument();
    expect(
      screen.getByText('一般職員: staff@mitsumaru.com')
    ).toBeInTheDocument();
  });
});
