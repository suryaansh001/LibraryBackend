import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import type { schema } from '../../db/schema/index.js';
import { libraries } from '../../db/schema/libraries.js';
import { users } from '../../db/schema/users.js';
import { payments } from '../../db/schema/payments.js';
import { BCRYPT_ROUNDS } from '../../config/constants.js';
import { StudentRepository } from './students.repository.js';
import { AuditLogRepository } from '../../shared/utils/audit-log.repository.js';
import { generateQrToken } from '../../shared/utils/qr-token.util.js';
import {
  toStudentResponseDTO,
  toStudentListItemDTO,
  toStudentIdCardDTO,
  type StudentResponseDTO,
  type StudentListItemDTO,
  type StudentIdCardDTO
} from '../../shared/dto/student.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type {
  CreateStudentBody,
  UpdateStudentBody,
  StudentListQuery,
  StudentHistoryQuery,
  StudentPaymentsQuery
} from './students.schema.js';

type Database = NodePgDatabase<typeof schema>;

function generateDefaultPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 10; i++) {
    pw += chars[crypto.randomInt(chars.length)];
  }
  return pw;
}

export class StudentService {
  private readonly studentRepository: StudentRepository;
  private readonly auditLogRepository: AuditLogRepository;

  public constructor(private readonly db: Database) {
    this.studentRepository = new StudentRepository(db);
    this.auditLogRepository = new AuditLogRepository(db);
  }

  public async createStudent(
    body: CreateStudentBody,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<StudentResponseDTO & { password?: string }> {
    const studentId = crypto.randomUUID();
    const qrToken = generateQrToken(studentId, ctx.libraryId);
    const password = body.password ?? generateDefaultPassword();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { password: _pw, paymentStatus, ...studentFields } = body;

    const customFields = { ...studentFields.customFields };
    if (paymentStatus !== undefined) {
      customFields.paymentStatus = paymentStatus;
    }

    let created: Awaited<ReturnType<typeof this.studentRepository.create>>;
    try {
      created = await this.db.transaction(async (tx) => {
        const repo = new StudentRepository(tx);
        const auditRepo = new AuditLogRepository(tx);

        const student = await repo.create({
          ...studentFields,
          id: studentId,
          libraryId: ctx.libraryId,
          qrToken,
          customFields,
          createdBy: ctx.user?.id
        });

        await tx.insert(users).values({
          libraryId: ctx.libraryId,
          name: body.name,
          email: body.email ?? `${studentId}@student.local`,
          passwordHash,
          role: 'student',
        });

        if (paymentStatus === 'paid') {
          const membershipAmounts: Record<string, string> = {
            Daily: '50', Weekly: '150', Monthly: '500', Quarterly: '1400',
          };
          const membershipType = (customFields.membership as string) ?? 'Monthly';
          await tx.insert(payments).values({
            libraryId: ctx.libraryId,
            studentId: student.id,
            amount: membershipAmounts[membershipType] ?? '500',
            method: 'cash',
            status: 'paid',
            paymentDate: new Date().toISOString().slice(0, 10),
            recordedBy: ctx.user?.id,
          });
        }

        await auditRepo.create({
          libraryId: ctx.libraryId,
          userId: ctx.user?.id,
          requestId: ctx.requestId,
          action: 'CREATE_STUDENT',
          entityType: 'students',
          entityId: student.id,
          newValue: student,
          ipAddress
        });

        return student;
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
        const detail = (err as { detail?: string }).detail ?? '';
        if (detail.includes('phone')) {
          throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'A student with this phone number already exists in your library.', 409);
        }
        if (detail.includes('email')) {
          throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'A student with this email already exists in your library.', 409);
        }
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'A student with this information already exists.', 409);
      }
      throw err;
    }

    const studentWithRelations = await this.studentRepository.findById(created.id, ctx.libraryId);
    if (!studentWithRelations) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found after creation', 404);
    }

    const dto = toStudentResponseDTO(studentWithRelations);
    return { ...dto, password };
  }

  public async getCurrentStudent(email: string, libraryId: string): Promise<StudentResponseDTO> {
    const student = await this.studentRepository.findCurrentStudentByEmail(email, libraryId);
    if (!student) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }
    return toStudentResponseDTO(student);
  }

  public async getStudentById(studentId: string, libraryId: string): Promise<StudentResponseDTO> {
    const student = await this.studentRepository.findById(studentId, libraryId);
    if (!student) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }
    return toStudentResponseDTO(student);
  }

  public async updateStudent(
    studentId: string,
    body: UpdateStudentBody,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<StudentResponseDTO> {
    const existing = await this.studentRepository.findById(studentId, ctx.libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    const updated = await this.db.transaction(async (tx) => {
      const repo = new StudentRepository(tx);
      const auditRepo = new AuditLogRepository(tx);

      const student = await repo.update(studentId, ctx.libraryId, body);
      if (!student) {
        throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found or deleted', 404);
      }

      await auditRepo.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'UPDATE_STUDENT',
        entityType: 'students',
        entityId: studentId,
        oldValue: existing as unknown as Record<string, unknown>,
        newValue: student,
        ipAddress
      });

      return student;
    });

    const studentWithRelations = await this.studentRepository.findById(updated.id, ctx.libraryId);
    if (!studentWithRelations) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found after update', 404);
    }

    return toStudentResponseDTO(studentWithRelations);
  }

  public async updateStudentStatus(
    studentId: string,
    status: 'active' | 'suspended' | 'expired' | 'inactive',
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<StudentResponseDTO> {
    const existing = await this.studentRepository.findById(studentId, ctx.libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    const updated = await this.db.transaction(async (tx) => {
      const repo = new StudentRepository(tx);
      const auditRepo = new AuditLogRepository(tx);

      const student = await repo.updateStatus(studentId, ctx.libraryId, status);
      if (!student) {
        throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found or deleted', 404);
      }

      await auditRepo.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'UPDATE_STUDENT_STATUS',
        entityType: 'students',
        entityId: studentId,
        oldValue: { status: existing.status },
        newValue: { status: student.status },
        ipAddress
      });

      return student;
    });

    const studentWithRelations = await this.studentRepository.findById(updated.id, ctx.libraryId);
    if (!studentWithRelations) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found after status update', 404);
    }

    return toStudentResponseDTO(studentWithRelations);
  }

  public async softDeleteStudent(
    studentId: string,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<void> {
    const existing = await this.studentRepository.findById(studentId, ctx.libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    await this.db.transaction(async (tx) => {
      const repo = new StudentRepository(tx);
      const auditRepo = new AuditLogRepository(tx);

      const student = await repo.softDelete(studentId, ctx.libraryId);
      if (!student) {
        throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found or already deleted', 404);
      }

      await auditRepo.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'DELETE_STUDENT',
        entityType: 'students',
        entityId: studentId,
        oldValue: existing as unknown as Record<string, unknown>,
        ipAddress
      });
    });
  }

  public async regenerateQrToken(
    studentId: string,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<StudentResponseDTO> {
    const existing = await this.studentRepository.findById(studentId, ctx.libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    const newQrToken = generateQrToken(studentId, ctx.libraryId);

    const updated = await this.db.transaction(async (tx) => {
      const repo = new StudentRepository(tx);
      const auditRepo = new AuditLogRepository(tx);

      const student = await repo.updateQrToken(studentId, ctx.libraryId, newQrToken);
      if (!student) {
        throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found or deleted', 404);
      }

      await auditRepo.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'REGENERATE_QR_TOKEN',
        entityType: 'students',
        entityId: studentId,
        oldValue: { qrToken: existing.qrToken },
        newValue: { qrToken: student.qrToken },
        ipAddress
      });

      return student;
    });

    const studentWithRelations = await this.studentRepository.findById(updated.id, ctx.libraryId);
    if (!studentWithRelations) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found after QR regeneration', 404);
    }

    return toStudentResponseDTO(studentWithRelations);
  }

  public async listStudents(
    query: StudentListQuery,
    libraryId: string
  ): Promise<{ data: StudentListItemDTO[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.studentRepository.list({
      libraryId,
      search: query.search,
      status: query.status,
      membershipType: query.membershipType,
      seatId: query.seatId,
      includeDeleted: query.includeDeleted,
      offset,
      limit: query.limit
    });

    return {
      data: result.students.map(toStudentListItemDTO),
      total: result.total
    };
  }

  public async getStudentHistory(
    studentId: string,
    query: StudentHistoryQuery,
    libraryId: string
  ): Promise<{ data: unknown[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.studentRepository.getHistory(studentId, libraryId, offset, query.limit);
    return {
      data: result.sessions,
      total: result.total
    };
  }

  public async getStudentPayments(
    studentId: string,
    query: StudentPaymentsQuery,
    libraryId: string
  ): Promise<{ data: unknown[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.studentRepository.getPayments(studentId, libraryId, offset, query.limit);
    return {
      data: result.payments,
      total: result.total
    };
  }

  public async getStudentIdCard(studentId: string, libraryId: string): Promise<StudentIdCardDTO> {
    const student = await this.studentRepository.findById(studentId, libraryId);
    if (!student) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    const libraryRecord = await this.db
      .select({ name: libraries.name })
      .from(libraries)
      .where(eq(libraries.id, libraryId))
      .limit(1);

    const libraryName = libraryRecord[0]?.name ?? 'Library';

    return toStudentIdCardDTO(student, libraryName);
  }
}
