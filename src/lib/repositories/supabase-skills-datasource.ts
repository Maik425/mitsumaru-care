import type {
  CreateSkillDto,
  CreateUserSkillDto,
  GetSkillsDto,
  GetUserSkillsDto,
  Skill,
  UpdateSkillDto,
  UpdateUserSkillDto,
  UserSkill,
} from '@/lib/dto/skills.dto';
import type { SupabaseClient } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type { SkillsDataSource } from './skills-datasource';

export class SupabaseSkillsDataSource implements SkillsDataSource {
  constructor(private readonly client: SupabaseClient = supabase) {}

  private from(table: string) {
    return this.client.from(table);
  }

  async getSkills(dto: GetSkillsDto): Promise<Skill[]> {
    let query = this.from('skills')
      .select('*')
      .order('name', { ascending: true });

    if (dto.facility_id) {
      query = query.eq('facility_id', dto.facility_id);
    }
    if (dto.category) {
      query = query.eq('category', dto.category);
    }
    if (dto.is_active !== undefined) {
      query = query.eq('is_active', dto.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Skill[];
  }

  async getSkill(id: string): Promise<Skill | null> {
    const { data, error } = await this.from('skills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as Skill) ?? null;
  }

  async createSkill(dto: CreateSkillDto): Promise<Skill> {
    const skillPayload = {
      name: dto.name,
      category: dto.category,
      level: dto.level,
      description: dto.description ?? null,
      facility_id: dto.facility_id,
      is_active: true,
    };

    const { data, error } = await this.from('skills')
      .insert(skillPayload)
      .select()
      .single();

    if (error) throw error;
    return data as Skill;
  }

  async updateSkill(dto: UpdateSkillDto): Promise<Skill> {
    const { id, ...updateData } = dto;
    const skillUpdate = {
      name: updateData.name,
      category: updateData.category,
      level: updateData.level,
      description: updateData.description ?? null,
      is_active: updateData.is_active,
    };

    const { data, error } = await this.from('skills')
      .update(skillUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Skill;
  }

  async deleteSkill(id: string): Promise<void> {
    const { error } = await this.from('skills').delete().eq('id', id);
    if (error) throw error;
  }

  async getUserSkills(dto: GetUserSkillsDto): Promise<UserSkill[]> {
    let query = this.from('user_skills')
      .select('*')
      .order('last_updated', { ascending: false });

    if (dto.user_id) {
      query = query.eq('user_id', dto.user_id);
    }
    if (dto.skill_id) {
      query = query.eq('skill_id', dto.skill_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as UserSkill[];
  }

  async createUserSkill(dto: CreateUserSkillDto): Promise<UserSkill> {
    const userSkillPayload = {
      user_id: dto.user_id,
      skill_id: dto.skill_id,
      level: dto.level,
      experience_years: dto.experience_years,
      certified: dto.certified,
      last_updated: new Date().toISOString(),
    };

    const { data, error } = await this.from('user_skills')
      .insert(userSkillPayload)
      .select()
      .single();

    if (error) throw error;
    return data as UserSkill;
  }

  async updateUserSkill(dto: UpdateUserSkillDto): Promise<UserSkill> {
    const { id, ...updateData } = dto;
    const userSkillUpdate = {
      level: updateData.level,
      experience_years: updateData.experience_years,
      certified: updateData.certified,
      last_updated: new Date().toISOString(),
    };

    const { data, error } = await this.from('user_skills')
      .update(userSkillUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as UserSkill;
  }

  async deleteUserSkill(id: string): Promise<void> {
    const { error } = await this.from('user_skills').delete().eq('id', id);
    if (error) throw error;
  }
}
