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
  accessToken: string | null;
  refreshToken: string | null;
}

// 認証操作
export interface AuthActions {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  requireAuth: (requiredRole?: string) => boolean;
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
