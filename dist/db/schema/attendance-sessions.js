import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { libraries } from './libraries.js';
import { memberships } from './memberships.js';
import { students } from './students.js';
import { users } from './users.js';
export const attendanceCheckInMethodEnum = pgEnum('attendance_check_in_method', ['qr', 'manual']);
export const attendanceCheckOutMethodEnum = pgEnum('attendance_check_out_method', ['qr', 'manual', 'auto', 'forgot']);
export const attendanceSessions = pgTable('attendance_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    libraryId: uuid('library_id')
        .notNull()
        .references(() => libraries.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
        .notNull()
        .references(() => students.id, { onDelete: 'cascade' }),
    membershipId: uuid('membership_id').references(() => memberships.id, { onDelete: 'set null' }),
    checkInAt: timestamp('check_in_at', { withTimezone: true }).notNull().defaultNow(),
    checkOutAt: timestamp('check_out_at', { withTimezone: true }),
    durationMinutes: integer('duration_minutes'),
    checkInMethod: attendanceCheckInMethodEnum('check_in_method').notNull(),
    checkOutMethod: attendanceCheckOutMethodEnum('check_out_method'),
    checkInBy: uuid('check_in_by').references(() => users.id, { onDelete: 'set null' }),
    checkOutBy: uuid('check_out_by').references(() => users.id, { onDelete: 'set null' }),
    isManualCorrection: boolean('is_manual_correction').notNull().default(false),
    correctionReason: text('correction_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
    oneOpenSession: uniqueIndex('idx_attendance_one_open_session').on(table.studentId).where(sql `${table.checkOutAt} IS NULL`),
    libraryCheckInIndex: index('idx_attendance_library_check_in_at').on(table.libraryId, table.checkInAt),
    libraryStudentCheckInIndex: index('idx_attendance_library_student_check_in_at').on(table.libraryId, table.studentId, table.checkInAt),
    openSessionIndex: index('idx_attendance_open').on(table.libraryId).where(sql `${table.checkOutAt} IS NULL`),
    libraryRangeIndex: index('idx_attendance_library_check_in_range').on(table.libraryId, table.checkInAt)
}));
//# sourceMappingURL=attendance-sessions.js.map