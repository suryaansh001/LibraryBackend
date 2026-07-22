import { and, desc, eq, getTableColumns, gte, isNull, lte, sql } from 'drizzle-orm';
import { expenses } from '../../db/schema/expenses.js';
import { users } from '../../db/schema/users.js';
export class ExpenseRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(expenseId, libraryId) {
        const rows = await this.db
            .select({
            ...getTableColumns(expenses),
            recordedByName: users.name
        })
            .from(expenses)
            .leftJoin(users, eq(expenses.recordedBy, users.id))
            .where(and(eq(expenses.id, expenseId), eq(expenses.libraryId, libraryId)))
            .limit(1);
        return rows[0] ?? null;
    }
    async list(params) {
        const conditions = [eq(expenses.libraryId, params.libraryId), isNull(expenses.deletedAt)];
        if (params.from) {
            conditions.push(gte(expenses.expenseDate, params.from));
        }
        if (params.to) {
            conditions.push(lte(expenses.expenseDate, params.to));
        }
        if (params.category) {
            conditions.push(eq(expenses.category, params.category));
        }
        const whereClause = and(...conditions);
        const [countResult, expenseRows] = await Promise.all([
            this.db
                .select({ total: sql `count(*)` })
                .from(expenses)
                .where(whereClause),
            this.db
                .select({
                ...getTableColumns(expenses),
                recordedByName: users.name
            })
                .from(expenses)
                .leftJoin(users, eq(expenses.recordedBy, users.id))
                .where(whereClause)
                .orderBy(desc(expenses.expenseDate))
                .limit(params.limit)
                .offset(params.offset)
        ]);
        const total = Number(countResult[0]?.total ?? 0);
        return {
            expenses: expenseRows,
            total
        };
    }
    async create(input, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .insert(expenses)
            .values({
            libraryId: input.libraryId,
            category: input.category,
            amount: input.amount,
            description: input.description,
            expenseDate: input.expenseDate,
            recordedBy: input.recordedBy,
            receiptUrl: input.receiptUrl
        })
            .returning();
        const created = rows[0];
        if (!created) {
            throw new Error('Failed to create expense');
        }
        return created;
    }
    async update(expenseId, libraryId, data, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .update(expenses)
            .set({
            ...data,
            updatedAt: new Date()
        })
            .where(and(eq(expenses.id, expenseId), eq(expenses.libraryId, libraryId)))
            .returning();
        return rows[0] ?? null;
    }
    async softDelete(expenseId, libraryId, tx) {
        const database = tx ?? this.db;
        await database
            .update(expenses)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(expenses.id, expenseId), eq(expenses.libraryId, libraryId)));
    }
}
//# sourceMappingURL=expenses.repository.js.map