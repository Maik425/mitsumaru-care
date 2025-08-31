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
        href: '/shifts',
        requiredPermissions: ['SHIFT_VIEW'],
        children: [
          {
            id: 'shift-view',
            label: 'シフト確認',
            href: '/shifts/view',
            requiredPermissions: ['SHIFT_VIEW'],
          },
          {
            id: 'shift-create',
            label: 'シフト作成',
            href: '/shifts/create',
            requiredPermissions: ['SHIFT_MANAGEMENT'],
          },
          {
            id: 'shift-edit',
            label: 'シフト編集',
            href: '/shifts/edit',
            requiredPermissions: ['SHIFT_MANAGEMENT'],
          },
        ],
      },
      {
        id: 'attendance',
        label: '勤怠管理',
        href: '/attendance',
        requiredPermissions: ['ATTENDANCE_VIEW'],
        children: [
          {
            id: 'attendance-view',
            label: '勤怠確認',
            href: '/attendance/view',
            requiredPermissions: ['ATTENDANCE_VIEW'],
          },
          {
            id: 'attendance-update',
            label: '勤怠入力',
            href: '/attendance/update',
            requiredPermissions: ['ATTENDANCE_UPDATE'],
          },
          {
            id: 'attendance-manage',
            label: '勤怠承認',
            href: '/attendance/manage',
            requiredPermissions: ['ATTENDANCE_MANAGEMENT'],
          },
        ],
      },
      {
        id: 'roles',
        label: '役割表管理',
        href: '/roles',
        requiredPermissions: ['ROLE_MANAGEMENT'],
        children: [
          {
            id: 'role-view',
            label: '役割確認',
            href: '/roles/view',
            requiredPermissions: ['ROLE_VIEW'],
          },
          {
            id: 'role-create',
            label: '役割作成',
            href: '/roles/create',
            requiredPermissions: ['ROLE_MANAGEMENT'],
          },
        ],
      },
      {
        id: 'admin',
        label: '管理画面',
        href: '/admin',
        requiredPermissions: ['SYSTEM_SETTINGS'],
        children: [
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
