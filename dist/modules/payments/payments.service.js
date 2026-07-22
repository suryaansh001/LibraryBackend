import { eq, and, isNull } from 'drizzle-orm';
import { students } from '../../db/schema/students.js';
import { PaymentRepository } from './payments.repository.js';
import { AuditLogRepository } from '../../shared/utils/audit-log.repository.js';
import { toPaymentResponseDTO, toPaymentListItemDTO } from '../../shared/dto/payment.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
export class PaymentService {
    db;
    paymentRepository;
    auditLogRepository;
    constructor(db) {
        this.db = db;
        this.paymentRepository = new PaymentRepository(db);
        this.auditLogRepository = new AuditLogRepository(db);
    }
    async createPayment(body, ctx, ipAddress) {
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
    async listPayments(query, libraryId) {
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
    async getPaymentById(paymentId, libraryId) {
        const payment = await this.paymentRepository.findById(paymentId, libraryId);
        if (!payment) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Payment not found', 404);
        }
        return toPaymentResponseDTO({ ...payment, studentName: payment.studentName ?? '' });
    }
    async updatePayment(paymentId, body, libraryId, ctx, ipAddress) {
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
    async updatePaymentStatus(paymentId, body, libraryId) {
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
//# sourceMappingURL=payments.service.js.map