import type { RequestContext } from '../../shared/types/common.types.js';
export declare class ExpenseService {
    private readonly db;
    private readonly expenseRepository;
    private readonly auditLogRepository;
    constructor(db: typeof import('../../config/database.js').db);
    createExpense(body: import('./expenses.schema.js').CreateExpenseBody, ctx: RequestContext, ipAddress?: string): Promise<import('../../shared/dto/expense.dto.js').ExpenseResponseDTO>;
    listExpenses(query: import('./expenses.schema.js').ExpenseListQuery, libraryId: string): Promise<{
        data: import('../../shared/dto/expense.dto.js').ExpenseListItemDTO[];
        total: number;
    }>;
    getExpenseById(expenseId: string, libraryId: string): Promise<import('../../shared/dto/expense.dto.js').ExpenseResponseDTO>;
    updateExpense(expenseId: string, body: import('./expenses.schema.js').UpdateExpenseBody, libraryId: string, ctx: RequestContext, ipAddress?: string): Promise<import('../../shared/dto/expense.dto.js').ExpenseResponseDTO>;
    deleteExpense(expenseId: string, libraryId: string, ctx: RequestContext, ipAddress?: string): Promise<void>;
}
