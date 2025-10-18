import type {
  Area,
  CreateAreaDto,
  CreateJobRuleSetDto,
  CreateJobRuleTemplateDto,
  CreateJobTypeDto,
  GetAreasDto,
  GetJobRuleSetsDto,
  GetJobRuleTemplatesDto,
  GetJobTypesDto,
  JobRuleSet,
  JobRuleTemplate,
  JobType,
  UpdateAreaDto,
  UpdateJobRuleSetDto,
  UpdateJobRuleTemplateDto,
  UpdateJobTypeDto,
} from '@/lib/dto/job-rules.dto';
import type { SupabaseClient } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type { JobRulesDataSource } from './job-rules-datasource';

export class SupabaseJobRulesDataSource implements JobRulesDataSource {
  constructor(private readonly client: SupabaseClient) {}

  private from(table: string) {
    return this.client.from(table);
  }

  // Job Types
  async getJobTypes(dto: GetJobTypesDto): Promise<JobType[]> {
    let query = this.from('job_types')
      .select('*')
      .order('name', { ascending: true });

    if (dto.facility_id) {
      query = query.eq('facility_id', dto.facility_id);
    }
    if (dto.is_active !== undefined) {
      query = query.eq('is_active', dto.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as JobType[];
  }

  async getJobType(id: string): Promise<JobType | null> {
    const { data, error } = await this.from('job_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as JobType) ?? null;
  }

  async createJobType(dto: CreateJobTypeDto): Promise<JobType> {
    const jobTypePayload = {
      name: dto.name,
      description: dto.description ?? null,
      facility_id: dto.facility_id,
      is_active: true,
    };

    const { data, error } = await this.from('job_types')
      .insert(jobTypePayload)
      .select()
      .single();

    if (error) throw error;
    return data as JobType;
  }

  async updateJobType(dto: UpdateJobTypeDto): Promise<JobType> {
    const { id, ...updateData } = dto;
    const jobTypeUpdate = {
      name: updateData.name,
      description: updateData.description ?? null,
      is_active: updateData.is_active,
    };

    const { data, error } = await this.from('job_types')
      .update(jobTypeUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as JobType;
  }

  async deleteJobType(id: string): Promise<void> {
    const { error } = await this.from('job_types').delete().eq('id', id);
    if (error) throw error;
  }

  // Areas
  async getAreas(dto: GetAreasDto): Promise<Area[]> {
    let query = this.from('areas')
      .select('*')
      .order('name', { ascending: true });

    if (dto.facility_id) {
      query = query.eq('facility_id', dto.facility_id);
    }
    if (dto.is_active !== undefined) {
      query = query.eq('is_active', dto.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Area[];
  }

  async getArea(id: string): Promise<Area | null> {
    const { data, error } = await this.from('areas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as Area) ?? null;
  }

  async createArea(dto: CreateAreaDto): Promise<Area> {
    const areaPayload = {
      name: dto.name,
      description: dto.description ?? null,
      facility_id: dto.facility_id,
      is_active: true,
    };

    const { data, error } = await this.from('areas')
      .insert(areaPayload)
      .select()
      .single();

    if (error) throw error;
    return data as Area;
  }

  async updateArea(dto: UpdateAreaDto): Promise<Area> {
    const { id, ...updateData } = dto;
    const areaUpdate = {
      name: updateData.name,
      description: updateData.description ?? null,
      is_active: updateData.is_active,
    };

    const { data, error } = await this.from('areas')
      .update(areaUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Area;
  }

  async deleteArea(id: string): Promise<void> {
    const { error } = await this.from('areas').delete().eq('id', id);
    if (error) throw error;
  }

  // Job Rule Templates
  async getJobRuleTemplates(
    dto: GetJobRuleTemplatesDto
  ): Promise<JobRuleTemplate[]> {
    let query = this.from('job_rule_templates')
      .select('*')
      .order('name', { ascending: true });

    if (dto.facility_id) {
      query = query.eq('facility_id', dto.facility_id);
    }
    if (dto.is_active !== undefined) {
      query = query.eq('is_active', dto.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as JobRuleTemplate[];
  }

  async getJobRuleTemplate(id: string): Promise<JobRuleTemplate | null> {
    const { data, error } = await this.from('job_rule_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as JobRuleTemplate) ?? null;
  }

  async createJobRuleTemplate(
    dto: CreateJobRuleTemplateDto
  ): Promise<JobRuleTemplate> {
    const templatePayload = {
      name: dto.name,
      description: dto.description ?? null,
      facility_id: dto.facility_id,
      is_active: true,
    };

    const { data, error } = await this.from('job_rule_templates')
      .insert(templatePayload)
      .select()
      .single();

    if (error) throw error;
    return data as JobRuleTemplate;
  }

  async updateJobRuleTemplate(
    dto: UpdateJobRuleTemplateDto
  ): Promise<JobRuleTemplate> {
    const { id, ...updateData } = dto;
    const templateUpdate = {
      name: updateData.name,
      description: updateData.description ?? null,
      is_active: updateData.is_active,
    };

    const { data, error } = await this.from('job_rule_templates')
      .update(templateUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as JobRuleTemplate;
  }

  async deleteJobRuleTemplate(id: string): Promise<void> {
    const { error } = await this.from('job_rule_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Job Rule Sets
  async getJobRuleSets(dto: GetJobRuleSetsDto): Promise<JobRuleSet[]> {
    let query = this.from('job_rule_sets')
      .select('*')
      .order('priority', { ascending: true });

    if (dto.template_id) {
      query = query.eq('template_id', dto.template_id);
    }
    if (dto.job_type_id) {
      query = query.eq('job_type_id', dto.job_type_id);
    }
    if (dto.area_id) {
      query = query.eq('area_id', dto.area_id);
    }
    if (dto.is_active !== undefined) {
      query = query.eq('is_active', dto.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as JobRuleSet[];
  }

  async getJobRuleSet(id: string): Promise<JobRuleSet | null> {
    const { data, error } = await this.from('job_rule_sets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as JobRuleSet) ?? null;
  }

  async createJobRuleSet(dto: CreateJobRuleSetDto): Promise<JobRuleSet> {
    const ruleSetPayload = {
      template_id: dto.template_id,
      job_type_id: dto.job_type_id,
      area_id: dto.area_id,
      required_skills: dto.required_skills,
      required_positions: dto.required_positions,
      min_staff_count: dto.min_staff_count,
      max_staff_count: dto.max_staff_count,
      priority: dto.priority,
      is_active: true,
    };

    const { data, error } = await this.from('job_rule_sets')
      .insert(ruleSetPayload)
      .select()
      .single();

    if (error) throw error;
    return data as JobRuleSet;
  }

  async updateJobRuleSet(dto: UpdateJobRuleSetDto): Promise<JobRuleSet> {
    const { id, ...updateData } = dto;
    const ruleSetUpdate = {
      required_skills: updateData.required_skills,
      required_positions: updateData.required_positions,
      min_staff_count: updateData.min_staff_count,
      max_staff_count: updateData.max_staff_count,
      priority: updateData.priority,
      is_active: updateData.is_active,
    };

    const { data, error } = await this.from('job_rule_sets')
      .update(ruleSetUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as JobRuleSet;
  }

  async deleteJobRuleSet(id: string): Promise<void> {
    const { error } = await this.from('job_rule_sets').delete().eq('id', id);
    if (error) throw error;
  }
}
