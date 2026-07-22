import { boolean, integer, jsonb, numeric, pgEnum, pgTable, text, time, timestamp, uniqueIndex, index, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const librarySubscriptionPlanEnum = pgEnum('library_subscription_plan', [
    'trial',
    'starter',
    'professional',
    'enterprise'
]);
export const librarySubscriptionStatusEnum = pgEnum('library_subscription_status', [
    'active',
    'past_due',
    'cancelled',
    'trialing'
]);
export const libraries = pgTable('libraries', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    ownerEmail: varchar('owner_email', { length: 255 }).notNull(),
    logoUrl: text('logo_url'),
    capacity: integer('capacity').notNull().default(100),
    openingTime: time('opening_time').notNull().default(sql `'06:00'::time`),
    closingTime: time('closing_time').notNull().default(sql `'22:00'::time`),
    defaultHourlyRate: numeric('default_hourly_rate', { precision: 10, scale: 2 }),
    address: text('address'),
    phone: varchar('phone', { length: 20 }),
    subscriptionPlan: librarySubscriptionPlanEnum('subscription_plan').notNull().default('trial'),
    subscriptionStatus: librarySubscriptionStatusEnum('subscription_status').notNull().default('trialing'),
    trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
    subscriptionEndsAt: timestamp('subscription_ends_at', { withTimezone: true }),
    razorpayCustomerId: varchar('razorpay_customer_id', { length: 100 }),
    razorpaySubscriptionId: varchar('razorpay_subscription_id', { length: 100 }),
    timezone: varchar('timezone', { length: 50 }).notNull().default('Asia/Kolkata'),
    customFieldSchema: jsonb('custom_field_schema').$type().notNull().default(sql `'{}'::jsonb`),
    settings: jsonb('settings').$type().notNull().default(sql `'{}'::jsonb`),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    slugUnique: uniqueIndex('idx_libraries_slug_unique').on(table.slug),
    subscriptionStatusIndex: index('idx_libraries_subscription_status').on(table.subscriptionStatus),
    isActiveIndex: index('idx_libraries_is_active').on(table.isActive)
}));
//# sourceMappingURL=libraries.js.map