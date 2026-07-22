import { boolean, date, index, numeric, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { libraries } from './libraries.js';
import { membershipPlans } from './membership-plans.js';
import { students } from './students.js';
import { users } from './users.js';
export const membershipStatusEnum = pgEnum('membership_status', ['active', 'expired', 'suspended', 'cancelled']);
export const membershipTypeEnum = pgEnum('membership_type', ['monthly', 'hourly']);
export const memberships = pgTable('memberships', {
    id: uuid('id').primaryKey().defaultRandom(),
    libraryId: uuid('library_id')
        .notNull()
        .references(() => libraries.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
        .notNull()
        .references(() => students.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id').references(() => membershipPlans.id, { onDelete: 'set null' }),
    type: membershipTypeEnum('type').notNull(),
    status: membershipStatusEnum('status').notNull().default('active'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    hoursTotal: numeric('hours_total', { precision: 8, scale: 2 }),
    hoursUsed: numeric('hours_used', { precision: 8, scale: 2 }).notNull().default('0'),
    hoursRemaining: numeric('hours_remaining', { precision: 8, scale: 2 }),
    isCurrent: boolean('is_current').notNull().default(true),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    oneActiveMembership: uniqueIndex('idx_memberships_one_active').on(table.studentId).where(sql `${table.isCurrent} = true`),
    libraryStudentCurrentIndex: index('idx_memberships_library_student_current').on(table.libraryId, table.studentId, table.isCurrent),
    libraryStatusIndex: index('idx_memberships_library_status').on(table.libraryId, table.status),
    activeEndDateIndex: index('idx_memberships_active_end_date').on(table.endDate).where(sql `${table.status} = 'active'`)
}));
//# sourceMappingURL=memberships.js.map