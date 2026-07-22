import { and, eq, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { expenses } from '../../db/schema/expenses.js';
import { ExpenseRepository } from './expenses.repository.js';
import { AuditLogRepository } from '../../shared/utils/audit-log.repository.js';
import { toExpenseResponseDTO, toExpenseListItemDTO, type ExpenseResponseDTO, type ExpenseListItemDTO } from '../../shared/dto/expense.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type { CreateExpenseBody, UpdateExpenseBody, ExpenseListQuery } from './expenses.schema.js';

type Database = NodePgDatabase<typeof schema>;

export class ExpenseService {
  private readonly expenseRepository: ExpenseRepository;
  private readonly auditLogRepository: AuditLogRepository;

  public constructor(private readonly db: typeof import('../../config/database.js').db) {
    this.expenseRepository = new ExpenseRepository(db);
    this.auditLogRepository = new AuditLogRepository(db);
  }

  public async createExpense(
    body: import('./expenses.schema.js').CreateExpenseBody,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<import('../../shared/dto/expense.dto.js').ExpenseResponseDTO> {
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

  public async listExpenses(
    query: import('./expenses.schema.js').ExpenseListQuery,
    libraryId: string
  ): Promise<{ data: import('../../shared/dto/expense.dto.js').ExpenseListItemDTO[]; total: number }> {
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

  public async getExpenseById(expenseId: string, libraryId: string): Promise<import('../../shared/dto/expense.dto.js').ExpenseResponseDTO> {
    const expense = await this.expenseRepository.findById(expenseId, libraryId);
    if (!expense) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Expense not found', 404);
    }

    return toExpenseResponseDTO({ ...expense, recordedByName: expense.recordedByName ?? null });
  }

  public async updateExpense(
    expenseId: string,
    body: import('./expenses.schema.js').UpdateExpenseBody,
    libraryId: string,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<import('../../shared/dto/expense.dto.js').ExpenseResponseDTO> {
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

  public async deleteExpense(
    expenseId: string,
    libraryId: string,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<void> {
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
