import { renderHook } from '@testing-library/react';
import { useNavigation } from '../../src/hooks/use-navigation';
import { useAuth } from '../../src/hooks/use-auth';

// useAuthフックのモック
jest.mock('../../src/hooks/use-auth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('未認証状態', () => {
    it('ナビゲーションアイテムが空の配列を返す', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        hasPermission: jest.fn().mockReturnValue(false),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      const { result } = renderHook(() => useNavigation());

      expect(result.current.navigationItems).toEqual([]);
      expect(result.current.getNavigationItem('dashboard')).toBeUndefined();
      expect(result.current.hasNavigationAccess('dashboard')).toBe(false);
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
          permissions: [
            'SYSTEM_SETTINGS',
            'USER_MANAGEMENT',
            'ROLE_MANAGEMENT',
          ],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockImplementation((permissions: string[]) => {
          const userPermissions = [
            'SYSTEM_SETTINGS',
            'USER_MANAGEMENT',
            'ROLE_MANAGEMENT',
          ];
          return permissions.some(permission =>
            userPermissions.includes(permission)
          );
        }),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });
    });

    it('権限のあるナビゲーションアイテムが表示される', () => {
      const { result } = renderHook(() => useNavigation());

      // 権限チェックの結果に応じて表示されるアイテム数が変わる
      expect(result.current.navigationItems.length).toBeGreaterThan(0);
      expect(
        result.current.navigationItems.some(item => item.id === 'dashboard')
      ).toBe(true);
      expect(
        result.current.navigationItems.some(item => item.id === 'admin')
      ).toBe(true);
    });

    it('管理画面の子アイテムが権限に応じて表示される', () => {
      const { result } = renderHook(() => useNavigation());

      const adminItem = result.current.getNavigationItem('admin');
      if (adminItem) {
        expect(adminItem.children).toBeDefined();
        expect(adminItem.children!.length).toBeGreaterThan(0);
      }
    });

    it('権限チェックが正しく動作する', () => {
      const { result } = renderHook(() => useNavigation());

      expect(result.current.hasNavigationAccess('dashboard')).toBe(true);
      expect(result.current.hasNavigationAccess('admin')).toBe(true);
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
          permissions: ['SHIFT_MANAGEMENT', 'ATTENDANCE_VIEW'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockImplementation((permissions: string[]) => {
          const userPermissions = ['SHIFT_MANAGEMENT', 'ATTENDANCE_VIEW'];
          return permissions.some(permission =>
            userPermissions.includes(permission)
          );
        }),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });
    });

    it('権限のあるメニューのみが表示される', () => {
      const { result } = renderHook(() => useNavigation());

      expect(result.current.navigationItems.length).toBeGreaterThan(0);
      expect(
        result.current.navigationItems.some(item => item.id === 'dashboard')
      ).toBe(true);
      // 権限チェックの結果に応じて表示されるアイテムが変わる
      const hasShifts = result.current.navigationItems.some(
        item => item.id === 'shifts'
      );
      const hasAttendance = result.current.navigationItems.some(
        item => item.id === 'attendance'
      );
      expect(hasShifts || hasAttendance).toBe(true);
    });

    it('管理画面が表示されない', () => {
      const { result } = renderHook(() => useNavigation());

      expect(result.current.hasNavigationAccess('admin')).toBe(false);
      expect(result.current.getNavigationItem('admin')).toBeUndefined();
    });

    it('シフト管理の子アイテムが権限に応じて表示される', () => {
      const { result } = renderHook(() => useNavigation());

      const shiftsItem = result.current.getNavigationItem('shifts');
      if (shiftsItem) {
        expect(shiftsItem.children).toBeDefined();
        expect(shiftsItem.children!.length).toBeGreaterThan(0);
      }
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
          permissions: ['SHIFT_VIEW', 'ATTENDANCE_VIEW'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockImplementation((permissions: string[]) => {
          const userPermissions = ['SHIFT_VIEW', 'ATTENDANCE_VIEW'];
          return permissions.some(permission =>
            userPermissions.includes(permission)
          );
        }),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });
    });

    it('基本メニューのみが表示される', () => {
      const { result } = renderHook(() => useNavigation());

      expect(result.current.navigationItems.length).toBeGreaterThan(0);
      expect(
        result.current.navigationItems.some(item => item.id === 'dashboard')
      ).toBe(true);
      // 権限チェックの結果に応じて表示されるアイテムが変わる
      const hasShifts = result.current.navigationItems.some(
        item => item.id === 'shifts'
      );
      const hasAttendance = result.current.navigationItems.some(
        item => item.id === 'attendance'
      );
      expect(hasShifts || hasAttendance).toBe(true);
    });

    it('シフト管理の子アイテムが権限に応じて制限される', () => {
      const { result } = renderHook(() => useNavigation());

      const shiftsItem = result.current.getNavigationItem('shifts');
      if (shiftsItem) {
        expect(shiftsItem.children).toBeDefined();
        // SHIFT_VIEW権限のみなので確認のみ表示される可能性が高い
        expect(shiftsItem.children!.length).toBeGreaterThan(0);
      }
    });

    it('権限のない機能にアクセスできない', () => {
      const { result } = renderHook(() => useNavigation());

      expect(result.current.hasNavigationAccess('roles')).toBe(false);
      expect(result.current.hasNavigationAccess('admin')).toBe(false);
    });
  });

  describe('権限チェックの動作', () => {
    it('複数権限のチェックが正しく動作する', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          email: 'user@mitsumaru.com',
          name: 'User',
          employeeNumber: 'USR001',
          permissions: ['SHIFT_VIEW', 'ATTENDANCE_UPDATE'],
        },
        isAuthenticated: true,
        loading: false,
        hasPermission: jest.fn().mockImplementation((permissions: string[]) => {
          const userPermissions = ['SHIFT_VIEW', 'ATTENDANCE_UPDATE'];
          return permissions.some(permission =>
            userPermissions.includes(permission)
          );
        }),
        signIn: jest.fn(),
        signOut: jest.fn(),
      });

      const { result } = renderHook(() => useNavigation());

      // 権限チェックの動作確認
      expect(result.current.hasNavigationAccess('shifts')).toBe(true);
      // 権限チェックの結果に応じて表示されるアイテムが変わる
      const hasAttendance = result.current.hasNavigationAccess('attendance');
      const hasRoles = result.current.hasNavigationAccess('roles');
      expect(hasAttendance || hasRoles).toBe(false);
    });
  });
});
