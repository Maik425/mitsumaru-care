'use client';

import { handleAuthError } from '@/lib/auth/errors';
import type { AuthContextType, AuthState, AuthUser } from '@/lib/auth/types';
import { validateAuthUser } from '@/lib/auth/utils';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    accessToken: null,
    refreshToken: null,
  });

  const router = useRouter();

  // ユーザーデータの取得
  const fetchUserData = useCallback(
    async (userId: string): Promise<AuthUser | null> => {
      try {
        // ユーザー基本情報を取得
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          console.error('User data fetch error:', userError);
          return null;
        }

        if (!userData.is_active) {
          console.error('User account is inactive');
          return null;
        }

        // 認証ユーザーからemailを取得
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          console.error('Auth user fetch error:', authError);
          return null;
        }

        const authUser: AuthUser = {
          id: userData.id,
          email: authData.user.email || '',
          name: userData.name,
          role: userData.role,
          facility_id: userData.facility_id,
        };

        if (!validateAuthUser(authUser)) {
          console.error('Invalid user data structure');
          return null;
        }

        return authUser;
      } catch (error) {
        console.error('User data fetch error:', error);
        return null;
      }
    },
    []
  );

  // 認証状態の初期化
  const initializeAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Session initialization error:', error);
        setState(prev => ({ ...prev, loading: false, initialized: true }));
        return;
      }

      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          session: null,
          loading: false,
          initialized: true,
          accessToken: null,
          refreshToken: null,
        }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
        initialized: true,
        accessToken: null,
        refreshToken: null,
      }));
    }
  }, [fetchUserData]);

  // 認証状態の変更処理
  const handleAuthStateChange = useCallback(
    async (event: string, session: any) => {
      console.log('Auth state change:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        const user = await fetchUserData(session.user.id);
        setState(prev => ({
          ...prev,
          user,
          session,
          loading: false,
          initialized: true,
          accessToken: session?.access_token ?? null,
          refreshToken: session?.refresh_token ?? null,
        }));
      } else if (event === 'SIGNED_OUT') {
        // ログアウト時は即座に状態をクリア
        setState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
          accessToken: null,
          refreshToken: null,
        });

        // ローカルストレージもクリア
        if (typeof window !== 'undefined') {
          window.localStorage.clear();
          window.sessionStorage.clear();
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setState(prev => ({
          ...prev,
          session,
          accessToken: session?.access_token ?? null,
          refreshToken: session?.refresh_token ?? null,
        }));
      }
    },
    [fetchUserData]
  );

  // ログイン処理
  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw handleAuthError(error);
      }

      if (!data.user || !data.session) {
        throw handleAuthError(new Error('Login failed'));
      }

      const user = await fetchUserData(data.user.id);

      if (!user) {
        throw handleAuthError(new Error('User data not found'));
      }

      setState(prev => ({
        ...prev,
        user,
        session: data.session,
        loading: false,
        accessToken: data.session?.access_token ?? null,
        refreshToken: data.session?.refresh_token ?? null,
      }));

      return { success: true, user };
    } catch (error) {
      const authError = handleAuthError(error);
      setState(prev => ({ ...prev, loading: false }));
      return { success: false, error: authError.message };
    }
  };

  // ログアウト処理
  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // ローカルストレージとセッションストレージをクリア
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();

        // 特定のキーを個別にクリア（念のため）
        const supabaseKey =
          'sb-' +
          process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] +
          '-auth-token';
        window.localStorage.removeItem(supabaseKey);
        window.sessionStorage.removeItem(supabaseKey);
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw handleAuthError(error);
      }

      // 状態を即座にクリア
      setState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
        accessToken: null,
        refreshToken: null,
      });

      // ログインページにリダイレクト
      router.push('/login');
      router.refresh(); // ページを強制リフレッシュ
    } catch (error) {
      const authError = handleAuthError(error);
      console.error('Logout error:', authError);

      // エラーが発生してもローカル状態はクリア
      setState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
        accessToken: null,
        refreshToken: null,
      });

      // ローカルストレージもクリア
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }

      router.push('/login');
      router.refresh(); // ページを強制リフレッシュ
    }
  };

  // セッション更新処理
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw handleAuthError(error);
      }

      if (data.session) {
        setState(prev => ({
          ...prev,
          session: data.session,
          accessToken: data.session?.access_token ?? null,
          refreshToken: data.session?.refresh_token ?? null,
        }));
      }
    } catch (error) {
      const authError = handleAuthError(error);
      console.error('Session refresh error:', authError);

      // セッション更新に失敗した場合はログアウト
      await signOut();
    }
  };

  // 認証状態の監視
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [handleAuthStateChange, initializeAuth]);

  // 認証チェック関数
  const requireAuth = (requiredRole?: string) => {
    if (state.loading) return false;
    if (!state.user) return false;
    if (requiredRole && state.user.role !== requiredRole) return false;
    return true;
  };

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signOut,
    refreshSession,
    requireAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// 認証フック
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
