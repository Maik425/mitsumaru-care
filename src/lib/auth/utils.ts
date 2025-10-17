import { ROLE_PERMISSIONS, type Permission } from './config';
import type { AuthUser, UserRole } from './types';

// ユーザーが特定の権限を持っているかチェック
export function hasPermission(user: AuthUser, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role];
  return userPermissions.includes(permission);
}

// ユーザーが特定のロール以上かチェック
export function hasRole(user: AuthUser, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    facility_admin: 2,
    system_admin: 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

// ユーザー情報の検証
export function validateAuthUser(user: any): user is AuthUser {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    ['system_admin', 'facility_admin', 'user'].includes(user.role)
  );
}

// セッションの有効性チェック
export function isSessionValid(session: any): boolean {
  if (!session) return false;

  const now = Date.now();
  const expiresAt = session.expires_at * 1000;

  return expiresAt > now;
}

// リフレッシュが必要かチェック
export function shouldRefreshSession(session: any): boolean {
  if (!session) return false;

  const now = Date.now();
  const expiresAt = session.expires_at * 1000;
  const refreshThreshold = 60 * 1000; // 1分前

  return expiresAt - now < refreshThreshold;
}
