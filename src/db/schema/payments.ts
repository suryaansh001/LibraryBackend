import { index, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar, date } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { libraries } from './libraries.js';
import { memberships } from './memberships.js';
import { students } from './students.js';
import { users } from './users.js';

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'upi', 'card', 'online']);
export const paymentStatusEnum = pgEnum('payment_status', ['paid', 'pending', 'refunded']);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    libraryId: uuid('library_id')
      .notNull()
      .references(() => libraries.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    membershipId: uuid('membership_id').references(() => memberships.id, { onDelete: 'set null' }),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    method: paymentMethodEnum('method').notNull(),
    status: paymentStatusEnum('status').notNull().default('paid'),
    referenceNumber: varchar('reference_number', { length: 100 }),
    paymentDate: date('payment_date').notNull(),
    dueDate: date('due_date'),
    notes: text('notes'),
    recordedBy: uuid('recorded_by').references(() => users.id, { onDelete: 'set null' }),
    razorpayOrderId: varchar('razorpay_order_id', { length: 100 }),
    razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    libraryPaymentDateIndex: index('idx_payments_library_payment_date').on(table.libraryId, table.paymentDate),
    libraryStudentIndex: index('idx_payments_library_student').on(table.libraryId, table.studentId),
    libraryStatusIndex: index('idx_payments_library_status').on(table.libraryId, table.status),
    pendingDueDateIndex: index('idx_payments_pending_due_date').on(table.libraryId, table.dueDate).where(sql`${table.status} = 'pending'`)
  })
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;