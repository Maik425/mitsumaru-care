export type UserRole = 'system_admin' | 'facility_admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  facility_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  facility_id?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  facility_id?: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// ロールの日本語表示
export const ROLE_LABELS: Record<UserRole, string> = {
  system_admin: 'システム管理者',
  facility_admin: '施設管理者',
  user: '一般ユーザー',
};

// ロールの説明
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  system_admin: '全システムの管理、ユーザー管理が可能',
  facility_admin: '施設内の業務管理が可能',
  user: '基本的な利用者機能のみ利用可能',
};

// ロールベースのアクセス制御
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
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
