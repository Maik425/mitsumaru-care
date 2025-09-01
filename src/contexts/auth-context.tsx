'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { trpc } from '../app/providers';
import { useRouter } from 'next/navigation';

// ユーザー型定義
export interface User {
  id: string;
  email: string;
  name: string;
  employeeNumber: string;
  permissions: string[];
}

// セッション型定義
export interface Session {
  access_token: string;
  refresh_token: string;
}

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permissions: string[]) => boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: { name: string; employeeNumber: string }
  ) => Promise<{ error: string | null }>;
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーのプロパティ
interface AuthProviderProps {
  children: ReactNode;
}

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // tRPCミューテーション
  const loginMutation = trpc.auth.login.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: false, // 手動で実行
  });

  // 権限チェック関数
  const hasPermission = (requiredPermissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );
  };

  // サインイン
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (result.success && result.user) {
        setUser(result.user);

        if (result.session) {
          setSession(result.session);
          // トークンをローカルストレージに保存
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

        return { error: null };
      } else {
        return { error: '認証に失敗しました' };
      }
    } catch (error: any) {
      const errorMessage = error?.message || '認証に失敗しました';
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // サインアウト
  const signOut = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem('auth-token');
      router.push('/');
    }
  };

  // サインアップ（現在はモック実装）
  const signUp = async (
    email: string,
    password: string,
    userData: { name: string; employeeNumber: string }
  ) => {
    try {
      // TODO: 実際のサインアップAPIを実装
      console.log('サインアップ:', { email, password, userData });
      return { error: 'サインアップ機能は現在開発中です' };
    } catch (error) {
      return { error: 'サインアップ中にエラーが発生しました' };
    }
  };

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      meQuery.refetch().then((result: any) => {
        if (result.data) {
          setUser(result.data);
          // セッション情報も復元
          setSession({
            access_token: token,
            refresh_token: '', // リフレッシュトークンは現在保存していない
          });
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

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    signIn,
    signOut,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 認証フック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
