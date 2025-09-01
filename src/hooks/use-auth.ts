import { useState, useEffect, useCallback } from 'react';
import { trpc } from '../lib/trpc';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  employeeNumber: string;
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
  const router = useRouter();

  // tRPCミューテーション
  const loginMutation = trpc.auth.login.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: false, // 手動で実行
  });

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
    password: string
  ): Promise<AuthResult> => {
    try {
      setLoading(true);

      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (result.user) {
        setUser(result.user);

        // トークンをローカルストレージに保存
        if (result.session?.access_token) {
          localStorage.setItem('auth-token', result.session.access_token);
        }

        // 権限に基づいてダッシュボードにリダイレクト
        if (result.user.permissions.includes('SYSTEM_SETTINGS')) {
          router.push('/admin/dashboard');
        } else if (result.user.permissions.includes('SHIFT_MANAGEMENT')) {
          router.push('/facility-admin/dashboard');
        } else {
          router.push('/staff/dashboard');
        }

        return { success: true, user: result.user };
      } else {
        return { success: false, error: '認証に失敗しました' };
      }
    } catch (error: any) {
      const errorMessage = error?.message || '認証に失敗しました';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth-token');
      router.push('/');
    }
  };

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      meQuery.refetch().then((result: any) => {
        if (result.data) {
          setUser(result.data);
        } else {
          // トークンが無効な場合は削除
          localStorage.removeItem('auth-token');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [meQuery]);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    hasPermission,
    signIn,
    signOut,
  };
};
