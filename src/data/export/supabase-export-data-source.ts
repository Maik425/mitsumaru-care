// Supabaseエクスポートデータソース実装

import {
  AttendanceExportData,
  ExportHistory,
  ExportRequest,
  ExportSettings,
  ExportTemplate,
  FacilityExportData,
  UserExportData,
} from '@/lib/dto/export';
import { supabase } from '@/lib/supabase';
// ExportDataSourceインターフェースを直接定義
interface ExportDataSource {
  // エクスポート履歴管理
  getExportHistory(
    userId?: string,
    limit?: number,
    offset?: number
  ): Promise<ExportHistory[]>;
  getExportHistoryById(id: string): Promise<ExportHistory | null>;
  createExportHistory(
    history: Omit<ExportHistory, 'id' | 'created_at'>
  ): Promise<ExportHistory>;
  updateExportHistory(
    id: string,
    updates: Partial<ExportHistory>
  ): Promise<ExportHistory>;
  deleteExportHistory(id: string): Promise<void>;

  // エクスポート設定管理
  getExportSettings(userId: string): Promise<ExportSettings | null>;
  createExportSettings(
    settings: Omit<ExportSettings, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExportSettings>;
  updateExportSettings(
    userId: string,
    updates: Partial<ExportSettings>
  ): Promise<ExportSettings>;
  deleteExportSettings(userId: string): Promise<void>;

  // エクスポートテンプレート管理
  getExportTemplates(userId?: string): Promise<ExportTemplate[]>;
  getExportTemplateById(id: string): Promise<ExportTemplate | null>;
  createExportTemplate(
    template: Omit<ExportTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExportTemplate>;
  updateExportTemplate(
    id: string,
    updates: Partial<ExportTemplate>
  ): Promise<ExportTemplate>;
  deleteExportTemplate(id: string): Promise<void>;

  // データ取得
  getAttendanceData(conditions?: any): Promise<AttendanceExportData[]>;
  getUserData(conditions?: any): Promise<UserExportData[]>;
  getFacilityData(conditions?: any): Promise<FacilityExportData[]>;
  getExportDataByType(type: string, conditions?: any): Promise<any[]>;
}

export class SupabaseExportDataSource implements ExportDataSource {
  // エクスポート履歴管理
  async getExportHistory(
    userId?: string,
    limit = 50,
    offset = 0
  ): Promise<ExportHistory[]> {
    let query = supabase
      .from('export_history')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getExportHistoryById(id: string): Promise<ExportHistory | null> {
    const { data, error } = await supabase
      .from('export_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createExportHistory(
    history: Omit<ExportHistory, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExportHistory> {
    const { data, error } = await supabase
      .from('export_history')
      .insert(history as any)
      .select()
      .single();

    if (error) throw error;
    return data as ExportHistory;
  }

  async updateExportHistory(
    id: string,
    updates: Partial<ExportHistory>
  ): Promise<ExportHistory> {
    const { data, error } = await (supabase as any)
      .from('export_history')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExportHistory;
  }

  async deleteExportHistory(id: string): Promise<void> {
    const { error } = await supabase
      .from('export_history')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_download_count', {
      export_id: id,
    } as any);

    if (error) throw error;
  }

  // エクスポート設定管理
  async getExportSettings(userId: string): Promise<ExportSettings | null> {
    const { data, error } = await supabase
      .from('export_settings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.[0] || null;
  }

  async getExportSettingsById(id: string): Promise<ExportSettings | null> {
    const { data, error } = await supabase
      .from('export_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createExportSettings(
    settings: Omit<ExportSettings, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExportSettings> {
    const { data, error } = await supabase
      .from('export_settings')
      .insert(settings as any)
      .select()
      .single();

    if (error) throw error;
    return data as ExportSettings;
  }

  async updateExportSettings(
    id: string,
    updates: Partial<ExportSettings>
  ): Promise<ExportSettings> {
    const { data, error } = await (supabase as any)
      .from('export_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExportSettings;
  }

  async deleteExportSettings(id: string): Promise<void> {
    const { error } = await supabase
      .from('export_settings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // エクスポートテンプレート管理
  async getExportTemplates(templateType?: string): Promise<ExportTemplate[]> {
    let query = supabase
      .from('export_templates')
      .select('*')
      .eq('is_active', true)
      .order('template_name');

    if (templateType) {
      query = query.eq('template_type', templateType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getExportTemplateById(id: string): Promise<ExportTemplate | null> {
    const { data, error } = await supabase
      .from('export_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createExportTemplate(
    template: Omit<ExportTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ExportTemplate> {
    const { data, error } = await supabase
      .from('export_templates')
      .insert(template as any)
      .select()
      .single();

    if (error) throw error;
    return data as ExportTemplate;
  }

  async updateExportTemplate(
    id: string,
    updates: Partial<ExportTemplate>
  ): Promise<ExportTemplate> {
    const { data, error } = await (supabase as any)
      .from('export_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExportTemplate;
  }

  async deleteExportTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('export_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // エクスポートタイプ別データ取得
  async getExportDataByType(
    exportType: string,
    conditions: ExportRequest['export_conditions']
  ): Promise<AttendanceExportData[] | UserExportData[] | FacilityExportData[]> {
    switch (exportType) {
      case 'attendance':
        return this.getAttendanceData(conditions);
      case 'users':
        return this.getUserData(conditions);
      case 'facilities':
        return this.getFacilityData(conditions);
      default:
        throw new Error(`Unsupported export type: ${exportType}`);
    }
  }

  // データ取得
  async getAttendanceData(
    conditions: ExportRequest['export_conditions']
  ): Promise<AttendanceExportData[]> {
    let query = supabase.from('attendance_records').select(`
        *,
        users!attendance_records_user_id_fkey(name, facilities(name)),
        shifts(name, start_time, end_time)
      `);

    if (conditions.start_date) {
      query = query.gte('date', conditions.start_date);
    }
    if (conditions.end_date) {
      query = query.lte('date', conditions.end_date);
    }
    if (conditions.facility_id) {
      query = query.eq('users.facility_id', conditions.facility_id);
    }
    if (conditions.user_id) {
      query = query.eq('user_id', conditions.user_id);
    }
    if (conditions.status) {
      query = query.eq('status', conditions.status);
    }

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;

    return (data || []).map((record: any) => ({
      user_name: record.users?.name || '',
      facility_name: record.users?.facilities?.name || '',
      date: record.date,
      scheduled_start_time: record.scheduled_start_time || '',
      scheduled_end_time: record.scheduled_end_time || '',
      actual_start_time: record.actual_start_time || '',
      actual_end_time: record.actual_end_time || '',
      break_duration: record.break_duration || 0,
      overtime_duration: record.overtime_duration || 0,
      status: record.status,
      notes: record.notes || '',
    }));
  }

  async getUserData(
    conditions: ExportRequest['export_conditions']
  ): Promise<UserExportData[]> {
    let query = supabase.from('users').select(`
        *,
        facilities(name)
      `);

    if (conditions.facility_id) {
      query = query.eq('facility_id', conditions.facility_id);
    }
    if (conditions.user_id) {
      query = query.eq('id', conditions.user_id);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });
    if (error) throw error;

    return (data || []).map((user: any) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      facility_name: user.facilities?.name || '',
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }

  async getFacilityData(
    conditions: ExportRequest['export_conditions']
  ): Promise<FacilityExportData[]> {
    let query = supabase.from('facilities').select(`
        *,
        users(count)
      `);

    if (conditions.facility_id) {
      query = query.eq('id', conditions.facility_id);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });
    if (error) throw error;

    return (data || []).map((facility: any) => ({
      name: facility.name,
      address: facility.address || '',
      phone: facility.phone || '',
      email: facility.email || '',
      user_count: facility.users?.[0]?.count || 0,
      created_at: facility.created_at,
      updated_at: facility.updated_at,
    }));
  }
}
