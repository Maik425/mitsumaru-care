import { useMemo } from 'react';
import { useAuth } from './use-auth';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  requiredPermissions: string[];
  children?: NavigationItem[];
}

export function useNavigation() {
  const { user, hasPermission } = useAuth();

  const navigationItems = useMemo((): NavigationItem[] => {
    if (!user) {
      return [];
    }

    const items: NavigationItem[] = [
      {
        id: 'dashboard',
        label: 'ダッシュボード',
        href: '/dashboard',
        requiredPermissions: [],
      },
      {
        id: 'shifts',
        label: 'シフト管理',
        href: '/admin/shifts',
        requiredPermissions: ['SHIFT_MANAGEMENT'],
        children: [
          {
            id: 'shift-view',
            label: 'シフト確認',
            href: '/admin/shifts',
            requiredPermissions: ['SHIFT_VIEW'],
          },
          {
            id: 'shift-create',
            label: 'シフト作成',
            href: '/admin/shifts',
            requiredPermissions: ['SHIFT_MANAGEMENT'],
          },
        ],
      },
      {
        id: 'attendance',
        label: '勤怠管理',
        href: '/staff/attendance',
        requiredPermissions: ['ATTENDANCE_VIEW'],
        children: [
          {
            id: 'attendance-view',
            label: '勤怠確認',
            href: '/staff/attendance',
            requiredPermissions: ['ATTENDANCE_VIEW'],
          },
          {
            id: 'attendance-update',
            label: '勤怠入力',
            href: '/staff/attendance',
            requiredPermissions: ['ATTENDANCE_UPDATE'],
          },
        ],
      },
      {
        id: 'roles',
        label: '役割表管理',
        href: '/admin/role-assignments',
        requiredPermissions: ['ROLE_MANAGEMENT'],
        children: [
          {
            id: 'role-view',
            label: '役割確認',
            href: '/admin/role-assignments',
            requiredPermissions: ['ROLE_VIEW'],
          },
          {
            id: 'role-create',
            label: '役割作成',
            href: '/admin/role-assignments',
            requiredPermissions: ['ROLE_MANAGEMENT'],
          },
        ],
      },
      {
        id: 'admin',
        label: '管理画面',
        href: '/admin/dashboard',
        requiredPermissions: ['SYSTEM_SETTINGS'],
        children: [
          {
            id: 'shift-types',
            label: 'シフト形態管理',
            href: '/admin/master/shift-types',
            requiredPermissions: ['SYSTEM_SETTINGS'],
          },
          {
            id: 'user-management',
            label: 'ユーザー管理',
            href: '/admin/users',
            requiredPermissions: ['USER_MANAGEMENT'],
          },
          {
            id: 'role-management',
            label: 'ロール管理',
            href: '/admin/roles',
            requiredPermissions: ['ROLE_MANAGEMENT'],
          },
          {
            id: 'system-settings',
            label: 'システム設定',
            href: '/admin/settings',
            requiredPermissions: ['SYSTEM_SETTINGS'],
          },
        ],
      },
    ];

    return items;
  }, [user]);

  const filteredNavigationItems = useMemo(() => {
    if (!user) return [];

    return navigationItems.filter(item => {
      // メインアイテムの権限チェック
      if (item.requiredPermissions.length > 0) {
        const hasMainPermission = item.requiredPermissions.some(permission =>
          hasPermission([permission])
        );
        if (!hasMainPermission) return false;
      }

      // 子アイテムの権限チェック
      if (item.children) {
        item.children = item.children.filter(
          child =>
            child.requiredPermissions.length === 0 ||
            child.requiredPermissions.some(permission =>
              hasPermission([permission])
            )
        );

        // 子アイテムが1つも表示されない場合は親も非表示
        if (item.children.length === 0) return false;
      }

      return true;
    });
  }, [navigationItems, user, hasPermission]);

  const getNavigationItem = (id: string): NavigationItem | undefined => {
    return filteredNavigationItems.find(item => item.id === id);
  };

  const hasNavigationAccess = (id: string): boolean => {
    return getNavigationItem(id) !== undefined;
  };

  return {
    navigationItems: filteredNavigationItems,
    getNavigationItem,
    hasNavigationAccess,
  };
}
