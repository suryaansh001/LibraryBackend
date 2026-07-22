import { and, desc, eq, isNull, isNotNull, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { attendanceSessions } from '../../db/schema/attendance-sessions.js';
import { libraryOccupancy } from '../../db/schema/library-occupancy.js';
import { memberships } from '../../db/schema/memberships.js';
import { seats } from '../../db/schema/seats.js';
import { students } from '../../db/schema/students.js';

export type Database = NodePgDatabase<typeof schema>;

export interface OpenSession {
  id: string;
  studentId: string;
  membershipId: string | null;
  checkInAt: Date;
  membershipType: string | null;
  membershipStatus: string | null;
  membershipEndDate: string | null;
  hoursRemaining: string | number | null;
}

export interface StudentWithSeat {
  id: string;
  name: string;
  seatId: string | null;
  qrToken: string;
  status: string;
}

export interface ActiveMembership {
  id: string;
  type: 'monthly' | 'hourly';
  status: string;
  endDate: string | null;
  hoursTotal: string | null;
  hoursUsed: string;
  hoursRemaining: string | null;
}

export interface OccupancyData {
  currentCount: number;
  capacity: number;
  availableFlexible: number;
}

export interface AttendanceListParams {
  libraryId: string;
  date?: string;
  studentId?: string;
  status?: 'active' | 'completed' | 'corrected';
  offset: number;
  limit: number;
}

export interface AttendanceListResult {
  sessions: (typeof attendanceSessions.$inferSelect & { studentName: string | null; seatNumber: string | null; membershipType: string | null })[];
  total: number;
}

export class AttendanceRepository {
  public constructor(private readonly db: Database) {}

  public async findOpenSessionByStudent(studentId: string, libraryId: string): Promise<OpenSession | null> {
    const rows = await this.db
      .select({
        id: attendanceSessions.id,
        studentId: attendanceSessions.studentId,
        membershipId: attendanceSessions.membershipId,
        checkInAt: attendanceSessions.checkInAt,
        membershipType: memberships.type,
        membershipStatus: memberships.status,
        membershipEndDate: memberships.endDate,
        membershipHoursRemaining: memberships.hoursRemaining
      })
      .from(attendanceSessions)
      .leftJoin(memberships, eq(attendanceSessions.membershipId, memberships.id))
      .where(and(
        eq(attendanceSessions.studentId, studentId),
        eq(attendanceSessions.libraryId, libraryId),
        isNull(attendanceSessions.checkOutAt)
      ))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      studentId: row.studentId,
      membershipId: row.membershipId ?? null,
      checkInAt: row.checkInAt,
      membershipType: row.membershipType ?? null,
      membershipStatus: row.membershipStatus ?? null,
      membershipEndDate: row.membershipEndDate ?? null,
      hoursRemaining: row.membershipHoursRemaining ?? null
    };
  }

  public async findStudentByQrToken(qrToken: string, libraryId: string): Promise<{ id: string; name: string; seatId: string | null; qrToken: string; status: string } | null> {
    const rows = await this.db
      .select({
        id: students.id,
        name: students.name,
        seatId: students.seatId,
        qrToken: students.qrToken,
        status: students.status
      })
      .from(students)
      .where(and(eq(students.qrToken, qrToken), eq(students.libraryId, libraryId), isNull(students.deletedAt)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return row;
  }

  public async findStudentById(studentId: string, libraryId: string): Promise<{ id: string; name: string; seatId: string | null; qrToken: string; status: string } | null> {
    const rows = await this.db
      .select({
        id: students.id,
        name: students.name,
        seatId: students.seatId,
        qrToken: students.qrToken,
        status: students.status
      })
      .from(students)
      .where(and(eq(students.id, studentId), eq(students.libraryId, libraryId), isNull(students.deletedAt)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return row;
  }

  public async findActiveMembership(studentId: string, libraryId: string): Promise<{ id: string; type: 'monthly' | 'hourly'; status: string; endDate: string | null; hoursTotal: string | null; hoursUsed: string; hoursRemaining: string | null } | null> {
    const rows = await this.db
      .select({
        id: memberships.id,
        type: memberships.type,
        status: memberships.status,
        endDate: memberships.endDate,
        hoursTotal: memberships.hoursTotal,
        hoursUsed: memberships.hoursUsed,
        hoursRemaining: memberships.hoursRemaining
      })
      .from(memberships)
      .where(and(
        eq(memberships.studentId, studentId),
        eq(memberships.libraryId, libraryId),
        eq(memberships.isCurrent, true)
      ))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return row;
  }

  public async findSeatById(seatId: string, libraryId: string) {
    const rows = await this.db
      .select()
      .from(seats)
      .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)))
      .limit(1);
    return rows[0] ?? null;
  }

  public async findAvailableFlexibleSeat(libraryId: string) {
    const rows = await this.db
      .select()
      .from(seats)
      .where(and(eq(seats.libraryId, libraryId), eq(seats.type, 'flexible'), eq(seats.status, 'available')))
      .limit(1);
    return rows[0] ?? null;
  }

  public async assignSeatToStudent(seatId: string, studentId: string, libraryId: string) {
    await this.db
      .update(students)
      .set({ seatId, updatedAt: new Date() })
      .where(and(eq(students.id, studentId), eq(students.libraryId, libraryId)));
  }

  public async updateSeatStatus(seatId: string, status: 'available' | 'occupied' | 'maintenance', libraryId: string) {
    await this.db
      .update(seats)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(seats.id, seatId), eq(seats.libraryId, libraryId)));
  }

  public async findSessionById(sessionId: string, libraryId: string): Promise<typeof attendanceSessions.$inferSelect | null> {
    const rows = await this.db
      .select()
      .from(attendanceSessions)
      .where(and(eq(attendanceSessions.id, sessionId), eq(attendanceSessions.libraryId, libraryId)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async createSession(
    input: {
      libraryId: string;
      studentId: string;
      membershipId: string | null;
      checkInAt: Date;
      checkInMethod: 'qr' | 'manual';
      checkInBy: string | null;
    },
    tx?: Database
  ): Promise<typeof attendanceSessions.$inferSelect> {
    const database = tx ?? this.db;
    const rows = await database
      .insert(attendanceSessions)
      .values({
        libraryId: input.libraryId,
        studentId: input.studentId,
        membershipId: input.membershipId,
        checkInAt: input.checkInAt,
        checkInMethod: input.checkInMethod,
        checkInBy: input.checkInBy,
        updatedAt: input.checkInAt
      })
      .returning();

    const created = rows[0];
    if (!created) throw new Error('Failed to create attendance session');
    return created;
  }

  public async checkOut(
    sessionId: string,
    libraryId: string,
    data: {
      checkOutAt: Date;
      durationMinutes: number;
      checkOutMethod: 'qr' | 'manual' | 'auto' | 'forgot';
      checkOutBy: string | null;
      membershipId: string | null;
      hoursUsed?: number;
    },
    tx?: Database
  ): Promise<typeof attendanceSessions.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(attendanceSessions)
      .set({
        checkOutAt: data.checkOutAt,
        durationMinutes: data.durationMinutes,
        checkOutMethod: data.checkOutMethod,
        checkOutBy: data.checkOutBy,
        updatedAt: new Date()
      })
      .where(and(
        eq(attendanceSessions.id, sessionId),
        eq(attendanceSessions.libraryId, libraryId),
        isNull(attendanceSessions.checkOutAt)
      ))
      .returning();

    return rows[0] ?? null;
  }

  public async correctSession(
    sessionId: string,
    libraryId: string,
    data: {
      checkInAt?: Date;
      checkOutAt?: Date | null;
      durationMinutes?: number;
      checkInMethod?: 'qr' | 'manual';
      checkOutMethod?: 'qr' | 'manual' | 'auto' | 'forgot' | null;
      isManualCorrection: boolean;
      correctionReason: string;
      checkOutBy?: string | null;
    },
    tx?: Database
  ): Promise<typeof attendanceSessions.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(attendanceSessions)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(and(eq(attendanceSessions.id, sessionId), eq(attendanceSessions.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }

  public async list(params: AttendanceListParams): Promise<AttendanceListResult> {
    const conditions = [eq(attendanceSessions.libraryId, params.libraryId)];

    if (params.date) {
      const startOfDay = new Date(params.date + 'T00:00:00.000Z');
      const endOfDay = new Date(params.date + 'T23:59:59.999Z');
      conditions.push(sql`${attendanceSessions.checkInAt} >= ${startOfDay}`);
      conditions.push(sql`${attendanceSessions.checkInAt} <= ${endOfDay}`);
    }

    if (params.studentId) {
      conditions.push(eq(attendanceSessions.studentId, params.studentId));
    }

    if (params.status) {
      if (params.status === 'active') {
        conditions.push(isNull(attendanceSessions.checkOutAt));
      } else if (params.status === 'completed') {
        conditions.push(isNotNull(attendanceSessions.checkOutAt));
      } else if (params.status === 'corrected') {
        conditions.push(eq(attendanceSessions.isManualCorrection, true));
      }
    }

    const whereClause = and(...conditions);

    const [countResult, sessionRows] = await Promise.all([
      this.db
        .select({ total: sql`count(*)` })
        .from(attendanceSessions)
        .where(whereClause),
      this.db
        .select({
          id: attendanceSessions.id,
          libraryId: attendanceSessions.libraryId,
          studentId: attendanceSessions.studentId,
          membershipId: attendanceSessions.membershipId,
          checkInAt: attendanceSessions.checkInAt,
          checkOutAt: attendanceSessions.checkOutAt,
          durationMinutes: attendanceSessions.durationMinutes,
          checkInMethod: attendanceSessions.checkInMethod,
          checkOutMethod: attendanceSessions.checkOutMethod,
          checkInBy: attendanceSessions.checkInBy,
          checkOutBy: attendanceSessions.checkOutBy,
          isManualCorrection: attendanceSessions.isManualCorrection,
          correctionReason: attendanceSessions.correctionReason,
          createdAt: attendanceSessions.createdAt,
          updatedAt: attendanceSessions.updatedAt,
          studentName: students.name,
          seatNumber: seats.seatNumber,
          membershipType: memberships.type
        })
        .from(attendanceSessions)
        .leftJoin(students, eq(attendanceSessions.studentId, students.id))
        .leftJoin(seats, eq(students.seatId, seats.id))
        .leftJoin(memberships, eq(attendanceSessions.membershipId, memberships.id))
        .where(whereClause)
        .orderBy(desc(attendanceSessions.checkInAt))
        .limit(params.limit)
        .offset(params.offset)
    ]);

    const total = Number(countResult[0]?.total ?? 0);

    return {
      sessions: sessionRows,
      total
    };
  }

  public async getOpenSessionsByLibrary(libraryId: string): Promise<typeof attendanceSessions.$inferSelect[]> {
    return this.db
      .select()
      .from(attendanceSessions)
      .where(and(eq(attendanceSessions.libraryId, libraryId), isNull(attendanceSessions.checkOutAt)));
  }

  public async getLiveOccupancy(libraryId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql`count(*)` })
      .from(attendanceSessions)
      .where(and(eq(attendanceSessions.libraryId, libraryId), isNull(attendanceSessions.checkOutAt)));

    return Number(result[0]?.count ?? 0);
  }

  public async getOccupancy(libraryId: string): Promise<{ currentCount: number; capacity: number; availableFlexible: number }> {
    const [occupancyResult, totalFlexibleResult, occupiedFlexibleResult] = await Promise.all([
      this.db
        .select({ currentCount: libraryOccupancy.currentCount, capacity: libraryOccupancy.capacity })
        .from(libraryOccupancy)
        .where(eq(libraryOccupancy.libraryId, libraryId))
        .limit(1),
      this.db
        .select({ count: sql`count(*)` })
        .from(seats)
        .where(and(eq(seats.libraryId, libraryId), eq(seats.type, 'flexible')))
        .limit(1),
      this.db
        .select({ count: sql`count(*)` })
        .from(seats)
        .where(and(eq(seats.libraryId, libraryId), eq(seats.type, 'flexible'), eq(seats.status, 'occupied')))
        .limit(1)
    ]);

    const occupancy = occupancyResult[0];
    const currentCount = occupancy?.currentCount ?? 0;
    const capacity = occupancy?.capacity ?? 100;
    const totalFlexibleCount = Number(totalFlexibleResult[0]?.count ?? 0);
    const occupiedFlexibleCount = Number(occupiedFlexibleResult[0]?.count ?? 0);

    return {
      currentCount,
      capacity,
      availableFlexible: Math.max(0, totalFlexibleCount - occupiedFlexibleCount)
    };
  }
}