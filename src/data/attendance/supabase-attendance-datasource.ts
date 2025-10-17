import type {
  AttendanceRecord,
  AttendanceRequest,
  CreateAttendanceRecordDto,
  CreateAttendanceRequestDto,
  CreateShiftDto,
  CreateUserShiftDto,
  GetAttendanceRecordsDto,
  GetAttendanceRequestsDto,
  GetShiftsDto,
  GetUserShiftsDto,
  MonthlyAttendanceStats,
  Shift,
  UpdateAttendanceRecordDto,
  UpdateAttendanceRequestDto,
  UpdateShiftDto,
  UserShift,
} from '@/lib/dto/attendance.dto';
import type { SupabaseClient } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type { AttendanceDataSource } from './attendance-datasource';
import type {
  CurrentlyWorkingStaffQuery,
  CurrentlyWorkingStaffRecord,
} from './types';

export class SupabaseAttendanceDataSource implements AttendanceDataSource {
  constructor(private readonly client: SupabaseClient = supabase) {}

  private from(table: string) {
    return this.client.from(table);
  }

  async getAttendanceRecords(
    dto: GetAttendanceRecordsDto
  ): Promise<AttendanceRecord[]> {
    let query = this.from('attendance_records')
      .select('*')
      .order('date', { ascending: false });

    if (dto.user_id) {
      query = query.eq('user_id', dto.user_id);
    }
    if (dto.date) {
      query = query.eq('date', dto.date);
    }
    if (dto.start_date && dto.end_date) {
      query = query.gte('date', dto.start_date).lte('date', dto.end_date);
    }
    if (dto.status) {
      query = query.eq('status', dto.status);
    }
    if (dto.limit) {
      query = query.limit(dto.limit);
    }
    if (dto.offset) {
      query = query.range(dto.offset, dto.offset + (dto.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as AttendanceRecord[];
  }

  async getAttendanceRecord(id: string): Promise<AttendanceRecord | null> {
    const { data, error } = await this.from('attendance_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as AttendanceRecord) ?? null;
  }

  async createAttendanceRecord(
    dto: CreateAttendanceRecordDto
  ): Promise<AttendanceRecord> {
    const insertPayload = {
      user_id: dto.user_id,
      date: dto.date,
      shift_id: dto.shift_id ?? null,
      scheduled_start_time: dto.scheduled_start_time ?? null,
      scheduled_end_time: dto.scheduled_end_time ?? null,
      actual_start_time: dto.actual_start_time ?? null,
      actual_end_time: dto.actual_end_time ?? null,
      break_duration: dto.break_duration ?? 0,
      overtime_duration: dto.overtime_duration ?? 0,
      notes: dto.notes ?? null,
      status: 'pending',
    };

    const { data, error } = await this.from('attendance_records')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;
    return data as AttendanceRecord;
  }

  async updateAttendanceRecord(
    dto: UpdateAttendanceRecordDto
  ): Promise<AttendanceRecord> {
    const { id, ...updateData } = dto;
    const updatePayload = {
      actual_start_time: updateData.actual_start_time ?? null,
      actual_end_time: updateData.actual_end_time ?? null,
      break_duration: updateData.break_duration ?? 0,
      overtime_duration: updateData.overtime_duration ?? 0,
      status: updateData.status,
      notes: updateData.notes ?? null,
      approved_by: updateData.approved_by ?? null,
    };

    const { data, error } = await this.from('attendance_records')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AttendanceRecord;
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    const { error } = await this.from('attendance_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getAttendanceRequests(
    dto: GetAttendanceRequestsDto
  ): Promise<AttendanceRequest[]> {
    let query = this.from('attendance_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (dto.user_id) {
      query = query.eq('user_id', dto.user_id);
    }
    if (dto.type) {
      query = query.eq('type', dto.type);
    }
    if (dto.status) {
      query = query.eq('status', dto.status);
    }
    if (dto.limit) {
      query = query.limit(dto.limit);
    }
    if (dto.offset) {
      query = query.range(dto.offset, dto.offset + (dto.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as AttendanceRequest[];
  }

  async getAttendanceRequest(id: string): Promise<AttendanceRequest | null> {
    const { data, error } = await this.from('attendance_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as AttendanceRequest) ?? null;
  }

  async createAttendanceRequest(
    dto: CreateAttendanceRequestDto
  ): Promise<AttendanceRequest> {
    const requestPayload = {
      user_id: dto.user_id,
      type: dto.type,
      target_date: dto.target_date,
      original_start_time: dto.original_start_time ?? null,
      original_end_time: dto.original_end_time ?? null,
      requested_start_time: dto.requested_start_time ?? null,
      requested_end_time: dto.requested_end_time ?? null,
      reason: dto.reason ?? null,
      status: 'pending',
    };

    const { data, error } = await this.from('attendance_requests')
      .insert(requestPayload)
      .select()
      .single();

    if (error) throw error;
    return data as AttendanceRequest;
  }

  async updateAttendanceRequest(
    dto: UpdateAttendanceRequestDto
  ): Promise<AttendanceRequest> {
    const { id, ...updateData } = dto;

    const { data, error } = await this.from('attendance_requests')
      .update({
        status: updateData.status,
        reviewed_by: updateData.reviewed_by,
        review_notes: updateData.review_notes ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AttendanceRequest;
  }

  async deleteAttendanceRequest(id: string): Promise<void> {
    const { error } = await this.from('attendance_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getShifts(dto: GetShiftsDto): Promise<Shift[]> {
    let query = this.from('shifts')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('start_time', { ascending: true });

    if (dto.facility_id) {
      query = query.eq('facility_id', dto.facility_id);
    }
    if (dto.is_active !== undefined) {
      query = query.eq('is_active', dto.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Shift[];
  }

  async getShift(id: string): Promise<Shift | null> {
    const { data, error } = await this.from('shifts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return (data as Shift) ?? null;
  }

  async createShift(dto: CreateShiftDto): Promise<Shift> {
    const shiftPayload = {
      name: dto.name,
      start_time: dto.start_time,
      end_time: dto.end_time,
      break_duration: dto.break_duration ?? 0,
      facility_id: dto.facility_id,
      is_active: true,
      color_code: dto.color_code ?? null,
      description: dto.description ?? null,
      is_night_shift: dto.is_night_shift ?? false,
      sort_order: dto.sort_order ?? 0,
    };

    const { data, error } = await this.from('shifts')
      .insert(shiftPayload)
      .select()
      .single();

    if (error) throw error;
    return data as Shift;
  }

  async updateShift(dto: UpdateShiftDto): Promise<Shift> {
    const { id, ...updateData } = dto;
    const shiftUpdate = {
      name: updateData.name,
      start_time: updateData.start_time,
      end_time: updateData.end_time,
      break_duration: updateData.break_duration ?? 0,
      is_active: updateData.is_active,
      color_code: updateData.color_code ?? null,
      description: updateData.description ?? null,
      is_night_shift: updateData.is_night_shift ?? false,
      sort_order: updateData.sort_order ?? 0,
    };

    const { data, error } = await this.from('shifts')
      .update(shiftUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Shift;
  }

  async deleteShift(id: string): Promise<void> {
    const { error } = await this.from('shifts').delete().eq('id', id);

    if (error) throw error;
  }

  async getUserShifts(dto: GetUserShiftsDto): Promise<UserShift[]> {
    let query = this.from('user_shifts')
      .select('*')
      .order('date', { ascending: true });

    if (dto.user_id) {
      query = query.eq('user_id', dto.user_id);
    }
    if (dto.date) {
      query = query.eq('date', dto.date);
    }
    if (dto.start_date) {
      query = query.gte('date', dto.start_date);
    }
    if (dto.end_date) {
      query = query.lte('date', dto.end_date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as UserShift[];
  }

  async createUserShift(dto: CreateUserShiftDto): Promise<UserShift> {
    const userShiftPayload = {
      user_id: dto.user_id,
      shift_id: dto.shift_id,
      date: dto.date,
      is_working: dto.is_working ?? true,
    };

    const { data, error } = await this.from('user_shifts')
      .insert(userShiftPayload)
      .select()
      .single();

    if (error) throw error;
    return data as UserShift;
  }

  async getMonthlyAttendanceStats(
    userId: string,
    year: number,
    month: number
  ): Promise<MonthlyAttendanceStats> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: records, error: recordsError } = await this.from(
      'attendance_records'
    )
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (recordsError) throw recordsError;

    const { data: shifts, error: shiftError } = await this.from('user_shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_working', true)
      .gte('date', startDate)
      .lte('date', endDate);

    if (shiftError) throw shiftError;

    const totalWorkHours =
      (records as AttendanceRecord[] | null)?.reduce((sum, record) => {
        if (record.actual_start_time && record.actual_end_time) {
          const start = new Date(`2000-01-01T${record.actual_start_time}`);
          const end = new Date(`2000-01-01T${record.actual_end_time}`);
          const workMinutes =
            (end.getTime() - start.getTime()) / (1000 * 60) -
            (record.break_duration ?? 0);
          return sum + Math.max(0, workMinutes / 60);
        }
        return sum;
      }, 0) || 0;

    const totalOvertimeHours =
      (records as AttendanceRecord[] | null)?.reduce((sum, record) => {
        return sum + (record.overtime_duration ?? 0) / 60;
      }, 0) || 0;
    const workDays = records?.length || 0;
    const absentDays = (shifts?.length || 0) - workDays;
    const lateCount =
      (records as AttendanceRecord[] | null)?.filter(record => {
        if (record.scheduled_start_time && record.actual_start_time) {
          const scheduled = new Date(
            `2000-01-01T${record.scheduled_start_time}`
          );
          const actual = new Date(`2000-01-01T${record.actual_start_time}`);
          return actual > scheduled;
        }
        return false;
      }).length || 0;

    return {
      user_id: userId,
      year,
      month,
      total_work_hours: Math.round(totalWorkHours * 100) / 100,
      total_overtime_hours: Math.round(totalOvertimeHours * 100) / 100,
      work_days: workDays,
      absent_days: Math.max(0, absentDays),
      late_count: lateCount,
      early_leave_count: 0,
      remaining_paid_leave: 20,
    };
  }

  async getCurrentlyWorkingStaff(
    queryDto: CurrentlyWorkingStaffQuery
  ): Promise<CurrentlyWorkingStaffRecord[]> {
    let query = this.from('facility_currently_working_staff')
      .select('*')
      .order('actual_start_time', { ascending: true });

    if (queryDto.facilityId) {
      query = query.eq('facility_id', queryDto.facilityId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []) as Array<Record<string, unknown>>;

    return rows.map(record => ({
      attendanceRecordId: record.attendance_record_id as string,
      userId: record.user_id as string,
      name: (record.name as string) ?? '',
      position: (record.role as string) ?? '',
      facilityId: (record.facility_id as string) ?? null,
      shiftName: (record.shift_name as string) ?? '未設定',
      shiftStart: (record.shift_start_time as string) ?? null,
      shiftEnd: (record.shift_end_time as string) ?? null,
      clockInTime: (record.actual_start_time as string) ?? '',
      scheduledEnd:
        (record.scheduled_end_time as string) ??
        (record.shift_end_time as string) ??
        null,
      workingHours: this.calculateWorkingHours(
        (record.actual_start_time as string) ?? ''
      ),
      status: 'working',
    }));
  }

  private calculateWorkingHours(startTime: string): string {
    if (!startTime) return '0時間0分';

    const start = new Date(`2000-01-01T${startTime}`);
    const now = new Date();
    const current = new Date(`2000-01-01T${now.toTimeString().slice(0, 8)}`);

    const diffMinutes = (current.getTime() - start.getTime()) / (1000 * 60);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.floor(diffMinutes % 60);

    return `${hours}時間${minutes}分`;
  }
}
