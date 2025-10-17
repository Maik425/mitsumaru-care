import type {
  CreatePositionDto,
  CreateUserPositionDto,
  GetPositionsDto,
  GetUserPositionsDto,
  Position,
  UpdatePositionDto,
  UserPosition,
} from '@/lib/dto/positions.dto';
import type { SupabaseClient } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type { PositionsDataSource } from './positions-datasource';

export class SupabasePositionsDataSource implements PositionsDataSource {
  constructor(private readonly client: SupabaseClient = supabase) {}

  private from(table: string) {
    return this.client.from(table);
  }

  async getPositions(dto: GetPositionsDto): Promise<Position[]> {
    let query = this.from('positions')
      .select('*')
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (dto.facility_id) {
      query = query.eq('facility_id', dto.facility_id);
    }
    if (dto.is_active !== undefined) {
      query = query.eq('is_active', dto.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Position[];
  }

  async getPosition(id: string): Promise<Position | null> {
    const { data, error } = await this.from('positions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as Position) ?? null;
  }

  async createPosition(dto: CreatePositionDto): Promise<Position> {
    const positionPayload = {
      name: dto.name,
      description: dto.description ?? null,
      level: dto.level,
      color_code: dto.color_code ?? null,
      facility_id: dto.facility_id,
      is_active: true,
    };

    const { data, error } = await this.from('positions')
      .insert(positionPayload)
      .select()
      .single();

    if (error) throw error;
    return data as Position;
  }

  async updatePosition(dto: UpdatePositionDto): Promise<Position> {
    const { id, ...updateData } = dto;
    const positionUpdate = {
      name: updateData.name,
      description: updateData.description ?? null,
      level: updateData.level,
      color_code: updateData.color_code ?? null,
      is_active: updateData.is_active,
    };

    const { data, error } = await this.from('positions')
      .update(positionUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Position;
  }

  async deletePosition(id: string): Promise<void> {
    const { error } = await this.from('positions').delete().eq('id', id);
    if (error) throw error;
  }

  async getUserPositions(dto: GetUserPositionsDto): Promise<UserPosition[]> {
    let query = this.from('user_positions')
      .select('*')
      .order('assigned_at', { ascending: false });

    if (dto.user_id) {
      query = query.eq('user_id', dto.user_id);
    }
    if (dto.position_id) {
      query = query.eq('position_id', dto.position_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as UserPosition[];
  }

  async createUserPosition(dto: CreateUserPositionDto): Promise<UserPosition> {
    const userPositionPayload = {
      user_id: dto.user_id,
      position_id: dto.position_id,
      assigned_by: dto.assigned_by,
      assigned_at: new Date().toISOString(),
    };

    const { data, error } = await this.from('user_positions')
      .insert(userPositionPayload)
      .select()
      .single();

    if (error) throw error;
    return data as UserPosition;
  }

  async deleteUserPosition(id: string): Promise<void> {
    const { error } = await this.from('user_positions').delete().eq('id', id);
    if (error) throw error;
  }
}
