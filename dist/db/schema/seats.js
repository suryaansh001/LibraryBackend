import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { libraries } from './libraries.js';
export const seatTypeEnum = pgEnum('seat_type', ['fixed', 'flexible']);
export const seatStatusEnum = pgEnum('seat_status', ['available', 'occupied', 'maintenance']);
export const seats = pgTable('seats', {
    id: uuid('id').primaryKey().defaultRandom(),
    libraryId: uuid('library_id')
        .notNull()
        .references(() => libraries.id, { onDelete: 'cascade' }),
    seatNumber: varchar('seat_number', { length: 20 }).notNull(),
    section: varchar('section', { length: 50 }),
    type: seatTypeEnum('type').notNull(),
    status: seatStatusEnum('status').notNull().default('available'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    seatNumberUnique: uniqueIndex('idx_seats_library_seat_number_unique').on(table.libraryId, table.seatNumber),
    libraryStatusIndex: index('idx_seats_library_status').on(table.libraryId, table.status),
    libraryTypeIndex: index('idx_seats_library_type').on(table.libraryId, table.type)
}));
//# sourceMappingURL=seats.js.map