import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { type CheckInResponseDTO, type AttendanceSessionDTO } from '../../shared/dto/attendance.dto.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type { QrCheckInBody } from '../../shared/dto/attendance.dto.js';
type Database = NodePgDatabase<typeof schema>;
export interface QrCheckInResult {
    success: true;
    data: CheckInResponseDTO;
}
export interface QrCheckOutResult {
    success: true;
    data: AttendanceSessionDTO;
}
export interface ManualCheckInResult {
    success: true;
    data: AttendanceSessionDTO;
}
export interface ManualCheckOutResult {
    success: true;
    data: AttendanceSessionDTO;
}
export interface CorrectionResult {
    success: true;
    data: AttendanceSessionDTO;
}
export declare class AttendanceService {
    private readonly db;
    private readonly attendanceRepository;
    private readonly auditLogRepository;
    constructor(db: Database);
    qrCheckIn(body: QrCheckInBody, libraryId: string, ipAddress?: string): Promise<QrCheckInResult>;
    qrCheckOut(body: {
        qrToken: string;
    }, libraryId: string, ipAddress?: string): Promise<{
        success: true;
        data: AttendanceSessionDTO;
    }>;
    manualCheckIn(body: {
        studentId: string;
        seatId?: string;
    }, ctx: RequestContext, ipAddress?: string): Promise<{
        success: true;
        data: AttendanceSessionDTO;
    }>;
    manualCheckOut(body: {
        studentId: string;
    }, ctx: RequestContext, ipAddress?: string): Promise<{
        success: true;
        data: AttendanceSessionDTO;
    }>;
    correctSession(body: {
        sessionId: string;
        checkInAt: string;
        checkOutAt: string;
        checkInMethod: 'qr' | 'manual';
        checkOutMethod: 'qr' | 'manual' | 'auto' | 'forgot';
        correctionReason: string;
    }, ctx: RequestContext, ipAddress?: string): Promise<{
        success: true;
        data: AttendanceSessionDTO;
    }>;
    listSessions(query: {
        date?: string;
        studentId?: string;
        status?: 'active' | 'completed' | 'corrected';
        page: number;
        limit: number;
    }, libraryId: string): Promise<{
        data: AttendanceSessionDTO[];
        total: number;
    }>;
    getLiveOccupancy(libraryId: string): Promise<{
        currentCount: number;
        capacity: number;
        availableFlexible: number;
    }>;
}
export {};
