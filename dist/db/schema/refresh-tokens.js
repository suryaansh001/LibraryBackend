import { index, pgTable, text, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';
import { libraries } from './libraries.js';
import { users } from './users.js';
export const refreshTokens = pgTable('refresh_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    libraryId: uuid('library_id')
        .notNull()
        .references(() => libraries.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    deviceInfo: text('device_info'),
    ipAddress: text('ip_address'),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    tokenHashUnique: uniqueIndex('idx_refresh_tokens_token_hash_unique').on(table.tokenHash),
    revokedIndex: index('idx_refresh_tokens_user_revoked').on(table.userId, table.revokedAt),
    expiresIndex: index('idx_refresh_tokens_expires_at').on(table.expiresAt)
}));
//# sourceMappingURL=refresh-tokens.js.map