import { and, desc, eq, ilike, isNull, or } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { seats } from '../../db/schema/seats.js';
import { students } from '../../db/schema/students.js';

type Database = NodePgDatabase<typeof schema>;

export interface SeatListParams {
  libraryId: string;
  status?: 'available' | 'occupied' | 'maintenance';
  type?: 'fixed' | 'flexible';
  search?: string;
  offset: number;
  limit: number;
}

export interface SeatListResult {
  seats: (typeof seats.$inferSelect)[];
  total: number;
}

export class SeatRepository {
  public constructor(private readonly db: Database) {}

  public async findById(seatId: string, libraryId: string): Promise<typeof seats.$inferSelect | null> {
    const rows = await this.db
      .select()
      .from(seats)
      .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findBySeatNumber(seatNumber: string, libraryId: string): Promise<typeof seats.$inferSelect | null> {
    const rows = await this.db
      .select()
      .from(seats)
      .where(and(eq(seats.seatNumber, seatNumber), eq(seats.libraryId, libraryId)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async list(params: SeatListParams): Promise<SeatListResult> {
    const conditions = [eq(seats.libraryId, params.libraryId)];

    if (params.status) {
      conditions.push(eq(seats.status, params.status));
    }

    if (params.type) {
      conditions.push(eq(seats.type, params.type));
    }

    if (params.search && params.search.length > 0) {
      const searchTerm = params.search.trim();
      conditions.push(
        or(
          ilike(seats.seatNumber, `%${searchTerm}%`),
          ilike(seats.section, `%${searchTerm}%`)
        )!
      );
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

  public async create(
    input: {
      libraryId: string;
      seatNumber: string;
      section: string | null;
      type: 'fixed' | 'flexible';
    },
    tx?: Database
  ): Promise<typeof seats.$inferSelect> {
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

  public async update(
    seatId: string,
    libraryId: string,
    data: {
      seatNumber?: string;
      section?: string | null;
      type?: 'fixed' | 'flexible';
    },
    tx?: Database
  ): Promise<typeof seats.$inferSelect | null> {
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

  public async updateStatus(
    seatId: string,
    libraryId: string,
    status: 'available' | 'occupied' | 'maintenance',
    tx?: Database
  ): Promise<typeof seats.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(seats)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }

  public async assignStudent(
    seatId: string,
    libraryId: string,
    studentId: string,
    tx?: Database
  ): Promise<typeof seats.$inferSelect | null> {
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

  public async unassignStudent(
    seatId: string,
    libraryId: string,
    tx?: Database
  ): Promise<typeof seats.$inferSelect | null> {
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

  public async delete(seatId: string, libraryId: string, tx?: Database): Promise<void> {
    const database = tx ?? this.db;
    await database
      .delete(seats)
      .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)));
  }

  public async getLiveOccupancy(libraryId: string): Promise<{
    currentCount: number;
    capacity: number;
    availableFlexible: number;
    seats: Array<{ seatNumber: string; status: 'available' | 'occupied' | 'maintenance' }>;
  }> {
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