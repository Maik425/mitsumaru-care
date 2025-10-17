// 勤怠管理用のDTO型定義

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  shift_id?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  break_duration: number;
  overtime_duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'correction_requested';
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRequest {
  id: string;
  user_id: string;
  type: 'clock_correction' | 'overtime' | 'work_time_change';
  target_date: string;
  original_start_time?: string;
  original_end_time?: string;
  requested_start_time?: string;
  requested_end_time?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  facility_id: string;
  is_active: boolean;
  // Extensions
  color_code?: string;
  description?: string;
  is_night_shift?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface UserShift {
  id: string;
  user_id: string;
  shift_id: string;
  date: string;
  is_working: boolean;
  created_at: string;
  updated_at: string;
}

// 入力用DTO
export interface CreateAttendanceRecordDto {
  user_id: string;
  date: string;
  shift_id?: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  break_duration?: number;
  overtime_duration?: number;
  notes?: string;
}

export interface UpdateAttendanceRecordDto {
  id: string;
  actual_start_time?: string;
  actual_end_time?: string;
  break_duration?: number;
  overtime_duration?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'correction_requested';
  notes?: string;
  approved_by?: string;
}

export interface CreateAttendanceRequestDto {
  user_id: string;
  type: 'clock_correction' | 'overtime' | 'work_time_change';
  target_date: string;
  original_start_time?: string;
  original_end_time?: string;
  requested_start_time?: string;
  requested_end_time?: string;
  reason: string;
}

export interface UpdateAttendanceRequestDto {
  id: string;
  status: 'approved' | 'rejected';
  reviewed_by: string;
  review_notes?: string;
}

export interface GetAttendanceRecordsDto {
  user_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'correction_requested';
  limit?: number;
  offset?: number;
}

export interface GetAttendanceRequestsDto {
  user_id?: string;
  type?: 'clock_correction' | 'overtime' | 'work_time_change';
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
}

export interface GetShiftsDto {
  facility_id?: string;
  is_active?: boolean;
}

export interface CreateShiftDto {
  name: string;
  start_time: string;
  end_time: string;
  break_duration?: number;
  facility_id: string;
  color_code?: string;
  description?: string;
  is_night_shift?: boolean;
  sort_order?: number;
}

export interface UpdateShiftDto {
  id: string;
  name?: string;
  start_time?: string;
  end_time?: string;
  break_duration?: number;
  is_active?: boolean;
  color_code?: string;
  description?: string;
  is_night_shift?: boolean;
  sort_order?: number;
}

export interface CreateUserShiftDto {
  user_id: string;
  shift_id: string;
  date: string;
  is_working?: boolean;
}

export interface GetUserShiftsDto {
  user_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
}

// 統計用DTO
export interface AttendanceStats {
  total_work_hours: number;
  total_overtime_hours: number;
  work_days: number;
  absent_days: number;
  late_count: number;
  early_leave_count: number;
}

export interface MonthlyAttendanceStats {
  user_id: string;
  year: number;
  month: number;
  total_work_hours: number;
  total_overtime_hours: number;
  work_days: number;
  absent_days: number;
  late_count: number;
  early_leave_count: number;
  remaining_paid_leave: number;
}
