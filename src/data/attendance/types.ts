export interface CurrentlyWorkingStaffRecord {
  attendanceRecordId: string;
  userId: string;
  name: string;
  position: string;
  facilityId: string | null;
  shiftName: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  clockInTime: string;
  scheduledEnd: string | null;
  workingHours: string;
  status: 'working' | 'break' | 'inactive';
}

export interface CurrentlyWorkingStaffQuery {
  facilityId?: string;
}
