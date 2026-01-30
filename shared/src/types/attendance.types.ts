/**
 * ========================================
 * ATTENDANCE - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/attendance.types.ts
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface CheckInRequestDto {
  employeeId: string;
}

export interface CheckOutRequestDto {
  employeeId: string;
}

export interface GetAttendanceQueryDto {
  month?: number;
  year?: number;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface AttendanceDto {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  workHours: number | null;
  status: string;
  lateBy: number | null;
  earlyLeave: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceWithEmployeeDto extends AttendanceDto {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    department: any;
  };
}

export interface MyAttendanceResponseDto {
  attendances: AttendanceDto[];
  stats: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    totalWorkHours: number;
  };
}
