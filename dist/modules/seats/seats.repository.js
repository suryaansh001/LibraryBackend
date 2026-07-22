import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { seats } from '../../db/schema/seats.js';
import { students } from '../../db/schema/students.js';
export class SeatRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(seatId, libraryId) {
        const rows = await this.db
            .select()
            .from(seats)
            .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
            .limit(1);
        return rows[0] ?? null;
    }
    async findBySeatNumber(seatNumber, libraryId) {
        const rows = await this.db
            .select()
            .from(seats)
            .where(and(eq(seats.seatNumber, seatNumber), eq(seats.libraryId, libraryId)))
            .limit(1);
        return rows[0] ?? null;
    }
    async list(params) {
        const conditions = [eq(seats.libraryId, params.libraryId)];
        if (params.status) {
            conditions.push(eq(seats.status, params.status));
        }
        if (params.type) {
            conditions.push(eq(seats.type, params.type));
        }
        if (params.search && params.search.length > 0) {
            const searchTerm = params.search.trim();
            conditions.push(or(ilike(seats.seatNumber, `%${searchTerm}%`), ilike(seats.section, `%${searchTerm}%`)));
        }
        const whereClause = and(...conditions);
        const [countResult, seatRows] = await Promise.all([
            this.db
                .select({ total: count() })
                .from(seats)
                .where(whereClause),
            this.db
                .select()
                .from(seats)
                .where(whereClause)
                .orderBy(desc(seats.seatNumber))
                .limit(params.limit)
                .offset(params.offset)
        ]);
        const total = countResult[0]?.total ?? 0;
        return {
            seats: seatRows,
            total
        };
    }
    async create(input, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .insert(seats)
            .values({
            libraryId: input.libraryId,
            seatNumber: input.seatNumber,
            section: input.section,
            type: input.type,
            status: 'available'
        })
            .returning();
        const created = rows[0];
        if (!created) {
            throw new Error('Failed to create seat');
        }
        return created;
    }
    async update(seatId, libraryId, data, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .update(seats)
            .set({
            ...data,
            updatedAt: new Date()
        })
            .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
            .returning();
        return rows[0] ?? null;
    }
    async updateStatus(seatId, libraryId, status, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .update(seats)
            .set({ status, updatedAt: new Date() })
            .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
            .returning();
        return rows[0] ?? null;
    }
    async assignStudent(seatId, libraryId, studentId, tx) {
        const database = tx ?? this.db;
        const seat = await database
            .select()
            .from(seats)
            .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
            .limit(1);
        if (seat[0] === undefined) {
            return null;
        }
        if (seat[0].status !== 'available') {
            throw new Error('Seat is not available for assignment');
        }
        await database
            .update(students)
            .set({ seatId, updatedAt: new Date() })
            .where(and(eq(students.id, studentId), eq(students.libraryId, libraryId)));
        const rows = await database
            .update(seats)
            .set({ status: 'occupied', updatedAt: new Date() })
            .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
            .returning();
        return rows[0] ?? null;
    }
    async unassignStudent(seatId, libraryId, tx) {
        const database = tx ?? this.db;
        const seat = await database
            .select()
            .from(seats)
            .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
            .limit(1);
        if (seat[0] === undefined) {
            return null;
        }
        if (seat[0].status !== 'occupied') {
            return null;
        }
        await database
            .update(students)
            .set({ seatId: null, updatedAt: new Date() })
            .where(and(eq(students.seatId, seatId), eq(students.libraryId, libraryId)));
        const rows = await database
            .update(seats)
            .set({ status: 'available', updatedAt: new Date() })
            .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
            .returning();
        return rows[0] ?? null;
    }
    async delete(seatId, libraryId, tx) {
        const database = tx ?? this.db;
        await database
            .delete(seats)
            .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)));
    }
    async getLiveOccupancy(libraryId) {
        const seatRows = await this.db
            .select({
            seatNumber: seats.seatNumber,
            status: seats.status,
            type: seats.type
        })
            .from(seats)
            .where(eq(seats.libraryId, libraryId));
        const currentCount = seatRows.filter((s) => s.status === 'occupied').length;
        const capacity = seatRows.length;
        const availableFlexible = seatRows.filter((s) => s.type === 'flexible' && s.status === 'available').length;
        return {
            currentCount,
            capacity,
            availableFlexible,
            seats: seatRows.map((s) => ({
                seatNumber: s.seatNumber,
                status: s.status
            }))
        };
    }
}
import { count } from 'drizzle-orm';
//# sourceMappingURL=seats.repository.js.map