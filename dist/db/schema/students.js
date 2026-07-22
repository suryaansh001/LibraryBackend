import { index, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { libraries } from './libraries.js';
import { seats } from './seats.js';
import { users } from './users.js';
export const studentStatusEnum = pgEnum('student_status', ['active', 'suspended', 'expired', 'inactive']);
export const students = pgTable('students', {
    id: uuid('id').primaryKey().defaultRandom(),
    libraryId: uuid('library_id')
        .notNull()
        .references(() => libraries.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 255 }),
    photoUrl: text('photo_url'),
    status: studentStatusEnum('status').notNull().default('active'),
    seatId: uuid('seat_id').references(() => seats.id, { onDelete: 'set null' }),
    qrToken: varchar('qr_token', { length: 256 }).notNull(),
    customFields: jsonb('custom_fields').$type().notNull().default(sql `'{}'::jsonb`),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    qrTokenUnique: uniqueIndex('idx_students_qr_token_unique').on(table.qrToken),
    statusIndex: index('idx_students_library_status').on(table.libraryId, table.status).where(sql `${table.deletedAt} IS NULL`),
    phoneIndex: index('idx_students_library_phone').on(table.libraryId, table.phone).where(sql `${table.deletedAt} IS NULL`),
    createdAtIndex: index('idx_students_library_created_at').on(table.libraryId, table.createdAt).where(sql `${table.deletedAt} IS NULL`),
    seatIndex: index('idx_students_seat_id').on(table.seatId).where(sql `${table.seatId} IS NOT NULL AND ${table.deletedAt} IS NULL`),
    customFieldsIndex: index('idx_students_custom_fields').using('gin', table.customFields),
    nameTrgmIndex: index('idx_students_name_trgm').using('gin', sql `${table.name} gin_trgm_ops`).where(sql `${table.deletedAt} IS NULL`),
    libraryPhoneUnique: uniqueIndex('idx_students_library_phone_unique').on(table.libraryId, table.phone).where(sql `${table.deletedAt} IS NULL`)
}));
//# sourceMappingURL=students.js.map