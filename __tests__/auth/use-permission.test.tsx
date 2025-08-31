import { renderHook } from '@testing-library/react';
import { usePermission } from '../../src/hooks/use-permission';
import { useAuth } from '../../src/hooks/use-auth';

// useAuth フックのモック
jest.mock('../../src/hooks/use-auth');

describe('usePermission', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ユーザーが存在しない場合は権限なし', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    const { result } = renderHook(() => usePermission(['USER_MANAGEMENT']));

    expect(result.current).toBe(false);
  });

  it('ユーザーが存在し、必要な権限を持つ場合は権限あり', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        permissions: ['USER_MANAGEMENT', 'SYSTEM_SETTINGS'],
      } as any,
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(true),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    const { result } = renderHook(() => usePermission(['USER_MANAGEMENT']));

    expect(result.current).toBe(true);
  });

  it('ユーザーが存在するが、必要な権限を持たない場合は権限なし', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        permissions: ['SHIFT_VIEW', 'ATTENDANCE_UPDATE'],
      } as any,
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    const { result } = renderHook(() => usePermission(['USER_MANAGEMENT']));

    expect(result.current).toBe(false);
  });

  it('複数の権限が必要で、すべて持つ場合は権限あり', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        permissions: ['USER_MANAGEMENT', 'SYSTEM_SETTINGS', 'ROLE_MANAGEMENT'],
      } as any,
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(true),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    const { result } = renderHook(() =>
      usePermission(['USER_MANAGEMENT', 'SYSTEM_SETTINGS'])
    );

    expect(result.current).toBe(true);
  });

  it('複数の権限が必要で、一部持たない場合は権限なし', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        permissions: ['USER_MANAGEMENT', 'SYSTEM_SETTINGS'],
      } as any,
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    const { result } = renderHook(() =>
      usePermission(['USER_MANAGEMENT', 'ROLE_MANAGEMENT'])
    );

    expect(result.current).toBe(false);
  });

  it('権限リストが空の場合は権限あり', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        permissions: ['SHIFT_VIEW'],
      } as any,
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(true),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    const { result } = renderHook(() => usePermission([]));

    expect(result.current).toBe(true);
  });
});
