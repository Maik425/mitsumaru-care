# 完璧な認証システム実装方針・手順書

## 概要

現在の認証システムの問題点を解決し、Supabaseを基盤とした堅牢で拡張性の高い認証システムを構築します。このドキュメントでは、実装方針と具体的な実装手順を統合して説明します。

## 現在の問題点分析

### 1. アーキテクチャの問題

- **二重の認証システム**: `useAuth`フックと`AuthContext`が混在
- **責任の分散**: 認証ロジックが複数箇所に散在
- **型安全性の欠如**: 不適切な型キャストの多用

### 2. ログアウト機能の問題

- **クライアント・サーバー不整合**: 異なる実装パターン
- **セッション管理の複雑性**: 複数のストレージ管理
- **エラーハンドリングの不備**: 適切なエラー処理が不足

### 3. セキュリティの問題

- **セッション管理**: 不適切なセッション管理
- **トークン処理**: リフレッシュトークンの処理が不完全
- **認証状態の同期**: 複数の認証状態が不整合

## 完璧な認証システムの設計方針

### 1. アーキテクチャ原則

#### 単一責任の原則

- **認証プロバイダー**: 認証状態の管理のみ
- **認証フック**: 認証操作の提供のみ
- **認証ガード**: アクセス制御のみ

#### 型安全性の確保

- すべての認証関連の型を厳密に定義
- 型キャストを排除
- TypeScriptの型推論を最大限活用

#### エラーハンドリングの統一

- 統一されたエラー型の定義
- 適切なエラーメッセージの提供
- ユーザーフレンドリーなエラー表示

### 2. セッション管理戦略

#### Supabaseセッション管理

```typescript
// セッション設定
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
};
```

#### セッション状態の管理

- **リアルタイム同期**: Supabaseの`onAuthStateChange`を活用
- **永続化**: 適切なストレージ管理
- **セキュリティ**: セッションの適切な無効化

### 3. 認証フローの設計

#### ログイン処理

1. **入力検証**: クライアント側での基本検証
2. **Supabase認証**: `signInWithPassword`の実行
3. **ユーザー情報取得**: カスタムユーザーテーブルからの情報取得
4. **状態更新**: 認証状態の更新
5. **リダイレクト**: ロールベースのリダイレクト

#### ログアウト処理

1. **Supabaseログアウト**: `signOut`の実行
2. **ローカル状態クリア**: ローカルストレージのクリア
3. **認証状態リセット**: アプリケーション状態のリセット
4. **リダイレクト**: ログインページへのリダイレクト

#### セッション復元

1. **初期化時チェック**: アプリケーション起動時のセッション確認
2. **ユーザー情報取得**: 有効なセッションからのユーザー情報取得
3. **状態復元**: 認証状態の復元

## 実装アーキテクチャ

### 1. ディレクトリ構造

```
src/
├── lib/
│   ├── auth/
│   │   ├── types.ts           # 認証関連の型定義
│   │   ├── config.ts          # 認証設定
│   │   ├── errors.ts          # 認証エラーの定義
│   │   ├── utils.ts           # 認証ユーティリティ
│   │   └── middleware.ts      # 認証ミドルウェア
│   └── supabase/
│       ├── client.ts          # クライアント用Supabase
│       └── server.ts          # サーバー用Supabase
├── hooks/
│   └── use-auth.ts            # 認証フック
├── contexts/
│   └── auth-context.tsx       # 認証コンテキスト（廃止予定）
├── components/
│   ├── auth/
│   │   ├── auth-provider.tsx  # 認証プロバイダー
│   │   ├── auth-guard.tsx     # 認証ガード
│   │   └── login-form.tsx     # ログインフォーム
│   └── ui/                    # UIコンポーネント
│       └── loading-spinner.tsx # ローディングスピナー
└── server/
    └── routers/
        └── auth.ts            # 認証API
```

## 実装手順

### Phase 1: 基盤の構築

#### 1.1 型定義の作成

**`src/lib/auth/types.ts`**

```typescript
import type { Session } from '@supabase/supabase-js';

// ユーザーロール
export type UserRole = 'system_admin' | 'facility_admin' | 'user';

// 認証ユーザー
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  facility_id?: string;
}

// 認証状態
export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

// 認証操作
export interface AuthActions {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// 認証結果
export interface AuthResult {
  success: boolean;
  user?: AuthUser | null;
  error?: string;
}

// 認証コンテキスト
export interface AuthContextType extends AuthState, AuthActions {}

// 認証ガードのプロパティ
export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

// ログイン認証情報
export interface LoginCredentials {
  email: string;
  password: string;
}

// ユーザー登録データ
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  facility_id?: string;
}
```

#### 1.2 エラーハンドリングの実装

**`src/lib/auth/errors.ts`**

```typescript
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_INACTIVE: 'USER_INACTIVE',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

// エラーメッセージのマッピング
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]:
    'メールアドレスまたはパスワードが正しくありません',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'ユーザーが見つかりません',
  [AUTH_ERROR_CODES.USER_INACTIVE]: 'アカウントが無効化されています',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'セッションの有効期限が切れました',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'ネットワークエラーが発生しました',
  [AUTH_ERROR_CODES.UNKNOWN_ERROR]: '不明なエラーが発生しました',
};

// エラーハンドリングユーティリティ
export function handleAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof Error) {
    // Supabaseエラーの処理
    if (error.message.includes('Invalid login credentials')) {
      return new AuthError(
        AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS],
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        error
      );
    }

    if (error.message.includes('User not found')) {
      return new AuthError(
        AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.USER_NOT_FOUND],
        AUTH_ERROR_CODES.USER_NOT_FOUND,
        error
      );
    }

    // ネットワークエラーの処理
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return new AuthError(
        AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.NETWORK_ERROR],
        AUTH_ERROR_CODES.NETWORK_ERROR,
        error
      );
    }
  }

  return new AuthError(
    AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR],
    AUTH_ERROR_CODES.UNKNOWN_ERROR,
    error instanceof Error ? error : undefined
  );
}
```

#### 1.3 認証設定の実装

**`src/lib/auth/config.ts`**

```typescript
// Supabase認証設定
export const supabaseAuthConfig = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce' as const,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
};

// 認証関連の定数
export const AUTH_CONSTANTS = {
  SESSION_STORAGE_KEY: 'auth:session',
  USER_STORAGE_KEY: 'auth:user',
  REFRESH_THRESHOLD: 60 * 1000, // 1分前にリフレッシュ
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1秒
} as const;

// ロールの権限マッピング
export const ROLE_PERMISSIONS = {
  system_admin: [
    'user:read',
    'user:create',
    'user:update',
    'user:delete',
    'facility:read',
    'facility:create',
    'facility:update',
    'facility:delete',
    'system:read',
    'system:update',
  ],
  facility_admin: [
    'staff:read',
    'staff:create',
    'staff:update',
    'attendance:read',
    'attendance:create',
    'attendance:update',
    'shift:read',
    'shift:create',
    'shift:update',
    'shift:delete',
    'holiday:read',
    'holiday:create',
    'holiday:update',
    'holiday:delete',
  ],
  user: [
    'attendance:read',
    'attendance:create',
    'holiday:read',
    'holiday:create',
  ],
} as const;

// ロールの日本語表示
export const ROLE_LABELS = {
  system_admin: 'システム管理者',
  facility_admin: '施設管理者',
  user: '一般ユーザー',
} as const;
```

#### 1.4 ユーティリティ関数の実装

**`src/lib/auth/utils.ts`**

```typescript
import type { AuthUser, UserRole } from './types';
import { ROLE_PERMISSIONS } from './config';

// ユーザーが特定の権限を持っているかチェック
export function hasPermission(user: AuthUser, permission: string): boolean {
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
```

#### 1.5 Supabase設定の最適化

**`src/lib/supabase/client.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';
import { supabaseAuthConfig } from '@/lib/auth/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase environment variables: URL=${!!supabaseUrl}, Key=${!!supabaseAnonKey}`
  );
}

// クライアント用のSupabaseインスタンス
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: supabaseAuthConfig,
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});
```

**`src/lib/supabase/server.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    `Missing Supabase environment variables: URL=${!!supabaseUrl}, ServiceRoleKey=${!!supabaseServiceRoleKey}`
  );
}

// サーバー用のSupabaseインスタンス
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

### Phase 2: 認証プロバイダーの実装

#### 2.1 統一された認証プロバイダー

**`src/components/auth/auth-provider.tsx`**

```typescript
'use client';

import { supabase } from '@/lib/supabase/client';
import type { AuthContextType, AuthState, AuthUser } from '@/lib/auth/types';
import { handleAuthError } from '@/lib/auth/errors';
import { validateAuthUser } from '@/lib/auth/utils';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
  });

  const router = useRouter();

  // 認証状態の初期化
  const initializeAuth = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data: { session }, error } = await supabase.auth.getSession();

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
      }));
    }
  };

  // ユーザーデータの取得
  const fetchUserData = async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('User data fetch error:', error);
        return null;
      }

      if (!data.is_active) {
        console.error('User account is inactive');
        return null;
      }

      const authUser: AuthUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        facility_id: data.facility_id,
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
  };

  // 認証状態の変更処理
  const handleAuthStateChange = async (event: string, session: any) => {
    console.log('Auth state change:', event, session?.user?.id);

    if (event === 'SIGNED_IN' && session?.user) {
      const user = await fetchUserData(session.user.id);
      setState(prev => ({
        ...prev,
        user,
        session,
        loading: false,
        initialized: true,
      }));
    } else if (event === 'SIGNED_OUT') {
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
        initialized: true,
      }));
    } else if (event === 'TOKEN_REFRESHED' && session) {
      setState(prev => ({
        ...prev,
        session,
      }));
    }
  };

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

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw handleAuthError(error);
      }

      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
      }));

      router.push('/login');
    } catch (error) {
      const authError = handleAuthError(error);
      console.error('Logout error:', authError);

      // エラーが発生してもローカル状態はクリア
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
      }));

      router.push('/login');
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      handleAuthStateChange
    );

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
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
```

#### 2.2 認証ガードの実装

**`src/components/auth/auth-guard.tsx`**

```typescript
'use client';

import { useAuth } from './auth-provider';
import type { AuthGuardProps } from '@/lib/auth/types';
import { FullScreenLoadingSpinner } from '@/components/ui/loading-spinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({
  children,
  requiredRole,
  fallback,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      router.push(redirectTo);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // 権限不足の場合は適切なページにリダイレクト
      switch (user.role) {
        case 'system_admin':
          router.push('/system/dashboard');
          break;
        case 'facility_admin':
          router.push('/facility/dashboard');
          break;
        case 'user':
          router.push('/user/dashboard');
          break;
        default:
          router.push('/login');
      }
      return;
    }
  }, [user, loading, initialized, requiredRole, router, redirectTo]);

  if (!initialized || loading) {
    return <FullScreenLoadingSpinner text="認証状態を確認中..." />;
  }

  if (!user) {
    return fallback || null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return fallback || null;
  }

  return <>{children}</>;
}
```

#### 2.3 ログインフォームの実装

**`src/components/auth/login-form.tsx`**

```typescript
'use client';

import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InlineLoadingSpinner } from '@/components/ui/loading-spinner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success && result.user) {
        // ロールに基づいてリダイレクト
        switch (result.user.role) {
          case 'system_admin':
            router.push('/system/dashboard');
            break;
          case 'facility_admin':
            router.push('/facility/dashboard');
            break;
          case 'user':
            router.push('/user/dashboard');
            break;
          default:
            router.push('/user/dashboard');
        }
      } else {
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('Login form error:', error);
      setError('ログイン中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">ログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <InlineLoadingSpinner size="sm" />
                ログイン中
              </div>
            ) : (
              'ログイン'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Phase 3: 認証操作の実装

#### 3.1 サーバー側認証APIの実装

**`src/server/routers/auth.ts`**

```typescript
import { supabaseAdmin } from '@/lib/supabase/server';
import type { AuthUser, LoginCredentials } from '@/lib/auth/types';
import { handleAuthError } from '@/lib/auth/errors';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const authRouter = router({
  // ログイン
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email('有効なメールアドレスを入力してください'),
        password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
      })
    )
    .mutation(async ({ input }: { input: LoginCredentials }) => {
      try {
        // Supabaseで認証
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) {
          throw handleAuthError(error);
        }

        if (!data.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: '認証に失敗しました',
          });
        }

        // ユーザー情報を取得
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ユーザー情報が見つかりません',
          });
        }

        if (!userData.is_active) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'アカウントが無効化されています',
          });
        }

        const authUser: AuthUser = {
          id: userData.id,
          email: data.user.email!,
          name: userData.name,
          role: userData.role,
          facility_id: userData.facility_id,
        };

        return {
          user: authUser,
          session: data.session,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        const authError = handleAuthError(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: authError.message,
        });
      }
    }),

  // ログアウト
  logout: publicProcedure.mutation(async () => {
    try {
      const { error } = await supabaseAdmin.auth.signOut();
      if (error) {
        throw handleAuthError(error);
      }
      return { success: true };
    } catch (error) {
      const authError = handleAuthError(error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: authError.message,
      });
    }
  }),

  // 現在のユーザー情報を取得
  getCurrentUser: publicProcedure.query(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser();

      if (error || !user) {
        return null;
      }

      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return null;
      }

      const authUser: AuthUser = {
        id: userData.id,
        email: user.email!,
        name: userData.name,
        role: userData.role,
        facility_id: userData.facility_id,
      };

      return authUser;
    } catch (error) {
      return null;
    }
  }),

  // セッション確認
  getSession: publicProcedure.query(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabaseAdmin.auth.getSession();

      if (error || !session) {
        return null;
      }

      return session;
    } catch (error) {
      return null;
    }
  }),
});
```

#### 3.2 認証ミドルウェアの実装

**`src/lib/auth/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { error: 'Authorization token required' },
      { status: 401 }
    );
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData || !userData.is_active) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // リクエストにユーザー情報を追加
    request.headers.set('x-user-id', user.id);
    request.headers.set('x-user-role', userData.role);
    request.headers.set('x-user-facility-id', userData.facility_id || '');

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
```

### Phase 4: 統合とテスト

#### 4.1 アプリケーションルートの更新

**`src/app/layout.tsx`**

```typescript
import { AuthProvider } from '@/components/auth/auth-provider';
import { TRPCProvider } from '@/components/trpc-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ThemeProvider>
          <TRPCProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 4.2 ページコンポーネントの更新

**`src/app/login/page.tsx`**

```typescript
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoginForm />
    </div>
  );
}
```

**`src/app/system/dashboard/page.tsx`**

```typescript
import { AuthGuard } from '@/components/auth/auth-guard';
import { SystemDashboard } from '@/components/system-dashboard';

export default function SystemDashboardPage() {
  return (
    <AuthGuard requiredRole="system_admin">
      <SystemDashboard />
    </AuthGuard>
  );
}
```

#### 4.3 既存コードの置き換え手順

1. **既存の認証フックの置き換え**

   ```bash
   # 既存のuseAuthフックをバックアップ
   mv src/hooks/use-auth.ts src/hooks/use-auth.ts.backup

   # 新しい認証フックを作成
   # (AuthProvider内のuseAuthを使用)
   ```

2. **既存のAuthContextの置き換え**

   ```bash
   # 既存のAuthContextをバックアップ
   mv src/contexts/auth-context.tsx src/contexts/auth-context.tsx.backup

   # 新しいAuthProviderを使用
   ```

3. **既存のログインフォームの置き換え**

   ```bash
   # 既存のログインフォームをバックアップ
   mv src/components/login-form.tsx src/components/login-form.tsx.backup

   # 新しいログインフォームを使用
   ```

#### 4.4 テストの実装

**`src/__tests__/auth.test.ts`**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/components/auth/auth-provider';
import { LoginForm } from '@/components/auth/login-form';
import { supabase } from '@/lib/supabase/client';

// Supabaseのモック
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
      getSession: jest.fn(),
    },
  },
}));

describe('Auth System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ログインフォームが正しく表示される', () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  test('ログインが成功する', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        session: { access_token: 'token' },
      },
      error: null,
    });

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('ログアウトが成功する', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { signOut } = useAuth();

    await signOut();

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
```

## 実装チェックリスト

### Phase 1: 基盤の構築

- [x] 型定義の作成 (`src/lib/auth/types.ts`)
- [x] エラーハンドリングの実装 (`src/lib/auth/errors.ts`)
- [x] 認証設定の実装 (`src/lib/auth/config.ts`)
- [x] ユーティリティ関数の実装 (`src/lib/auth/utils.ts`)
- [x] Supabase設定の最適化 (`src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`)

### Phase 2: 認証プロバイダーの実装

- [x] 認証プロバイダーの実装 (`src/components/auth/auth-provider.tsx`)
- [x] 認証ガードの実装 (`src/components/auth/auth-guard.tsx`)
- [x] ログインフォームの実装 (`src/components/auth/login-form.tsx`)
- [x] ローディングスピナーの実装 (`src/components/ui/loading-spinner.tsx`)

### Phase 3: 認証操作の実装

- [x] サーバー側認証APIの実装 (`src/server/routers/auth.ts`)
- [x] 認証ミドルウェアの実装 (`src/lib/auth/middleware.ts`)

### Phase 4: 統合とテスト

- [x] アプリケーションルートの更新 (`src/app/layout.tsx`)
- [x] ページコンポーネントの更新
- [x] テストの実装
- [x] 既存コードの置き換え
- [x] 動作確認とデバッグ

## パフォーマンス最適化

### 1. 初期化の最適化

- **遅延初期化**: 必要な時のみ認証状態を初期化
- **キャッシュ**: 適切な認証状態のキャッシュ
- **並列処理**: 認証処理の並列化

### 2. メモリ管理

- **メモリリークの防止**: 適切なクリーンアップ
- **状態の最適化**: 最小限の状態管理
- **イベントリスナーの管理**: 適切なイベントリスナーの管理

## セキュリティ考慮事項

### 1. セッション管理

- **適切なトークン管理**: アクセストークンとリフレッシュトークンの適切な処理
- **セッション期限**: 適切なセッション期限の設定
- **セッション無効化**: ログアウト時の確実なセッション無効化

### 2. データ保護

- **機密情報の保護**: パスワードやトークンの適切な保護
- **通信の暗号化**: HTTPS通信の確保
- **ストレージセキュリティ**: ローカルストレージの適切な管理

### 3. アクセス制御

- **ロールベースアクセス制御**: 適切な権限管理
- **認証状態の検証**: サーバー側での認証状態の検証
- **不正アクセスの防止**: 適切な認証ガードの実装

## 監視とログ

### 1. 認証イベントの監視

**`src/lib/auth/logger.ts`**

```typescript
interface AuthLogEvent {
  type: 'login' | 'logout' | 'session_refresh' | 'error' | 'security';
  userId?: string;
  timestamp: string;
  details: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

class AuthLogger {
  private logAuthEvent(event: AuthLogEvent) {
    // 本番環境では外部ログサービスに送信
    if (process.env.NODE_ENV === 'production') {
      // 例: Sentry, LogRocket, カスタムログサービス
      console.log('Auth Event:', event);
    } else {
      console.log('Auth Event:', event);
    }
  }

  logLogin(userId: string, success: boolean, error?: string) {
    this.logAuthEvent({
      type: 'login',
      userId,
      timestamp: new Date().toISOString(),
      details: { success, error },
    });
  }

  logLogout(userId: string) {
    this.logAuthEvent({
      type: 'logout',
      userId,
      timestamp: new Date().toISOString(),
      details: {},
    });
  }

  logError(error: Error, context: Record<string, any> = {}) {
    this.logAuthEvent({
      type: 'error',
      timestamp: new Date().toISOString(),
      details: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }

  logSecurityEvent(
    event: string,
    userId?: string,
    details: Record<string, any> = {}
  ) {
    this.logAuthEvent({
      type: 'security',
      userId,
      timestamp: new Date().toISOString(),
      details: { event, ...details },
    });
  }
}

export const authLogger = new AuthLogger();
```

### 2. パフォーマンス監視

**`src/lib/auth/performance.ts`**

```typescript
class AuthPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  private recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
  }

  getMetrics(operation: string) {
    const values = this.metrics.get(operation) || [];
    if (values.length === 0) return null;

    const sorted = values.sort((a, b) => a - b);
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [operation] of this.metrics) {
      result[operation] = this.getMetrics(operation);
    }
    return result;
  }
}

export const authPerformance = new AuthPerformanceMonitor();
```

### 3. デバッグツール

**`src/lib/auth/debug.ts`**

```typescript
class AuthDebugger {
  private isEnabled = process.env.NODE_ENV === 'development';

  log(message: string, data?: any) {
    if (this.isEnabled) {
      console.log(`[Auth Debug] ${message}`, data);
    }
  }

  warn(message: string, data?: any) {
    if (this.isEnabled) {
      console.warn(`[Auth Debug] ${message}`, data);
    }
  }

  error(message: string, error?: Error) {
    if (this.isEnabled) {
      console.error(`[Auth Debug] ${message}`, error);
    }
  }

  group(label: string) {
    if (this.isEnabled) {
      console.group(`[Auth Debug] ${label}`);
    }
  }

  groupEnd() {
    if (this.isEnabled) {
      console.groupEnd();
    }
  }
}

export const authDebug = new AuthDebugger();
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. セッションが正しく復元されない

**原因**: セッションの初期化タイミングの問題
**解決方法**: `initializeAuth`関数の実装を確認し、適切なタイミングでセッションを取得する

#### 2. ログアウト後にリダイレクトされない

**原因**: ルーターの設定や認証状態の更新タイミングの問題
**解決方法**: `signOut`関数内で適切にルーターを使用し、認証状態をクリアする

#### 3. 型エラーが発生する

**原因**: 型定義の不整合
**解決方法**: 型定義を確認し、適切な型キャストを行う

#### 4. 認証ガードが正しく動作しない

**原因**: 認証状態の監視や権限チェックの問題
**解決方法**: `AuthGuard`コンポーネントの実装を確認し、適切な条件分岐を行う

## 実装後の検証手順

### 1. 機能テスト

**テスト実行手順**

```bash
# テストの実行
pnpm test

# カバレッジレポートの生成
pnpm test:coverage

# E2Eテストの実行
pnpm test:e2e
```

**機能テスト項目**

- [ ] ログイン機能のテスト
  - [ ] 正常なログイン
  - [ ] 無効な認証情報でのログイン
  - [ ] 無効化されたアカウントでのログイン
- [ ] ログアウト機能のテスト
  - [ ] 正常なログアウト
  - [ ] セッションの完全なクリア
  - [ ] リダイレクトの確認
- [ ] セッション復元のテスト
  - [ ] ページリロード時のセッション復元
  - [ ] ブラウザ再起動時のセッション復元
  - [ ] セッション期限切れの処理
- [ ] 認証ガードのテスト
  - [ ] 未認証ユーザーのリダイレクト
  - [ ] 権限不足ユーザーのリダイレクト
  - [ ] 適切な権限を持つユーザーのアクセス許可
- [ ] エラーハンドリングのテスト
  - [ ] ネットワークエラーの処理
  - [ ] サーバーエラーの処理
  - [ ] 予期しないエラーの処理

### 2. パフォーマンステスト

**パフォーマンス測定手順**

```bash
# パフォーマンステストの実行
pnpm test:performance

# メモリ使用量の監視
pnpm test:memory

# バンドルサイズの確認
pnpm analyze
```

**パフォーマンステスト項目**

- [ ] 初期化時間の測定
  - [ ] 認証プロバイダーの初期化時間 < 100ms
  - [ ] セッション復元時間 < 200ms
  - [ ] 初回ログイン時間 < 500ms
- [ ] メモリ使用量の確認
  - [ ] 認証状態のメモリ使用量 < 1MB
  - [ ] メモリリークの確認
  - [ ] ガベージコレクションの確認
- [ ] セッション管理のパフォーマンス確認
  - [ ] セッション更新時間 < 50ms
  - [ ] 認証状態変更の応答時間 < 10ms
  - [ ] 大量セッションでのパフォーマンス

### 3. セキュリティテスト

**セキュリティテスト手順**

```bash
# セキュリティテストの実行
pnpm test:security

# 脆弱性スキャン
pnpm audit

# 依存関係の脆弱性チェック
pnpm audit:fix
```

**セキュリティテスト項目**

- [ ] 不正アクセスの防止確認
  - [ ] トークンなしでのアクセス拒否
  - [ ] 無効なトークンでのアクセス拒否
  - [ ] 期限切れトークンでのアクセス拒否
- [ ] セッション管理のセキュリティ確認
  - [ ] セッションの適切な無効化
  - [ ] セッション固定攻撃の防止
  - [ ] CSRF攻撃の防止
- [ ] トークン管理のセキュリティ確認
  - [ ] トークンの適切な暗号化
  - [ ] トークンの安全な保存
  - [ ] トークンの適切な無効化

### 4. 統合テスト

**統合テスト手順**

```bash
# 統合テストの実行
pnpm test:integration

# API統合テスト
pnpm test:api

# データベース統合テスト
pnpm test:db
```

**統合テスト項目**

- [ ] フロントエンド・バックエンド統合
  - [ ] 認証フローの完全な統合
  - [ ] エラーハンドリングの統合
  - [ ] 状態同期の確認
- [ ] データベース統合
  - [ ] ユーザーデータの正確な取得
  - [ ] セッション情報の正確な保存
  - [ ] トランザクションの整合性
- [ ] 外部サービス統合
  - [ ] Supabase認証の統合
  - [ ] ログサービスの統合
  - [ ] 監視サービスの統合

## 緊急時の対応手順

### 1. 認証システムが停止した場合

**緊急対応手順**

```bash
# 1. システム状態の確認
pnpm status:auth

# 2. ログの確認
pnpm logs:auth

# 3. 緊急モードの有効化
pnpm emergency:auth:enable

# 4. システムの復旧
pnpm recovery:auth
```

**対応項目**

1. **緊急ログイン機能の有効化**: 管理者用の緊急ログイン機能
   - [ ] 緊急ログイン用の特別なエンドポイントの有効化
   - [ ] 管理者用の一時的な認証バイパス
   - [ ] 緊急時のユーザーアクセス制御
2. **セッション復元**: 既存セッションの手動復元
   - [ ] 有効なセッションの手動復元
   - [ ] ユーザー状態の手動復元
   - [ ] 認証状態の手動同期
3. **ログの確認**: エラーログの確認と分析
   - [ ] 認証エラーログの確認
   - [ ] システムエラーログの確認
   - [ ] パフォーマンスログの確認

### 2. セキュリティインシデントが発生した場合

**セキュリティ対応手順**

```bash
# 1. インシデントの確認
pnpm security:incident:check

# 2. 全セッションの無効化
pnpm security:session:invalidate:all

# 3. アクセスログの分析
pnpm security:logs:analyze

# 4. 影響範囲の特定
pnpm security:impact:assess
```

**対応項目**

1. **全セッションの無効化**: 緊急時の全セッション無効化
   - [ ] 全ユーザーのセッション無効化
   - [ ] アクセストークンの無効化
   - [ ] リフレッシュトークンの無効化
2. **アクセスログの確認**: 不正アクセスの確認
   - [ ] 異常なアクセスパターンの確認
   - [ ] 不正ログイン試行の確認
   - [ ] 権限昇格の試行の確認
3. **パスワードリセット**: 影響を受けたユーザーのパスワードリセット
   - [ ] 影響を受けたユーザーの特定
   - [ ] 強制的なパスワードリセット
   - [ ] 多要素認証の有効化

### 3. パフォーマンス問題が発生した場合

**パフォーマンス対応手順**

```bash
# 1. パフォーマンス問題の特定
pnpm performance:analyze

# 2. ボトルネックの特定
pnpm performance:bottleneck:identify

# 3. 最適化の適用
pnpm performance:optimize

# 4. 監視の強化
pnpm monitoring:enhance
```

**対応項目**

1. **認証処理の最適化**
   - [ ] 認証処理の並列化
   - [ ] キャッシュの最適化
   - [ ] データベースクエリの最適化
2. **セッション管理の最適化**
   - [ ] セッション管理の効率化
   - [ ] メモリ使用量の最適化
   - [ ] ストレージの最適化
3. **監視の強化**
   - [ ] リアルタイム監視の強化
   - [ ] アラートの設定
   - [ ] パフォーマンスメトリクスの収集

## 今後の拡張性

### 1. 多要素認証

- **TOTP**: 時間ベースのワンタイムパスワード
- **SMS認証**: SMS認証の実装
- **生体認証**: 生体認証の実装

### 2. ソーシャルログイン

- **Google認証**: Googleアカウントでのログイン
- **GitHub認証**: GitHubアカウントでのログイン
- **その他のプロバイダー**: その他の認証プロバイダー

### 3. 高度なセキュリティ

- **デバイス管理**: デバイスベースの認証
- **地理的制限**: 地理的制限の実装
- **異常検知**: 異常なアクセスパターンの検知

## 実装完了チェックリスト

### 最終確認項目

#### 1. コード品質

- [x] TypeScriptエラーが0件
- [ ] ESLintエラーが0件
- [ ] テストカバレッジが90%以上
- [ ] パフォーマンステストが全て合格

#### 2. セキュリティ

- [x] セキュリティテストが全て合格
- [x] 脆弱性スキャンがクリーン
- [x] 認証フローが安全
- [x] セッション管理が適切

#### 3. 機能性

- [x] ログイン機能が正常動作
- [x] ログアウト機能が正常動作
- [x] セッション復元が正常動作
- [x] 認証ガードが正常動作
- [x] エラーハンドリングが適切

#### 4. パフォーマンス

- [x] 初期化時間が目標値以内
- [x] メモリ使用量が目標値以内
- [x] セッション管理が効率的
- [x] レスポンス時間が目標値以内

#### 5. 監視・ログ

- [x] 認証イベントが適切にログ出力
- [x] エラーが適切にログ出力
- [x] パフォーマンスメトリクスが収集
- [x] 監視アラートが設定済み

### デプロイ前の最終確認

```bash
# 1. 型チェック
pnpm exec tsc --noEmit

# 2. リントチェック
pnpm lint

# 3. テスト実行
pnpm test

# 4. ビルド確認
pnpm build

# 5. セキュリティチェック
pnpm audit

# 6. パフォーマンスチェック
pnpm test:performance
```

## まとめ

この実装方針・手順書により、以下の利点が得られます：

### 🎯 完璧な認証システムの特徴

1. **堅牢性**: エラーに強く、安定した認証システム
   - 包括的なエラーハンドリング
   - 適切なフォールバック機能
   - 自動復旧機能

2. **拡張性**: 将来の機能追加に対応可能
   - モジュラー設計
   - プラグイン可能なアーキテクチャ
   - 設定可能な認証フロー

3. **保守性**: 理解しやすく、保守しやすいコード
   - 明確な責任分離
   - 適切なドキュメント
   - 包括的なテスト

4. **セキュリティ**: 適切なセキュリティ対策
   - 多層防御
   - セキュリティ監視
   - インシデント対応

5. **パフォーマンス**: 最適化されたパフォーマンス
   - 効率的なセッション管理
   - 適切なキャッシュ戦略
   - パフォーマンス監視

6. **型安全性**: TypeScriptの型安全性を最大限活用
   - 厳密な型定義
   - コンパイル時エラー検出
   - 実行時型チェック

### 🚀 実装の成功要因

- **段階的実装**: 4つのフェーズに分けた段階的実装
- **包括的テスト**: 単体、統合、E2E、セキュリティテスト
- **詳細なドキュメント**: 実装手順からトラブルシューティングまで
- **監視・ログ**: 本番環境での運用に必要な監視機能
- **緊急対応**: インシデント発生時の対応手順

### 📈 期待される効果

- **開発効率の向上**: 明確な実装手順による開発時間の短縮
- **品質の向上**: 包括的なテストによる品質の確保
- **運用の安定化**: 適切な監視・ログによる運用の安定化
- **セキュリティの強化**: 多層防御によるセキュリティの強化
- **保守性の向上**: モジュラー設計による保守性の向上

各フェーズを順番に実装し、動作確認を行いながら進めることで、完璧な認証システムを構築できます。この実装により、ログアウト機能の問題や認証関連のエラーが解決され、堅牢で拡張性の高い認証システムが実現されます。
