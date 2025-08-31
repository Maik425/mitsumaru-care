import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/use-auth';
import { trpc } from '../../src/app/providers';

// tRPCのモック
jest.mock('../../src/app/providers', () => ({
  trpc: {
    auth: {
      login: {
        useMutation: jest.fn(),
      },
      logout: {
        useMutation: jest.fn(),
      },
      me: {
        useQuery: jest.fn(),
      },
    },
  },
}));

// Next.js routerのモック
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// localStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth (Integrated)', () => {
  let mockLoginMutation: any;
  let mockLogoutMutation: any;
  let mockMeQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    mockPush.mockClear();

    // モックの設定
    mockLoginMutation = {
      mutateAsync: jest.fn(),
      isLoading: false,
      error: null,
    };

    mockLogoutMutation = {
      mutateAsync: jest.fn(),
      isLoading: false,
      error: null,
    };

    mockMeQuery = {
      refetch: jest.fn(),
      data: null,
      error: null,
    };

    (trpc.auth.login.useMutation as jest.Mock).mockReturnValue(
      mockLoginMutation
    );
    (trpc.auth.logout.useMutation as jest.Mock).mockReturnValue(
      mockLogoutMutation
    );
    (trpc.auth.me.useQuery as jest.Mock).mockReturnValue(mockMeQuery);
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(true);
  });

  it('ログインが成功した場合、ユーザー情報が設定される', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      employeeNumber: 'EMP001',
      permissions: ['SHIFT_VIEW'],
    };

    const mockSession = {
      access_token: 'mock-token',
    };

    mockLoginMutation.mutateAsync.mockResolvedValue({
      user: mockUser,
      session: mockSession,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const loginResult = await result.current.signIn(
        'test@example.com',
        'password'
      );
      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toEqual(mockUser);
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'auth-token',
      'mock-token'
    );
  });

  it('システム管理者権限でログインした場合、管理者ダッシュボードにリダイレクトされる', async () => {
    const mockUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      employeeNumber: 'ADM001',
      permissions: ['SYSTEM_SETTINGS', 'USER_MANAGEMENT'],
    };

    mockLoginMutation.mutateAsync.mockResolvedValue({
      user: mockUser,
      session: { access_token: 'mock-token' },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.signIn('admin@example.com', 'password');
    });

    expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('施設管理者権限でログインした場合、施設管理者ダッシュボードにリダイレクトされる', async () => {
    const mockUser = {
      id: 'facility-admin-1',
      email: 'facility@example.com',
      name: 'Facility Admin',
      employeeNumber: 'FAC001',
      permissions: ['SHIFT_MANAGEMENT', 'ATTENDANCE_MANAGEMENT'],
    };

    mockLoginMutation.mutateAsync.mockResolvedValue({
      user: mockUser,
      session: { access_token: 'mock-token' },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.signIn('facility@example.com', 'password');
    });

    expect(mockPush).toHaveBeenCalledWith('/facility-admin/dashboard');
  });

  it('一般職員でログインした場合、スタッフダッシュボードにリダイレクトされる', async () => {
    const mockUser = {
      id: 'staff-1',
      email: 'staff@example.com',
      name: 'Staff User',
      employeeNumber: 'STF001',
      permissions: ['SHIFT_VIEW', 'ATTENDANCE_UPDATE'],
    };

    mockLoginMutation.mutateAsync.mockResolvedValue({
      user: mockUser,
      session: { access_token: 'mock-token' },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.signIn('staff@example.com', 'password');
    });

    expect(mockPush).toHaveBeenCalledWith('/staff/dashboard');
  });

  it('ログインが失敗した場合、エラーが返される', async () => {
    const mockError = new Error('認証に失敗しました');
    mockLoginMutation.mutateAsync.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      const loginResult = await result.current.signIn(
        'test@example.com',
        'password'
      );
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('認証に失敗しました');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('ログアウトが成功した場合、ユーザー情報がクリアされる', async () => {
    // 初期状態でユーザーがログイン済み
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      employeeNumber: 'EMP001',
      permissions: ['SHIFT_VIEW'],
    };

    mockLogoutMutation.mutateAsync.mockResolvedValue({ success: true });
    localStorageMock.getItem.mockReturnValue('mock-token');

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // ユーザーを設定
    act(() => {
      result.current.user = mockUser;
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-token');
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('権限チェックが正しく動作する', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      employeeNumber: 'EMP001',
      permissions: ['SHIFT_VIEW', 'ATTENDANCE_UPDATE'],
    };

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // ユーザーを設定
    act(() => {
      result.current.user = mockUser;
    });

    expect(result.current.hasPermission(['SHIFT_VIEW'])).toBe(true);
    expect(
      result.current.hasPermission(['SHIFT_VIEW', 'ATTENDANCE_UPDATE'])
    ).toBe(true);
    expect(result.current.hasPermission(['SYSTEM_SETTINGS'])).toBe(false);
    expect(
      result.current.hasPermission(['SHIFT_VIEW', 'SYSTEM_SETTINGS'])
    ).toBe(false);
  });

  it('初期化時にトークンが存在する場合、ユーザー情報を取得する', async () => {
    localStorageMock.getItem.mockReturnValue('existing-token');

    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      employeeNumber: 'EMP001',
      permissions: ['SHIFT_VIEW'],
    };

    mockMeQuery.refetch.mockResolvedValue({ data: mockUser });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockMeQuery.refetch).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('初期化時にトークンが無効な場合、トークンを削除する', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-token');
    mockMeQuery.refetch.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-token');
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
