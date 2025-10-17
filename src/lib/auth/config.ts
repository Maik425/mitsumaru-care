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

// 権限の型定義
export type Permission =
  | 'user:read'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'facility:read'
  | 'facility:create'
  | 'facility:update'
  | 'facility:delete'
  | 'system:read'
  | 'system:update'
  | 'staff:read'
  | 'staff:create'
  | 'staff:update'
  | 'attendance:read'
  | 'attendance:create'
  | 'attendance:update'
  | 'shift:read'
  | 'shift:create'
  | 'shift:update'
  | 'shift:delete'
  | 'holiday:read'
  | 'holiday:create'
  | 'holiday:update'
  | 'holiday:delete';

// ロールの権限マッピング
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
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
};

// ロールの日本語表示
export const ROLE_LABELS = {
  system_admin: 'システム管理者',
  facility_admin: '施設管理者',
  user: '一般ユーザー',
} as const;

// ロールの説明
export const ROLE_DESCRIPTIONS = {
  system_admin: '全システムの管理、ユーザー管理が可能',
  facility_admin: '施設内の業務管理が可能',
  user: '基本的な利用者機能のみ利用可能',
} as const;
