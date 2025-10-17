// 配置ルール管理用のDTO型定義

export interface JobType {
  id: string;
  name: string;
  description?: string;
  facility_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  facility_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobRuleTemplate {
  id: string;
  name: string;
  description?: string;
  facility_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobRuleSet {
  id: string;
  template_id: string;
  job_type_id: string;
  area_id: string;
  required_skills: string[];
  required_positions: string[];
  min_staff_count: number;
  max_staff_count: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 入力用DTO
export interface CreateJobTypeDto {
  name: string;
  description?: string;
  facility_id: string;
}

export interface UpdateJobTypeDto {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateAreaDto {
  name: string;
  description?: string;
  facility_id: string;
}

export interface UpdateAreaDto {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateJobRuleTemplateDto {
  name: string;
  description?: string;
  facility_id: string;
}

export interface UpdateJobRuleTemplateDto {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateJobRuleSetDto {
  template_id: string;
  job_type_id: string;
  area_id: string;
  required_skills: string[];
  required_positions: string[];
  min_staff_count: number;
  max_staff_count: number;
  priority: number;
}

export interface UpdateJobRuleSetDto {
  id: string;
  required_skills?: string[];
  required_positions?: string[];
  min_staff_count?: number;
  max_staff_count?: number;
  priority?: number;
  is_active?: boolean;
}

export interface GetJobTypesDto {
  facility_id?: string;
  is_active?: boolean;
}

export interface GetAreasDto {
  facility_id?: string;
  is_active?: boolean;
}

export interface GetJobRuleTemplatesDto {
  facility_id?: string;
  is_active?: boolean;
}

export interface GetJobRuleSetsDto {
  template_id?: string;
  job_type_id?: string;
  area_id?: string;
  is_active?: boolean;
}
