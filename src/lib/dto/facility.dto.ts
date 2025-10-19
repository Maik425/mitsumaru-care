// 施設管理用DTO

export interface FacilityRawData {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface FacilityResponseDto {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFacilityDto {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateFacilityDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface GetFacilitiesDto {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FacilitiesListResponseDto {
  facilities: FacilityResponseDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface DeleteFacilityDto {
  id: string;
}

export interface FacilityStatsDto {
  facility_id: string;
  user_count: number;
  active_user_count: number;
  attendance_records_count: number;
  last_activity?: string;
}

export interface GetFacilityStatsDto {
  facility_id?: string;
}
