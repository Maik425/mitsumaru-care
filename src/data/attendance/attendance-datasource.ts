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
import type {
  CurrentlyWorkingStaffQuery,
  CurrentlyWorkingStaffRecord,
} from './types';

export interface AttendanceDataSource {
  getAttendanceRecords(
    dto: GetAttendanceRecordsDto
  ): Promise<AttendanceRecord[]>;
  getAttendanceRecord(id: string): Promise<AttendanceRecord | null>;
  createAttendanceRecord(
    dto: CreateAttendanceRecordDto
  ): Promise<AttendanceRecord>;
  updateAttendanceRecord(
    dto: UpdateAttendanceRecordDto
  ): Promise<AttendanceRecord>;
  deleteAttendanceRecord(id: string): Promise<void>;

  getAttendanceRequests(
    dto: GetAttendanceRequestsDto
  ): Promise<AttendanceRequest[]>;
  getAttendanceRequest(id: string): Promise<AttendanceRequest | null>;
  createAttendanceRequest(
    dto: CreateAttendanceRequestDto
  ): Promise<AttendanceRequest>;
  updateAttendanceRequest(
    dto: UpdateAttendanceRequestDto
  ): Promise<AttendanceRequest>;
  deleteAttendanceRequest(id: string): Promise<void>;

  getShifts(dto: GetShiftsDto): Promise<Shift[]>;
  getShift(id: string): Promise<Shift | null>;
  createShift(dto: CreateShiftDto): Promise<Shift>;
  updateShift(dto: UpdateShiftDto): Promise<Shift>;
  deleteShift(id: string): Promise<void>;

  getUserShifts(dto: GetUserShiftsDto): Promise<UserShift[]>;
  createUserShift(dto: CreateUserShiftDto): Promise<UserShift>;

  getMonthlyAttendanceStats(
    userId: string,
    year: number,
    month: number
  ): Promise<MonthlyAttendanceStats>;

  getCurrentlyWorkingStaff(
    query: CurrentlyWorkingStaffQuery
  ): Promise<CurrentlyWorkingStaffRecord[]>;
}
