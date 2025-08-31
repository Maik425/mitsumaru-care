import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  permissions: string[];
}

export interface AuthResult {
  success: boolean;
  user?: User;
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
        return { success: true, user: adminUser };
      } else if (email === 'facility-admin@mitsumaru.com') {
        const facilityAdminUser: User = {
          id: 'facility-admin-1',
          email: 'facility-admin@mitsumaru.com',
          permissions: [
            'SHIFT_MANAGEMENT',
            'SHIFT_VIEW',
            'ATTENDANCE_MANAGEMENT',
            'ATTENDANCE_UPDATE',
          ],
        };
        setUser(facilityAdminUser);
        return { success: true, user: facilityAdminUser };
      } else if (email === 'staff@mitsumaru.com') {
        const staffUser: User = {
          id: 'staff-1',
          email: 'staff@mitsumaru.com',
          permissions: ['SHIFT_VIEW', 'ATTENDANCE_UPDATE'],
        };
        setUser(staffUser);
        return { success: true, user: staffUser };
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
