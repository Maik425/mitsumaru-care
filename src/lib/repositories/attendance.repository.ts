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
import { supabase } from '@/lib/supabase';

export class AttendanceRepository {
  constructor(private supabaseClient = supabase) {}

  // 勤怠記録関連
  async getAttendanceRecords(
    dto: GetAttendanceRecordsDto
  ): Promise<AttendanceRecord[]> {
    let query = this.supabaseClient
      .from('attendance_records')
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
    return data || [];
  }

  async getAttendanceRecord(id: string): Promise<AttendanceRecord | null> {
    const { data, error } = await this.supabaseClient
      .from('attendance_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createAttendanceRecord(
    dto: CreateAttendanceRecordDto
  ): Promise<AttendanceRecord> {
    const { data, error } = await this.supabaseClient
      .from('attendance_records')
      .insert(dto as any)
      .select()
      .single();

    if (error) throw error;
    return data as AttendanceRecord;
  }

  async updateAttendanceRecord(
    dto: UpdateAttendanceRecordDto
  ): Promise<AttendanceRecord> {
    const { id, ...updateData } = dto;
    const { data, error } = await (this.supabaseClient as any)
      .from('attendance_records')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      throw new Error(`Attendance record with id ${id} not found`);
    }

    return data[0] as AttendanceRecord;
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('attendance_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // 勤怠申請関連
  async getAttendanceRequests(
    dto: GetAttendanceRequestsDto
  ): Promise<AttendanceRequest[]> {
    let query = this.supabaseClient
      .from('attendance_requests')
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
    return data || [];
  }

  async getAttendanceRequest(id: string): Promise<AttendanceRequest | null> {
    const { data, error } = await this.supabaseClient
      .from('attendance_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createAttendanceRequest(
    dto: CreateAttendanceRequestDto
  ): Promise<AttendanceRequest> {
    const { data, error } = await this.supabaseClient
      .from('attendance_requests')
      .insert(dto as any)
      .select()
      .single();

    if (error) throw error;
    return data as AttendanceRequest;
  }

  async updateAttendanceRequest(
    dto: UpdateAttendanceRequestDto
  ): Promise<AttendanceRequest> {
    const { id, ...updateData } = dto;
    const { data, error } = await (this.supabaseClient as any)
      .from('attendance_requests')
      .update({
        ...updateData,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AttendanceRequest;
  }

  async deleteAttendanceRequest(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('attendance_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // シフト関連
  async getShifts(dto: GetShiftsDto): Promise<Shift[]> {
    let query = supabase
      .from('shifts')
      .select('*')
      .order('start_time', { ascending: true });

    if (dto.facility_id) {
      query = query.eq('facility_id', dto.facility_id);
    }
    if (dto.is_active !== undefined) {
      query = query.eq('is_active', dto.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getShift(id: string): Promise<Shift | null> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createShift(dto: CreateShiftDto): Promise<Shift> {
    const { data, error } = await supabase
      .from('shifts')
      .insert(dto as any)
      .select()
      .single();

    if (error) throw error;
    return data as Shift;
  }

  async updateShift(dto: UpdateShiftDto): Promise<Shift> {
    const { id, ...updateData } = dto;
    const { data, error } = await (supabase as any)
      .from('shifts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Shift;
  }

  async deleteShift(id: string): Promise<void> {
    const { error } = await supabase.from('shifts').delete().eq('id', id);

    if (error) throw error;
  }

  // ユーザーシフト関連
  async getUserShifts(dto: GetUserShiftsDto): Promise<UserShift[]> {
    let query = supabase
      .from('user_shifts')
      .select('*')
      .order('date', { ascending: true });

    if (dto.user_id) {
      query = query.eq('user_id', dto.user_id);
    }
    if (dto.date) {
      query = query.eq('date', dto.date);
    }
    if (dto.start_date && dto.end_date) {
      query = query.gte('date', dto.start_date).lte('date', dto.end_date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createUserShift(dto: CreateUserShiftDto): Promise<UserShift> {
    const { data, error } = await supabase
      .from('user_shifts')
      .insert(dto as any)
      .select()
      .single();

    if (error) throw error;
    return data as UserShift;
  }

  async updateUserShift(id: string, is_working: boolean): Promise<UserShift> {
    const { data, error } = await (supabase as any)
      .from('user_shifts')
      .update({ is_working })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as UserShift;
  }

  async deleteUserShift(id: string): Promise<void> {
    const { error } = await supabase.from('user_shifts').delete().eq('id', id);

    if (error) throw error;
  }

  // 統計関連
  async getMonthlyAttendanceStats(
    userId: string,
    year: number,
    month: number
  ): Promise<MonthlyAttendanceStats | null> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // 月末日

    // 勤怠記録を取得
    const { data: records, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    // シフト割り当てを取得
    const { data: shifts, error: shiftError } = await supabase
      .from('user_shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_working', true)
      .gte('date', startDate)
      .lte('date', endDate);

    if (shiftError) throw shiftError;

    // 統計計算
    const totalWorkHours =
      records?.reduce((sum: number, record: any) => {
        if (record.actual_start_time && record.actual_end_time) {
          const start = new Date(`2000-01-01T${record.actual_start_time}`);
          const end = new Date(`2000-01-01T${record.actual_end_time}`);
          const workMinutes =
            (end.getTime() - start.getTime()) / (1000 * 60) -
            record.break_duration;
          return sum + Math.max(0, workMinutes / 60);
        }
        return sum;
      }, 0) || 0;

    const totalOvertimeHours =
      records?.reduce(
        (sum: number, record: any) => sum + record.overtime_duration / 60,
        0
      ) || 0;
    const workDays = records?.length || 0;
    const absentDays = (shifts?.length || 0) - workDays;
    const lateCount =
      records?.filter((record: any) => {
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
      early_leave_count: 0, // 実装が必要
      remaining_paid_leave: 20, // 固定値、実装が必要
    };
  }

  // 現在勤務中の職員一覧
  async getCurrentlyWorkingStaff(facilityId?: string): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
      .from('attendance_records')
      .select(
        `
        *,
        users!inner(name, role, facility_id),
        shifts(name, start_time, end_time)
      `
      )
      .eq('date', today)
      .is('actual_end_time', null)
      .not('actual_start_time', 'is', null);

    if (facilityId) {
      query = query.eq('users.facility_id', facilityId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (
      data?.map((record: any) => ({
        id: record.user_id,
        name: record.users.name,
        position: record.users.role,
        shift: record.shifts?.name || '未設定',
        clockInTime: record.actual_start_time,
        scheduledEnd: record.scheduled_end_time || record.shifts?.end_time,
        workingHours: this.calculateWorkingHours(record.actual_start_time),
        status: 'working',
      })) || []
    );
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
