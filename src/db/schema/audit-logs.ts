import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { libraries } from './libraries.js';
import { users } from './users.js';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    libraryId: uuid('library_id')
      .notNull()
      .references(() => libraries.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    requestId: varchar('request_id', { length: 64 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: uuid('entity_id'),
    oldValue: jsonb('old_value').$type<Record<string, unknown> | null>(),
    newValue: jsonb('new_value').$type<Record<string, unknown> | null>(),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    libraryCreatedAtIndex: index('idx_audit_logs_library_created_at').on(table.libraryId, table.createdAt),
    libraryEntityIndex: index('idx_audit_logs_library_entity').on(table.libraryId, table.entityType, table.entityId),
    libraryUserIndex: index('idx_audit_logs_library_user').on(table.libraryId, table.userId),
    requestIndex: index('idx_audit_logs_request_id').on(table.requestId)
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;