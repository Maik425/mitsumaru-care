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

import type { AttendanceDataSource } from './attendance-datasource';

export class AttendanceRepository {
  constructor(private readonly dataSource: AttendanceDataSource) {}

  getAttendanceRecords(
    dto: GetAttendanceRecordsDto
  ): Promise<AttendanceRecord[]> {
    return this.dataSource.getAttendanceRecords(dto);
  }

  getAttendanceRecord(id: string): Promise<AttendanceRecord | null> {
    return this.dataSource.getAttendanceRecord(id);
  }

  createAttendanceRecord(
    dto: CreateAttendanceRecordDto
  ): Promise<AttendanceRecord> {
    return this.dataSource.createAttendanceRecord(dto);
  }

  updateAttendanceRecord(
    dto: UpdateAttendanceRecordDto
  ): Promise<AttendanceRecord> {
    return this.dataSource.updateAttendanceRecord(dto);
  }

  deleteAttendanceRecord(id: string): Promise<void> {
    return this.dataSource.deleteAttendanceRecord(id);
  }

  getAttendanceRequests(
    dto: GetAttendanceRequestsDto
  ): Promise<AttendanceRequest[]> {
    return this.dataSource.getAttendanceRequests(dto);
  }

  getAttendanceRequest(id: string): Promise<AttendanceRequest | null> {
    return this.dataSource.getAttendanceRequest(id);
  }

  createAttendanceRequest(
    dto: CreateAttendanceRequestDto
  ): Promise<AttendanceRequest> {
    return this.dataSource.createAttendanceRequest(dto);
  }

  updateAttendanceRequest(
    dto: UpdateAttendanceRequestDto
  ): Promise<AttendanceRequest> {
    return this.dataSource.updateAttendanceRequest(dto);
  }

  deleteAttendanceRequest(id: string): Promise<void> {
    return this.dataSource.deleteAttendanceRequest(id);
  }

  getShifts(dto: GetShiftsDto): Promise<Shift[]> {
    return this.dataSource.getShifts(dto);
  }

  getShift(id: string): Promise<Shift | null> {
    return this.dataSource.getShift(id);
  }

  createShift(dto: CreateShiftDto): Promise<Shift> {
    return this.dataSource.createShift(dto);
  }

  updateShift(dto: UpdateShiftDto): Promise<Shift> {
    return this.dataSource.updateShift(dto);
  }

  deleteShift(id: string): Promise<void> {
    return this.dataSource.deleteShift(id);
  }

  getUserShifts(dto: GetUserShiftsDto): Promise<UserShift[]> {
    return this.dataSource.getUserShifts(dto);
  }

  createUserShift(dto: CreateUserShiftDto): Promise<UserShift> {
    return this.dataSource.createUserShift(dto);
  }

  getMonthlyAttendanceStats(
    userId: string,
    year: number,
    month: number
  ): Promise<MonthlyAttendanceStats> {
    return this.dataSource.getMonthlyAttendanceStats(userId, year, month);
  }

  getCurrentlyWorkingStaff(
    query: CurrentlyWorkingStaffQuery
  ): Promise<CurrentlyWorkingStaffRecord[]> {
    return this.dataSource.getCurrentlyWorkingStaff(query);
  }
}
