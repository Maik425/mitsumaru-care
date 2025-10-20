'use client';

import { handleAuthError } from '@/lib/auth/errors';
import type { AuthContextType, AuthState, AuthUser } from '@/lib/auth/types';
import { validateAuthUser } from '@/lib/auth/utils';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// localStorage キー
const AUTH_STORAGE_KEY = 'mitsumaru_auth_data';
const AUTH_EXPIRY_KEY = 'mitsumaru_auth_expiry';

// 認証データの型
interface StoredAuthData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  timestamp: number;
}

// localStorage 操作のユーティリティ関数
const authStorage = {
  // 認証データを保存
  save: (data: StoredAuthData) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      // 24時間後に期限切れ
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      window.localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error('Failed to save auth data to localStorage:', error);
    }
  },

  // 認証データを取得
  load: (): StoredAuthData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = window.localStorage.getItem(AUTH_STORAGE_KEY);
      const expiry = window.localStorage.getItem(AUTH_EXPIRY_KEY);

      if (!data || !expiry) return null;

      // 期限切れチェック
      if (Date.now() > parseInt(expiry)) {
        authStorage.clear();
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load auth data from localStorage:', error);
      authStorage.clear();
      return null;
    }
  },

  // 認証データをクリア
  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_EXPIRY_KEY);
    } catch (error) {
      console.error('Failed to clear auth data from localStorage:', error);
    }
  },
};

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

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // ユーザーデータの取得
  const fetchUserData = useCallback(
    async (userId: string): Promise<AuthUser | null> => {
      try {
        console.log('Fetching user data for userId:', userId);

        // ユーザー基本情報を取得
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, role, facility_id, is_active')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('User data fetch error:', userError);
          console.error('Error details:', JSON.stringify(userError, null, 2));
          return null;
        }

        if (!userData) {
          console.error('No user data found for userId:', userId);
          return null;
        }

        console.log('User data found:', userData);

        // 型アサーション
        const user = userData as {
          id: string;
          name: string;
          role: string;
          facility_id: string | null;
          is_active: boolean;
        };

        if (!user.is_active) {
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
          id: user.id,
          email: authData.user.email || '',
          name: user.name,
          role: user.role as AuthUser['role'],
          facility_id: user.facility_id ?? undefined,
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

  // 認証状態の初期化（localStorage優先）
  const initializeAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // まずlocalStorageから認証データを取得
      const storedData = authStorage.load();

      if (storedData) {
        // localStorageに有効な認証データがある場合
        setState(prev => ({
          ...prev,
          user: storedData.user,
          session: null, // セッションは再取得
          loading: false,
          initialized: true,
          accessToken: storedData.accessToken,
          refreshToken: storedData.refreshToken,
        }));
        return;
      }

      // localStorageにデータがない場合、Supabaseセッションをチェック
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
        const user = await fetchUserData(session.user.id);
        if (user) {
          // 認証データをlocalStorageに保存
          authStorage.save({
            user,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            timestamp: Date.now(),
          });
          setState(prev => ({
            ...prev,
            user,
            session,
            loading: false,
            initialized: true,
            accessToken: session?.access_token ?? null,
            refreshToken: session?.refresh_token ?? null,
          }));
        } else {
          // ユーザーデータの取得に失敗した場合
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
      // ログアウト処理中は認証状態の変更を無視
      if (isLoggingOut) {
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log(
            'User signed in, fetching user data for:',
            session.user.id
          );
          console.log('Session user email:', session.user.email);

          const user = await fetchUserData(session.user.id);
          if (user) {
            console.log('User data successfully fetched:', user);
            // 認証データをlocalStorageに保存
            authStorage.save({
              user,
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              timestamp: Date.now(),
            });
            setState(prev => ({
              ...prev,
              user,
              session,
              loading: false,
              initialized: true,
              accessToken: session?.access_token ?? null,
              refreshToken: session?.refresh_token ?? null,
            }));
          } else {
            console.error('Failed to fetch user data after sign in');
            console.error('Session user ID:', session.user.id);
            console.error('Session user email:', session.user.email);
            // ユーザーデータの取得に失敗した場合
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
          console.error('Error in handleAuthStateChange:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
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

        // localStorageの認証データをクリア
        authStorage.clear();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // トークン更新時は現在のユーザー情報を取得してlocalStorageを更新
        setState(prev => {
          if (prev.user) {
            authStorage.save({
              user: prev.user,
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              timestamp: Date.now(),
            });
          }
          return {
            ...prev,
            session,
            accessToken: session?.access_token ?? null,
            refreshToken: session?.refresh_token ?? null,
          };
        });
      }
    },
    [fetchUserData, isLoggingOut]
  );

  // ログイン処理
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process for:', email);
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw handleAuthError(error);
      }

      if (!data.user || !data.session) {
        console.error('No user or session returned from Supabase');
        throw handleAuthError(new Error('Login failed'));
      }

      console.log(
        'Supabase auth successful, fetching user data for:',
        data.user.id
      );
      const user = await fetchUserData(data.user.id);

      if (!user) {
        console.error('Failed to fetch user data after successful auth');
        throw handleAuthError(new Error('User data not found'));
      }

      console.log('User data fetched successfully:', user);
      // 認証データをlocalStorageに保存
      authStorage.save({
        user,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        timestamp: Date.now(),
      });

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
      // ログアウト処理中フラグを設定
      setIsLoggingOut(true);

      // 状態を即座にクリア（ローディングをtrueに設定して再フェッチを防ぐ）
      setState({
        user: null,
        session: null,
        loading: true,
        initialized: true,
        accessToken: null,
        refreshToken: null,
      });

      // localStorageの認証データをクリア
      authStorage.clear();

      // Supabaseからログアウト
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Supabase logout error:', error);
        // エラーが発生してもローカル状態は既にクリア済み
      }

      // ログインページにフルリロードでリダイレクト
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);

      // エラーが発生してもローカル状態はクリア
      setState({
        user: null,
        session: null,
        loading: true,
        initialized: true,
        accessToken: null,
        refreshToken: null,
      });

      // localStorageの認証データもクリア
      authStorage.clear();

      window.location.replace('/login');
    } finally {
      // ログアウト処理完了後、フラグをリセット
      setIsLoggingOut(false);
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
        // トークン更新時もlocalStorageを更新
        setState(prev => {
          if (prev.user && data.session) {
            authStorage.save({
              user: prev.user,
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              timestamp: Date.now(),
            });
          }
          return {
            ...prev,
            session: data.session,
            accessToken: data.session?.access_token ?? null,
            refreshToken: data.session?.refresh_token ?? null,
          };
        });
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

    // 初期化は一度だけ実行
    initializeAuth();

    return () => subscription.unsubscribe();
  }, []); // 依存配列を空にして一度だけ実行

  // 認証チェック関数
  const requireAuth = (requiredRole?: string) => {
    if (state.loading) return false;
    if (!state.user) return false;
    if (requiredRole && state.user.role !== requiredRole) return false;
    return true;
  };

  // 認証が必要なページでのリダイレクト処理
  useEffect(() => {
    if (state.initialized && !state.loading && !state.user) {
      // 認証情報がない場合はログインページにリダイレクト
      router.push('/login');
    }
  }, [state.initialized, state.loading, state.user, router]);

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
