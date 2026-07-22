import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { students } from '../../db/schema/students.js';
import { attendanceSessions } from '../../db/schema/attendance-sessions.js';
import { payments } from '../../db/schema/payments.js';
import type { StudentWithRelations } from '../../shared/dto/student.dto.js';
type Database = NodePgDatabase<typeof schema>;
export interface StudentListParams {
    libraryId: string;
    search?: string;
    status?: 'active' | 'suspended' | 'expired' | 'inactive';
    membershipType?: 'monthly' | 'hourly';
    seatId?: string;
    includeDeleted?: boolean;
    offset: number;
    limit: number;
}
export interface StudentListResult {
    students: StudentWithRelations[];
    total: number;
}
export declare class StudentRepository {
    private readonly db;
    constructor(db: Database);
    findCurrentStudentByEmail(email: string, libraryId: string): Promise<StudentWithRelations | null>;
    /**
     * Find a single student by ID with seat and current membership data.
     * Always filters by library_id and deleted_at IS NULL.
     */
    findById(studentId: string, libraryId: string): Promise<StudentWithRelations | null>;
    /**
     * Find a student by ID including deleted students (for owner-only operations).
     */
    findByIdIncludeDeleted(studentId: string, libraryId: string): Promise<StudentWithRelations | null>;
    /**
     * Search and list students with filtering, pagination, and optional search.
     * Uses pg_trgm for fuzzy name search, with phone-first priority.
     */
    list(params: StudentListParams): Promise<StudentListResult>;
    /**
     * Create a new student. Returns the raw DB row.
     */
    create(input: {
        id?: string;
        libraryId: string;
        name: string;
        phone: string;
        email?: string;
        photoUrl?: string;
        status?: 'active' | 'suspended' | 'expired' | 'inactive';
        seatId?: string;
        qrToken: string;
        customFields?: Record<string, unknown>;
        notes?: string;
        createdBy?: string;
    }, tx?: Database): Promise<typeof students.$inferSelect>;
    /**
     * Update a student's fields.
     */
    update(studentId: string, libraryId: string, data: {
        name?: string;
        phone?: string;
        email?: string | null;
        photoUrl?: string | null;
        seatId?: string | null;
        customFields?: Record<string, unknown>;
        notes?: string | null;
    }, tx?: Database): Promise<typeof students.$inferSelect | null>;
    /**
     * Update only the student's status.
     */
    updateStatus(studentId: string, libraryId: string, status: 'active' | 'suspended' | 'expired' | 'inactive', tx?: Database): Promise<typeof students.$inferSelect | null>;
    /**
     * Soft delete a student by setting deleted_at.
     * Students are NEVER permanently deleted.
     */
    softDelete(studentId: string, libraryId: string, tx?: Database): Promise<typeof students.$inferSelect | null>;
    /**
     * Update the QR token for a student.
     */
    updateQrToken(studentId: string, libraryId: string, qrToken: string, tx?: Database): Promise<typeof students.$inferSelect | null>;
    /**
     * Get attendance history for a student.
     */
    getHistory(studentId: string, libraryId: string, offset: number, limit: number): Promise<{
        sessions: (typeof attendanceSessions.$inferSelect)[];
        total: number;
    }>;
    /**
     * Get payments for a student.
     */
    getPayments(studentId: string, libraryId: string, offset: number, limit: number): Promise<{
        payments: (typeof payments.$inferSelect)[];
        total: number;
    }>;
    /**
     * Find student by QR token + library_id. Single indexed lookup for performance.
     */
    findByQrToken(qrToken: string, libraryId: string): Promise<StudentWithRelations | null>;
}
export {};
