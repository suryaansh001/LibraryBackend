import { and, desc, eq, getTableColumns, gte, isNull, lte, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { expenses } from '../../db/schema/expenses.js';
import { users } from '../../db/schema/users.js';

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
  expenses: (typeof expenses.$inferSelect & { recordedByName: string | null })[];
  total: number;
}

export class ExpenseRepository {
  public constructor(private readonly db: Database) {}

  public async findById(expenseId: string, libraryId: string): Promise<typeof expenses.$inferSelect & { recordedByName: string | null } | null> {
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

  public async list(params: ExpenseListParams): Promise<{ expenses: Array<typeof expenses.$inferSelect & { recordedByName: string | null }>; total: number }> {
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
        .select({ total: sql`count(*)` })
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

  public async create(
    input: {
      libraryId: string;
      category: 'rent' | 'electricity' | 'internet' | 'salary' | 'maintenance' | 'miscellaneous';
      amount: string;
      description: string | null;
      expenseDate: string;
      recordedBy: string | null;
      receiptUrl: string | null;
    },
    tx?: Database
  ): Promise<typeof expenses.$inferSelect> {
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

  public async update(
    expenseId: string,
    libraryId: string,
    data: {
      category?: 'rent' | 'electricity' | 'internet' | 'salary' | 'maintenance' | 'miscellaneous';
      amount?: string;
      description?: string | null;
      expenseDate?: string;
      receiptUrl?: string | null;
    },
    tx?: Database
  ): Promise<typeof expenses.$inferSelect | null> {
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

  public async softDelete(expenseId: string, libraryId: string, tx?: Database): Promise<void> {
    const database = tx ?? this.db;
    await database
      .update(expenses)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(expenses.id, expenseId), eq(expenses.libraryId, libraryId)));
  }
}
