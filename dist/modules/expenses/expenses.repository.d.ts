import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { expenses } from '../../db/schema/expenses.js';
type Database = NodePgDatabase<typeof schema>;
export interface ExpenseListParams {
    libraryId: string;
    from?: string;
    to?: string;
    category?: 'rent' | 'electricity' | 'internet' | 'salary' | 'maintenance' | 'miscellaneous';
    offset: number;
    limit: number;
}
export interface ExpenseListResult {
    expenses: (typeof expenses.$inferSelect & {
        recordedByName: string | null;
    })[];
    total: number;
}
export declare class ExpenseRepository {
    private readonly db;
    constructor(db: Database);
    findById(expenseId: string, libraryId: string): Promise<typeof expenses.$inferSelect & {
        recordedByName: string | null;
    } | null>;
    list(params: ExpenseListParams): Promise<{
        expenses: Array<typeof expenses.$inferSelect & {
            recordedByName: string | null;
        }>;
        total: number;
    }>;
    create(input: {
        libraryId: string;
        category: 'rent' | 'electricity' | 'internet' | 'salary' | 'maintenance' | 'miscellaneous';
        amount: string;
        description: string | null;
        expenseDate: string;
        recordedBy: string | null;
        receiptUrl: string | null;
    }, tx?: Database): Promise<typeof expenses.$inferSelect>;
    update(expenseId: string, libraryId: string, data: {
        category?: 'rent' | 'electricity' | 'internet' | 'salary' | 'maintenance' | 'miscellaneous';
        amount?: string;
        description?: string | null;
        expenseDate?: string;
        receiptUrl?: string | null;
    }, tx?: Database): Promise<typeof expenses.$inferSelect | null>;
    softDelete(expenseId: string, libraryId: string, tx?: Database): Promise<void>;
}
export {};
