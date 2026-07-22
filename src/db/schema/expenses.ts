import { index, pgEnum, pgTable, text, timestamp, uuid, numeric, date } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { libraries } from './libraries.js';
import { users } from './users.js';

export const expenseCategoryEnum = pgEnum('expense_category', [
  'rent',
  'electricity',
  'internet',
  'salary',
  'maintenance',
  'miscellaneous'
]);

export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    libraryId: uuid('library_id')
      .notNull()
      .references(() => libraries.id, { onDelete: 'cascade' }),
    category: expenseCategoryEnum('category').notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    description: text('description'),
    expenseDate: date('expense_date').notNull(),
    recordedBy: uuid('recorded_by').references(() => users.id, { onDelete: 'set null' }),
    receiptUrl: text('receipt_url'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    libraryDateIndex: index('idx_expenses_library_expense_date').on(table.libraryId, table.expenseDate).where(sql`${table.deletedAt} IS NULL`),
    libraryCategoryIndex: index('idx_expenses_library_category').on(table.libraryId, table.category).where(sql`${table.deletedAt} IS NULL`)
  })
);

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;