import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { attendanceSessions } from '../../db/schema/attendance-sessions.js';
export type Database = NodePgDatabase<typeof schema>;
export interface OpenSession {
    id: string;
    studentId: string;
    membershipId: string | null;
    checkInAt: Date;
    membershipType: string | null;
    membershipStatus: string | null;
    membershipEndDate: string | null;
    hoursRemaining: string | number | null;
}
export interface StudentWithSeat {
    id: string;
    name: string;
    seatId: string | null;
    qrToken: string;
    status: string;
}
export interface ActiveMembership {
    id: string;
    type: 'monthly' | 'hourly';
    status: string;
    endDate: string | null;
    hoursTotal: string | null;
    hoursUsed: string;
    hoursRemaining: string | null;
}
export interface OccupancyData {
    currentCount: number;
    capacity: number;
    availableFlexible: number;
}
export interface AttendanceListParams {
    libraryId: string;
    date?: string;
    studentId?: string;
    status?: 'active' | 'completed' | 'corrected';
    offset: number;
    limit: number;
}
export interface AttendanceListResult {
    sessions: (typeof attendanceSessions.$inferSelect & {
        studentName: string | null;
        seatNumber: string | null;
        membershipType: string | null;
    })[];
    total: number;
}
export declare class AttendanceRepository {
    private readonly db;
    constructor(db: Database);
    findOpenSessionByStudent(studentId: string, libraryId: string): Promise<OpenSession | null>;
    findStudentByQrToken(qrToken: string, libraryId: string): Promise<{
        id: string;
        name: string;
        seatId: string | null;
        qrToken: string;
        status: string;
    } | null>;
    findStudentById(studentId: string, libraryId: string): Promise<{
        id: string;
        name: string;
        seatId: string | null;
        qrToken: string;
        status: string;
    } | null>;
    findActiveMembership(studentId: string, libraryId: string): Promise<{
        id: string;
        type: 'monthly' | 'hourly';
        status: string;
        endDate: string | null;
        hoursTotal: string | null;
        hoursUsed: string;
        hoursRemaining: string | null;
    } | null>;
    findSeatById(seatId: string, libraryId: string): Promise<{
        id: string;
        libraryId: string;
        seatNumber: string;
        section: string | null;
        type: "fixed" | "flexible";
        status: "available" | "occupied" | "maintenance";
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findAvailableFlexibleSeat(libraryId: string): Promise<{
        id: string;
        libraryId: string;
        seatNumber: string;
        section: string | null;
        type: "fixed" | "flexible";
        status: "available" | "occupied" | "maintenance";
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    assignSeatToStudent(seatId: string, studentId: string, libraryId: string): Promise<void>;
    updateSeatStatus(seatId: string, status: 'available' | 'occupied' | 'maintenance', libraryId: string): Promise<void>;
    findSessionById(sessionId: string, libraryId: string): Promise<typeof attendanceSessions.$inferSelect | null>;
    createSession(input: {
        libraryId: string;
        studentId: string;
        membershipId: string | null;
        checkInAt: Date;
        checkInMethod: 'qr' | 'manual';
        checkInBy: string | null;
    }, tx?: Database): Promise<typeof attendanceSessions.$inferSelect>;
    checkOut(sessionId: string, libraryId: string, data: {
        checkOutAt: Date;
        durationMinutes: number;
        checkOutMethod: 'qr' | 'manual' | 'auto' | 'forgot';
        checkOutBy: string | null;
        membershipId: string | null;
        hoursUsed?: number;
    }, tx?: Database): Promise<typeof attendanceSessions.$inferSelect | null>;
    correctSession(sessionId: string, libraryId: string, data: {
        checkInAt?: Date;
        checkOutAt?: Date | null;
        durationMinutes?: number;
        checkInMethod?: 'qr' | 'manual';
        checkOutMethod?: 'qr' | 'manual' | 'auto' | 'forgot' | null;
        isManualCorrection: boolean;
        correctionReason: string;
        checkOutBy?: string | null;
    }, tx?: Database): Promise<typeof attendanceSessions.$inferSelect | null>;
    list(params: AttendanceListParams): Promise<AttendanceListResult>;
    getOpenSessionsByLibrary(libraryId: string): Promise<typeof attendanceSessions.$inferSelect[]>;
    getLiveOccupancy(libraryId: string): Promise<number>;
    getOccupancy(libraryId: string): Promise<{
        currentCount: number;
        capacity: number;
        availableFlexible: number;
    }>;
}
