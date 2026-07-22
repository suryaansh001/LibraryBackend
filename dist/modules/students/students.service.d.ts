import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { type StudentResponseDTO, type StudentListItemDTO, type StudentIdCardDTO } from '../../shared/dto/student.dto.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type { CreateStudentBody, UpdateStudentBody, StudentListQuery, StudentHistoryQuery, StudentPaymentsQuery } from './students.schema.js';
type Database = NodePgDatabase<typeof schema>;
export declare class StudentService {
    private readonly db;
    private readonly studentRepository;
    private readonly auditLogRepository;
    constructor(db: Database);
    createStudent(body: CreateStudentBody, ctx: RequestContext, ipAddress?: string): Promise<StudentResponseDTO>;
    getStudentById(studentId: string, libraryId: string): Promise<StudentResponseDTO>;
    updateStudent(studentId: string, body: UpdateStudentBody, ctx: RequestContext, ipAddress?: string): Promise<StudentResponseDTO>;
    updateStudentStatus(studentId: string, status: 'active' | 'suspended' | 'expired' | 'inactive', ctx: RequestContext, ipAddress?: string): Promise<StudentResponseDTO>;
    softDeleteStudent(studentId: string, ctx: RequestContext, ipAddress?: string): Promise<void>;
    regenerateQrToken(studentId: string, ctx: RequestContext, ipAddress?: string): Promise<StudentResponseDTO>;
    listStudents(query: StudentListQuery, libraryId: string): Promise<{
        data: StudentListItemDTO[];
        total: number;
    }>;
    getStudentHistory(studentId: string, query: StudentHistoryQuery, libraryId: string): Promise<{
        data: unknown[];
        total: number;
    }>;
    getStudentPayments(studentId: string, query: StudentPaymentsQuery, libraryId: string): Promise<{
        data: unknown[];
        total: number;
    }>;
    getStudentIdCard(studentId: string, libraryId: string): Promise<StudentIdCardDTO>;
}
export {};
