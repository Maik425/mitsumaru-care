'use client';

import { useAuth } from '@/hooks/use-auth';
import {
  filterMenuItems,
  getNavigationConfig,
  type NavigationConfig,
} from '@/lib/navigation/menu-config';

export function useNavigation() {
  const { user, loading, initialized } = useAuth();

  // ナビゲーション設定の取得
  const getConfig = (): NavigationConfig | null => {
    if (!user?.role) return null;
    return getNavigationConfig(user.role);
  };

  // 権限チェック
  const hasPermission = (requiredRole?: string[]): boolean => {
    if (!user?.role) return false;
    if (requiredRole && requiredRole.length > 0) {
      return requiredRole.includes(user.role);
    }
    return true;
  };

  // メニューアイテムのフィルタリング
  const getFilteredMenuItems = (items: any[], userRole: string) => {
    return filterMenuItems(items, userRole);
  };

  // 認証状態の確認
  const isAuthenticated = initialized && !loading && !!user;
  const isSystemAdmin = user?.role === 'system_admin';
  const isFacilityAdmin = user?.role === 'facility_admin';
  const isUser = user?.role === 'user';

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    isSystemAdmin,
    isFacilityAdmin,
    isUser,
    getConfig,
    hasPermission,
    getFilteredMenuItems,
  };
}
