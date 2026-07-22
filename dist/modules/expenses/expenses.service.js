import { ExpenseRepository } from './expenses.repository.js';
import { AuditLogRepository } from '../../shared/utils/audit-log.repository.js';
import { toExpenseResponseDTO, toExpenseListItemDTO } from '../../shared/dto/expense.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
export class ExpenseService {
    db;
    expenseRepository;
    auditLogRepository;
    constructor(db) {
        this.db = db;
        this.expenseRepository = new ExpenseRepository(db);
        this.auditLogRepository = new AuditLogRepository(db);
    }
    async createExpense(body, ctx, ipAddress) {
        const expense = await this.db.transaction(async (tx) => {
            const repo = new ExpenseRepository(tx);
            const auditRepo = new AuditLogRepository(tx);
            const created = await repo.create({
                libraryId: ctx.libraryId,
                category: body.category,
                amount: body.amount.toFixed(2),
                description: body.description ?? null,
                expenseDate: body.expenseDate,
                recordedBy: ctx.user?.id ?? null,
                receiptUrl: body.receiptUrl ?? null
            }, tx);
            await auditRepo.create({
                libraryId: ctx.libraryId,
                userId: ctx.user?.id,
                requestId: ctx.requestId,
                action: 'CREATE_EXPENSE',
                entityType: 'expenses',
                entityId: created.id,
                newValue: { ...created, category: body.category, amount: body.amount },
                ipAddress
            }, tx);
            return created;
        });
        return toExpenseResponseDTO({ ...expense, recordedByName: null });
    }
    async listExpenses(query, libraryId) {
        const offset = (query.page - 1) * query.limit;
        const from = query.from;
        const to = query.to;
        const result = await this.expenseRepository.list({
            libraryId,
            from,
            to,
            category: query.category,
            offset,
            limit: query.limit
        });
        return {
            data: result.expenses.map(e => toExpenseListItemDTO({ ...e, category: e.category })),
            total: result.total
        };
    }
    async getExpenseById(expenseId, libraryId) {
        const expense = await this.expenseRepository.findById(expenseId, libraryId);
        if (!expense) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Expense not found', 404);
        }
        return toExpenseResponseDTO({ ...expense, recordedByName: expense.recordedByName ?? null });
    }
    async updateExpense(expenseId, body, libraryId, ctx, ipAddress) {
        const existing = await this.expenseRepository.findById(expenseId, libraryId);
        if (!existing) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Expense not found', 404);
        }
        const updated = await this.db.transaction(async (tx) => {
            const repo = new ExpenseRepository(tx);
            const auditRepo = new AuditLogRepository(tx);
            const updated = await repo.update(expenseId, libraryId, {
                category: body.category,
                amount: body.amount?.toFixed(2),
                description: body.description ?? existing.description,
                expenseDate: body.expenseDate ?? undefined,
                receiptUrl: body.receiptUrl
            }, tx);
            if (!updated) {
                throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Expense not found', 404);
            }
            await auditRepo.create({
                libraryId,
                userId: ctx.user?.id,
                requestId: ctx.requestId,
                action: 'UPDATE_EXPENSE',
                entityType: 'expenses',
                entityId: expenseId,
                oldValue: existing,
                newValue: updated,
                ipAddress
            }, tx);
            return updated;
        });
        return toExpenseResponseDTO({ ...updated, recordedByName: existing.recordedByName ?? null });
    }
    async deleteExpense(expenseId, libraryId, ctx, ipAddress) {
        const existing = await this.expenseRepository.findById(expenseId, libraryId);
        if (!existing) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Expense not found', 404);
        }
        await this.db.transaction(async (tx) => {
            const repo = new ExpenseRepository(tx);
            const auditRepo = new AuditLogRepository(tx);
            await repo.softDelete(expenseId, libraryId, tx);
            await auditRepo.create({
                libraryId,
                userId: ctx.user?.id,
                requestId: ctx.requestId,
                action: 'DELETE_EXPENSE',
                entityType: 'expenses',
                entityId: expenseId,
                oldValue: existing,
                ipAddress
            }, tx);
        });
    }
}
//# sourceMappingURL=expenses.service.js.map