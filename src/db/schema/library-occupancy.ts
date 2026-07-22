import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { libraries } from './libraries.js';

export const libraryOccupancy = pgTable('library_occupancy', {
  libraryId: uuid('library_id')
    .primaryKey()
    .references(() => libraries.id, { onDelete: 'cascade' }),
  currentCount: integer('current_count').notNull().default(0),
  capacity: integer('capacity').notNull().default(100),
  lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type LibraryOccupancy = typeof libraryOccupancy.$inferSelect;
export type NewLibraryOccupancy = typeof libraryOccupancy.$inferInsert;