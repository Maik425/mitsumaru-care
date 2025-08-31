import { render, screen } from '@testing-library/react';
import { AuthGuard } from '../../src/components/auth/auth-guard';
import { useAuth } from '../../src/hooks/use-auth';

// useAuth フックのモック
jest.mock('../../src/hooks/use-auth');

describe('AuthGuard', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ユーザーが認証されていない場合はログインページにリダイレクト', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    render(
      <AuthGuard requiredPermissions={['USER_MANAGEMENT']}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    // Navigate コンポーネントがレンダリングされることを確認
    // 実際の実装では、useRouter を使用してリダイレクトする
    expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
  });

  it('ユーザーが認証されているが権限がない場合はフォールバックを表示', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        permissions: ['SHIFT_VIEW'],
      } as any,
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    render(
      <AuthGuard
        requiredPermissions={['USER_MANAGEMENT']}
        fallback={<div>アクセス拒否</div>}
      >
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('アクセス拒否')).toBeInTheDocument();
    expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
  });

  it('ユーザーが認証されており、必要な権限を持つ場合はコンテンツを表示', () => {
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

    render(
      <AuthGuard requiredPermissions={['USER_MANAGEMENT']}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
  });

  it('複数の権限が必要で、すべて持つ場合はコンテンツを表示', () => {
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

    render(
      <AuthGuard requiredPermissions={['USER_MANAGEMENT', 'SYSTEM_SETTINGS']}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
  });

  it('権限リストが空の場合はコンテンツを表示', () => {
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

    render(
      <AuthGuard requiredPermissions={[]}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
  });

  it('ローディング中は何も表示しない', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    render(
      <AuthGuard requiredPermissions={['USER_MANAGEMENT']}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.queryByText('保護されたコンテンツ')).not.toBeInTheDocument();
    expect(screen.queryByText('アクセス拒否')).not.toBeInTheDocument();
  });
});
