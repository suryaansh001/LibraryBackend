import { boolean, index, numeric, pgEnum, pgTable, timestamp, uuid, varchar, integer } from 'drizzle-orm/pg-core';
import { libraries } from './libraries.js';
export const membershipPlanTypeEnum = pgEnum('membership_plan_type', ['monthly', 'hourly']);
export const membershipPlans = pgTable('membership_plans', {
    id: uuid('id').primaryKey().defaultRandom(),
    libraryId: uuid('library_id')
        .notNull()
        .references(() => libraries.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    type: membershipPlanTypeEnum('type').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    durationDays: integer('duration_days'),
    hoursIncluded: numeric('hours_included', { precision: 8, scale: 2 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    libraryActiveIndex: index('idx_membership_plans_library_active').on(table.libraryId, table.isActive),
    libraryTypeIndex: index('idx_membership_plans_library_type').on(table.libraryId, table.type)
}));
//# sourceMappingURL=membership-plans.js.map