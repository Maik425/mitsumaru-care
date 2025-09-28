import type { UserRole } from '@/lib/types/auth';

// データベースから取得される生のユーザーデータ
export interface UserRawData {
  id: string;
  email: string | null;
  name: string;
  role: UserRole;
  facility_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ユーザー一覧取得用のDTO
export interface GetUsersDto {
  limit?: number;
  offset?: number;
  role?: UserRole;
  facility_id?: string;
}

// ユーザー作成用のDTO
export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  facility_id?: string;
}

// ユーザー更新用のDTO
export interface UpdateUserDto {
  id: string;
  name?: string;
  role?: UserRole;
  facility_id?: string;
  is_active?: boolean;
}

// ユーザー削除用のDTO
export interface DeleteUserDto {
  id: string;
}

// パスワードリセット用のDTO
export interface ResetPasswordDto {
  email: string;
}

// ユーザー詳細取得用のDTO
export interface GetUserDto {
  id: string;
}

// レスポンス用のDTO
export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  facility_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ユーザー一覧レスポンス用のDTO
export interface UsersListResponseDto {
  users: UserResponseDto[];
  total: number;
  limit: number;
  offset: number;
}
