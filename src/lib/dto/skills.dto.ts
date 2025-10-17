// 技能管理用のDTO型定義

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  description?: string;
  facility_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  experience_years: number;
  certified: boolean;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

// 入力用DTO
export interface CreateSkillDto {
  name: string;
  category: string;
  level: number;
  description?: string;
  facility_id: string;
}

export interface UpdateSkillDto {
  id: string;
  name?: string;
  category?: string;
  level?: number;
  description?: string;
  is_active?: boolean;
}

export interface CreateUserSkillDto {
  user_id: string;
  skill_id: string;
  level: number;
  experience_years: number;
  certified: boolean;
}

export interface UpdateUserSkillDto {
  id: string;
  level?: number;
  experience_years?: number;
  certified?: boolean;
}

export interface GetSkillsDto {
  facility_id?: string;
  category?: string;
  is_active?: boolean;
}

export interface GetUserSkillsDto {
  user_id?: string;
  skill_id?: string;
}
