export const CheckInMethod = ['qr', 'manual'] as const;
export type CheckInMethod = (typeof CheckInMethod)[number];

export const CheckOutMethod = ['qr', 'manual', 'auto', 'forgot'] as const;
export type CheckOutMethod = (typeof CheckOutMethod)[number];

export interface CheckInResponseDTO {
  sessionId: string;
  studentName: string;
  seatNumber: string | null;
  membershipType: string;
  checkInAt: string;
  currentOccupancy: number;
}

export interface AttendanceSessionDTO {
  id: string;
  studentId: string;
  studentName: string;
  seatNumber: string | null;
  checkInAt: string;
  checkOutAt: string | null;
  durationMinutes: number | null;
  checkInMethod: 'qr' | 'manual';
  checkOutMethod: 'qr' | 'manual' | 'auto' | 'forgot' | null;
  isManualCorrection: boolean;
}

export interface QrCheckInBody {
  qrToken: string;
}

export interface ManualCheckInBody {
  studentId: string;
  seatId?: string;
}

export interface ManualCheckOutBody {
  studentId: string;
}

export interface QrCheckOutBody {
  qrToken: string;
}

export interface CorrectionBody {
  sessionId: string;
  checkInAt: string;
  checkOutAt: string;
  checkInMethod: 'qr' | 'manual';
  checkOutMethod: 'qr' | 'manual' | 'auto' | 'forgot';
  correctionReason: string;
}

export interface AttendanceListQuery {
  date?: string;
  studentId?: string;
  status?: 'active' | 'completed' | 'corrected';
  page: number;
  limit: number;
}

export function toCheckInResponseDTO(session: {
  id: string;
  studentName: string | null;
  seatNumber: string | null;
  membershipType: string | null;
  checkInAt: Date;
}, occupancy: { currentCount: number; capacity: number; availableFlexible: number }): CheckInResponseDTO {
  return {
    sessionId: session.id,
    studentName: session.studentName ?? '',
    seatNumber: session.seatNumber,
    membershipType: session.membershipType ?? '',
    checkInAt: session.checkInAt.toISOString(),
    currentOccupancy: occupancy.currentCount
  };
}

export function toAttendanceSessionDTO(session: {
  id: string;
  studentId: string;
  studentName?: string | null;
  seatNumber: string | null;
  checkInAt: Date;
  checkOutAt: Date | null;
  durationMinutes: number | null;
  checkInMethod: string;
  checkOutMethod: string | null;
  isManualCorrection?: boolean;
}): AttendanceSessionDTO {
  return {
    id: session.id,
    studentId: session.studentId,
    studentName: session.studentName ?? '',
    seatNumber: session.seatNumber ?? null,
    checkInAt: session.checkInAt.toISOString(),
    checkOutAt: session.checkOutAt?.toISOString() ?? null,
    durationMinutes: session.durationMinutes ?? null,
    checkInMethod: session.checkInMethod as 'qr' | 'manual',
    checkOutMethod: session.checkOutMethod as 'qr' | 'manual' | 'auto' | 'forgot' | null,
    isManualCorrection: session.isManualCorrection ?? false
  };
}