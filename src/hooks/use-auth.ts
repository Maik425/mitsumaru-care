import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  permissions: string[];
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  hasPermission: (permissions: string[]) => boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const hasPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (!user || !user.permissions) return false;

      return requiredPermissions.every(permission =>
        user.permissions.includes(permission)
      );
    },
    [user]
  );

  const signIn = async (
    email: string,
    _password: string
  ): Promise<AuthResult> => {
    try {
      setLoading(true);

      // モック認証ロジック（実際の実装ではSupabase Authを使用）
      if (email === 'admin@mitsumaru.com') {
        const adminUser: User = {
          id: 'admin-1',
          email: 'admin@mitsumaru.com',
          permissions: [
            'USER_MANAGEMENT',
            'SYSTEM_SETTINGS',
            'SHIFT_MANAGEMENT',
          ],
        };
        setUser(adminUser);
        return { success: true };
      } else if (email === 'user@mitsumaru.com') {
        const regularUser: User = {
          id: 'user-1',
          email: 'user@mitsumaru.com',
          permissions: ['SHIFT_VIEW', 'ATTENDANCE_UPDATE'],
        };
        setUser(regularUser);
        return { success: true };
      } else {
        return { success: false, error: '認証に失敗しました' };
      }
    } catch (error) {
      return { success: false, error: '認証に失敗しました' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    // 初期化処理（実際の実装ではセッション確認など）
    setLoading(false);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    hasPermission,
    signIn,
    signOut,
  };
};
