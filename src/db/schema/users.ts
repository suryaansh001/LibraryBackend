import { boolean, index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar, text } from 'drizzle-orm/pg-core';

import { libraries } from './libraries.js';

export const userRoleEnum = pgEnum('user_role', ['owner', 'staff', 'receptionist', 'student']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    libraryId: uuid('library_id')
      .notNull()
      .references(() => libraries.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    libraryEmailUnique: uniqueIndex('idx_users_library_email_unique').on(table.libraryId, table.email),
    libraryIndex: index('idx_users_library_id').on(table.libraryId),
    roleIndex: index('idx_users_role').on(table.role)
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;