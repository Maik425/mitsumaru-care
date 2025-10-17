// 役職管理用のDTO型定義

export interface Position {
  id: string;
  name: string;
  description?: string;
  level: number;
  color_code?: string;
  facility_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPosition {
  id: string;
  user_id: string;
  position_id: string;
  assigned_at: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

// 入力用DTO
export interface CreatePositionDto {
  name: string;
  description?: string;
  level: number;
  color_code?: string;
  facility_id: string;
}

export interface UpdatePositionDto {
  id: string;
  name?: string;
  description?: string;
  level?: number;
  color_code?: string;
  is_active?: boolean;
}

export interface CreateUserPositionDto {
  user_id: string;
  position_id: string;
  assigned_by: string;
}

export interface GetPositionsDto {
  facility_id?: string;
  is_active?: boolean;
}

export interface GetUserPositionsDto {
  user_id?: string;
  position_id?: string;
}
