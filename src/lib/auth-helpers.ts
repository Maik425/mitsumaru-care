// 認証・権限チェック関連のヘルパー関数
// 既存のlocalStorageモックベースの認証を集約管理

export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  permissions: string[];
}

/**
 * 現在のユーザー情報を取得（localStorageベース）
 */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  const email = localStorage.getItem('userEmail');
  const role = localStorage.getItem('userRole') as UserRole;
  const name = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');

  if (!email || !role || !userId) return null;

  // 権限の設定
  const permissions = getPermissionsForRole(role);

  return {
    id: userId,
    email,
    role,
    name: name || undefined,
    permissions,
  };
}

/**
 * 役割に基づく権限を取得
 */
function getPermissionsForRole(role: UserRole): string[] {
  switch (role) {
    case 'OWNER':
      return [
        'ADMIN',
        'MANAGE_USERS',
        'MANAGE_SHIFTS',
        'MANAGE_ATTENDANCE',
        'MANAGE_ROLES',
      ];
    case 'ADMIN':
      return ['ADMIN', 'MANAGE_SHIFTS', 'MANAGE_ATTENDANCE', 'MANAGE_ROLES'];
    case 'MEMBER':
      return ['VIEW_SHIFTS', 'MANAGE_OWN_ATTENDANCE', 'REQUEST_SHIFT_EXCHANGE'];
    default:
      return [];
  }
}

/**
 * ログイン状態をチェック
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * 管理者権限をチェック
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'ADMIN' || user?.role === 'OWNER';
}

/**
 * 一般職員権限をチェック
 */
export function isMember(): boolean {
  const user = getCurrentUser();
  return user?.role === 'MEMBER';
}

/**
 * 指定した役割を持っているかチェック
 */
export function hasRole(requiredRoles: UserRole[]): boolean {
  const user = getCurrentUser();
  return user ? requiredRoles.includes(user.role) : false;
}

/**
 * 指定した権限を持っているかチェック
 */
export function hasPermission(requiredPermissions: string[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  return requiredPermissions.some(permission =>
    user.permissions.includes(permission)
  );
}

/**
 * 認証チェック（リダイレクト付き）
 * @param router Next.js router instance
 * @param requiredRoles 必要な役割（省略時は認証のみチェック）
 * @returns 認証・権限チェックが通った場合はtrue
 */
export function requireAuth(
  router: { push: (path: string) => void },
  requiredRoles?: UserRole[]
): boolean {
  const user = getCurrentUser();

  // 未認証の場合はログイン画面へ
  if (!user) {
    router.push('/');
    return false;
  }

  // 権限チェック
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    router.push('/?error=insufficient_permissions');
    return false;
  }

  return true;
}

/**
 * 管理者権限が必要なページ用のチェック
 */
export function requireAdminAuth(router: {
  push: (path: string) => void;
}): boolean {
  return requireAuth(router, ['ADMIN', 'OWNER']);
}

/**
 * 一般職員権限が必要なページ用のチェック
 */
export function requireMemberAuth(router: {
  push: (path: string) => void;
}): boolean {
  return requireAuth(router, ['MEMBER']);
}

/**
 * ログアウト処理
 */
export function logout(router?: { push: (path: string) => void }) {
  if (typeof window === 'undefined') return;

  // localStorageから認証情報を削除
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  localStorage.removeItem('auth-token');
  localStorage.removeItem('lastActivity');
  localStorage.removeItem('loginAttempts');
  localStorage.removeItem('overriddenPasswords');

  // ログイン画面へリダイレクト
  if (router) {
    router.push('/');
  }
}

/**
 * セッションタイムアウトチェック
 */
export function checkSessionTimeout(): boolean {
  if (typeof window === 'undefined') return false;

  const lastActivity = localStorage.getItem('lastActivity');
  if (!lastActivity) return true;

  const timeout = 30 * 60 * 1000; // 30分
  const now = Date.now();
  const lastActivityTime = parseInt(lastActivity, 10);

  if (now - lastActivityTime > timeout) {
    logout();
    return true;
  }

  // 最終アクティビティを更新
  localStorage.setItem('lastActivity', now.toString());
  return false;
}

/**
 * ユーザーIDを取得
 */
export function getCurrentUserId(): string | null {
  const user = getCurrentUser();
  return user?.id || null;
}
