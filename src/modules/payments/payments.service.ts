import { eq, and, isNull, desc, sql, gte, lte } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { payments } from '../../db/schema/payments.js';
import { students } from '../../db/schema/students.js';
import { users } from '../../db/schema/users.js';
import { PaymentRepository } from './payments.repository.js';
import { AuditLogRepository } from '../../shared/utils/audit-log.repository.js';
import { toPaymentResponseDTO, toPaymentListItemDTO, type PaymentResponseDTO, type PaymentListItemDTO } from '../../shared/dto/payment.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type { CreatePaymentBody, UpdatePaymentBody, UpdatePaymentStatusBody, PaymentListQuery } from './payments.schema.js';

type Database = NodePgDatabase<typeof schema>;

export class PaymentService {
  private readonly paymentRepository: PaymentRepository;
  private readonly auditLogRepository: AuditLogRepository;

  public constructor(private readonly db: Database) {
    this.paymentRepository = new PaymentRepository(db);
    this.auditLogRepository = new AuditLogRepository(db);
  }

  public async createPayment(
    body: import('./payments.schema.js').CreatePaymentBody,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<import('../../shared/dto/payment.dto.js').PaymentResponseDTO> {
    const student = await this.db
      .select({ name: students.name })
      .from(students)
      .where(and(eq(students.id, body.studentId), eq(students.libraryId, ctx.libraryId), isNull(students.deletedAt)))
      .limit(1);

    const studentName = student[0]?.name;
    if (studentName === undefined) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    const payment = await this.db.transaction(async (tx) => {
      const repo = new PaymentRepository(tx);
      const auditRepo = new AuditLogRepository(tx);

      const created = await repo.create({
        libraryId: ctx.libraryId,
        studentId: body.studentId,
        membershipId: null,
        amount: body.amount.toFixed(2),
        method: body.method,
        status: body.status,
        referenceNumber: body.referenceNumber ?? null,
        paymentDate: body.paymentDate,
        dueDate: body.dueDate ?? null,
        notes: body.notes ?? null,
        recordedBy: ctx.user?.id ?? null
      }, tx);

      await auditRepo.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'CREATE_PAYMENT',
        entityType: 'payments',
        entityId: created.id,
        newValue: { ...created, studentName },
        ipAddress
      }, tx);

      return created;
    });

    return toPaymentResponseDTO({ ...payment, studentName, recordedByName: null });
  }

  public async listPayments(
    query: import('./payments.schema.js').PaymentListQuery,
    libraryId: string
  ): Promise<{ data: import('../../shared/dto/payment.dto.js').PaymentListItemDTO[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const from = query.from;
    const to = query.to;

    const result = await this.paymentRepository.list({
      libraryId,
      from,
      to,
      studentId: query.studentId,
      status: query.status,
      offset,
      limit: query.limit
    });

    return {
      data: result.payments.map(p => toPaymentListItemDTO({ ...p, studentName: p.studentName ?? '' })),
      total: result.total
    };
  }

  public async getPaymentById(paymentId: string, libraryId: string): Promise<import('../../shared/dto/payment.dto.js').PaymentResponseDTO> {
    const payment = await this.paymentRepository.findById(paymentId, libraryId);
    if (!payment) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Payment not found', 404);
    }

    return toPaymentResponseDTO({ ...payment, studentName: payment.studentName ?? '' });
  }

  public async updatePayment(
    paymentId: string,
    body: import('./payments.schema.js').UpdatePaymentBody,
    libraryId: string,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<import('../../shared/dto/payment.dto.js').PaymentResponseDTO> {
    const existing = await this.paymentRepository.findById(paymentId, libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Payment not found', 404);
    }

    const updated = await this.db.transaction(async (tx) => {
      const repo = new PaymentRepository(tx);
      const auditRepo = new AuditLogRepository(tx);

      const updated = await repo.update(paymentId, libraryId, {
        amount: body.amount?.toFixed(2),
        method: body.method,
        status: body.status,
        referenceNumber: body.referenceNumber,
        paymentDate: body.paymentDate,
        dueDate: body.dueDate,
        notes: body.notes
      }, tx);

      if (!updated) {
        throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Payment not found', 404);
      }

      await auditRepo.create({
        libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'UPDATE_PAYMENT',
        entityType: 'payments',
        entityId: paymentId,
        oldValue: existing,
        newValue: updated,
        ipAddress
      }, tx);

      return updated;
    });

    return toPaymentResponseDTO({ ...updated, studentName: existing.studentName ?? '', recordedByName: existing.recordedByName ?? null });
  }

  public async updatePaymentStatus(
    paymentId: string,
    body: import('./payments.schema.js').UpdatePaymentStatusBody,
    libraryId: string
  ): Promise<import('../../shared/dto/payment.dto.js').PaymentResponseDTO> {
    const existing = await this.paymentRepository.findById(paymentId, libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Payment not found', 404);
    }

    const updated = await this.paymentRepository.updateStatus(paymentId, libraryId, body.status);
    if (!updated) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Payment not found', 404);
    }

    return toPaymentResponseDTO({ ...updated, studentName: existing.studentName ?? '', recordedByName: existing.recordedByName ?? null });
  }
}
