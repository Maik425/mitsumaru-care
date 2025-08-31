import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  AuthGuard,
  AdminGuard,
  FacilityAdminGuard,
  StaffGuard,
  AuthenticatedGuard,
} from '../../src/components/auth/auth-guard';
import { useAuth } from '../../src/hooks/use-auth';
import { usePermission } from '../../src/hooks/use-permission';

// フックのモック
jest.mock('../../src/hooks/use-auth');
jest.mock('../../src/hooks/use-permission');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('AuthGuard', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
    mockUsePermission.mockReturnValue(false);
  });

  it('ローディング中はローディング表示', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('認証確認中...')).toBeInTheDocument();
  });

  it('未認証時はログインフォームを表示', () => {
    render(
      <AuthGuard>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('みつまるケア')).toBeInTheDocument();
    expect(
      screen.getByText('ログイン', { selector: '[data-slot="card-title"]' })
    ).toBeInTheDocument();
  });

  it('認証済みで権限がある場合はコンテンツを表示', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        permissions: ['TEST_PERMISSION'],
      },
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(true),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
    mockUsePermission.mockReturnValue(true);

    render(
      <AuthGuard requiredPermissions={['TEST_PERMISSION']}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
  });

  it('権限不足時は権限不足メッセージを表示', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        permissions: ['OTHER_PERMISSION'],
      },
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(true),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
    mockUsePermission.mockReturnValue(false);

    render(
      <AuthGuard requiredPermissions={['REQUIRED_PERMISSION']}>
        <div>保護されたコンテンツ</div>
      </AuthGuard>
    );

    expect(screen.getByText('権限不足')).toBeInTheDocument();
    expect(
      screen.getByText('このページにアクセスする権限がありません')
    ).toBeInTheDocument();
  });
});

describe('AdminGuard', () => {
  it('システム管理者権限がある場合はコンテンツを表示', () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    const mockUsePermission = usePermission as jest.MockedFunction<
      typeof usePermission
    >;

    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'admin@example.com',
        permissions: ['SYSTEM_SETTINGS'],
      },
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(true),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
    mockUsePermission.mockReturnValue(true);

    render(
      <AdminGuard>
        <div>管理者コンテンツ</div>
      </AdminGuard>
    );

    expect(screen.getByText('管理者コンテンツ')).toBeInTheDocument();
  });
});

describe('FacilityAdminGuard', () => {
  it('施設管理者権限がある場合はコンテンツを表示', () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    const mockUsePermission = usePermission as jest.MockedFunction<
      typeof usePermission
    >;

    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'facility@example.com',
        permissions: ['SHIFT_MANAGEMENT'],
      },
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(true),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
    mockUsePermission.mockReturnValue(true);

    render(
      <FacilityAdminGuard>
        <div>施設管理者コンテンツ</div>
      </FacilityAdminGuard>
    );

    expect(screen.getByText('施設管理者コンテンツ')).toBeInTheDocument();
  });
});

describe('StaffGuard', () => {
  it('一般職員権限がある場合はコンテンツを表示', () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    const mockUsePermission = usePermission as jest.MockedFunction<
      typeof usePermission
    >;

    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        email: 'staff@example.com',
        permissions: ['SHIFT_VIEW'],
      },
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(true),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
    mockUsePermission.mockReturnValue(true);

    render(
      <StaffGuard>
        <div>職員コンテンツ</div>
      </StaffGuard>
    );

    expect(screen.getByText('職員コンテンツ')).toBeInTheDocument();
  });
});

describe('AuthenticatedGuard', () => {
  it('認証済みの場合はコンテンツを表示（権限チェックなし）', () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    const mockUsePermission = usePermission as jest.MockedFunction<
      typeof usePermission
    >;

    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'user@example.com', permissions: [] },
      isAuthenticated: true,
      loading: false,
      hasPermission: jest.fn().mockReturnValue(false),
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
    mockUsePermission.mockReturnValue(true);

    render(
      <AuthenticatedGuard>
        <div>認証済みコンテンツ</div>
      </AuthenticatedGuard>
    );

    expect(screen.getByText('認証済みコンテンツ')).toBeInTheDocument();
  });
});
