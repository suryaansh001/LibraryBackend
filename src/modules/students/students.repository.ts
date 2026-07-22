import { and, count, eq, ilike, isNull, or, sql, desc, type SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { students } from '../../db/schema/students.js';
import { seats } from '../../db/schema/seats.js';
import { memberships } from '../../db/schema/memberships.js';
import { attendanceSessions } from '../../db/schema/attendance-sessions.js';
import { payments } from '../../db/schema/payments.js';
import type { StudentWithRelations } from '../../shared/dto/student.dto.js';

type Database = NodePgDatabase<typeof schema>;

export interface StudentListParams {
  libraryId: string;
  search?: string;
  status?: 'active' | 'suspended' | 'expired' | 'inactive';
  membershipType?: 'monthly' | 'hourly';
  seatId?: string;
  includeDeleted?: boolean;
  offset: number;
  limit: number;
}

export interface StudentListResult {
  students: StudentWithRelations[];
  total: number;
}

export class StudentRepository {
  public constructor(private readonly db: Database) {}

  public async findCurrentStudentByEmail(email: string, libraryId: string): Promise<StudentWithRelations | null> {
    const rows = await this.db
      .select({
        id: students.id,
        name: students.name,
        phone: students.phone,
        email: students.email,
        photoUrl: students.photoUrl,
        status: students.status,
        seatNumber: seats.seatNumber,
        membershipType: memberships.type,
        membershipStatus: memberships.status,
        membershipEndDate: memberships.endDate,
        hoursRemaining: memberships.hoursRemaining,
        customFields: students.customFields,
        createdAt: students.createdAt,
        qrToken: students.qrToken
      })
      .from(students)
      .leftJoin(seats, eq(students.seatId, seats.id))
      .leftJoin(
        memberships,
        and(eq(memberships.studentId, students.id), eq(memberships.isCurrent, true))
      )
      .where(
        and(
          eq(students.libraryId, libraryId),
          isNull(students.deletedAt),
          eq(students.email, email)
        )
      )
      .limit(1);

    return rows[0] ?? null;
  }

  /**
   * Find a single student by ID with seat and current membership data.
   * Always filters by library_id and deleted_at IS NULL.
   */
  public async findById(studentId: string, libraryId: string): Promise<StudentWithRelations | null> {
    const rows = await this.db
      .select({
        id: students.id,
        name: students.name,
        phone: students.phone,
        email: students.email,
        photoUrl: students.photoUrl,
        status: students.status,
        seatNumber: seats.seatNumber,
        membershipType: memberships.type,
        membershipStatus: memberships.status,
        membershipEndDate: memberships.endDate,
        hoursRemaining: memberships.hoursRemaining,
        customFields: students.customFields,
        createdAt: students.createdAt,
        qrToken: students.qrToken
      })
      .from(students)
      .leftJoin(seats, eq(students.seatId, seats.id))
      .leftJoin(
        memberships,
        and(eq(memberships.studentId, students.id), eq(memberships.isCurrent, true))
      )
      .where(
        and(
          eq(students.id, studentId),
          eq(students.libraryId, libraryId),
          isNull(students.deletedAt)
        )
      )
      .limit(1);

    return rows[0] ?? null;
  }

  /**
   * Find a student by ID including deleted students (for owner-only operations).
   */
  public async findByIdIncludeDeleted(studentId: string, libraryId: string): Promise<StudentWithRelations | null> {
    const rows = await this.db
      .select({
        id: students.id,
        name: students.name,
        phone: students.phone,
        email: students.email,
        photoUrl: students.photoUrl,
        status: students.status,
        seatNumber: seats.seatNumber,
        membershipType: memberships.type,
        membershipStatus: memberships.status,
        membershipEndDate: memberships.endDate,
        hoursRemaining: memberships.hoursRemaining,
        customFields: students.customFields,
        createdAt: students.createdAt,
        qrToken: students.qrToken
      })
      .from(students)
      .leftJoin(seats, eq(students.seatId, seats.id))
      .leftJoin(
        memberships,
        and(eq(memberships.studentId, students.id), eq(memberships.isCurrent, true))
      )
      .where(and(eq(students.id, studentId), eq(students.libraryId, libraryId)))
      .limit(1);

    return rows[0] ?? null;
  }

  /**
   * Search and list students with filtering, pagination, and optional search.
   * Uses pg_trgm for fuzzy name search, with phone-first priority.
   */
  public async list(params: StudentListParams): Promise<StudentListResult> {
    const conditions: SQL[] = [eq(students.libraryId, params.libraryId)];

    if (!params.includeDeleted) {
      conditions.push(isNull(students.deletedAt));
    }

    if (params.status !== undefined) {
      conditions.push(eq(students.status, params.status));
    }

    if (params.seatId !== undefined) {
      conditions.push(eq(students.seatId, params.seatId));
    }

    // Search logic with phone-first priority
    if (params.search !== undefined && params.search.length > 0) {
      const searchTerm = params.search.trim();
      const isPhoneSearch = /^[+\d][\d\s-]*$/.test(searchTerm);

      if (isPhoneSearch) {
        // Phone search: exact match first, then prefix
        conditions.push(
          or(
            eq(students.phone, searchTerm),
            ilike(students.phone, `${searchTerm}%`)
          )!
        );
      } else {
        // Name search: exact case-insensitive, then trigram similarity
        conditions.push(
          or(
            ilike(students.name, `%${searchTerm}%`),
            sql`${students.name} % ${searchTerm}`
          )!
        );
      }
    }

    const whereClause = and(...conditions);

    // Membership type filter requires a subquery approach
    let membershipTypeCondition: SQL | undefined;
    if (params.membershipType !== undefined) {
      membershipTypeCondition = sql`EXISTS (
        SELECT 1 FROM ${memberships}
        WHERE ${memberships.studentId} = ${students.id}
          AND ${memberships.isCurrent} = true
          AND ${memberships.type} = ${params.membershipType}
      )`;
    }

    const fullWhere = membershipTypeCondition !== undefined
      ? and(whereClause, membershipTypeCondition)
      : whereClause;

    const [countResult, studentRows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(students)
        .where(fullWhere),
      this.db
        .select({
          id: students.id,
          name: students.name,
          phone: students.phone,
          email: students.email,
          photoUrl: students.photoUrl,
          status: students.status,
          seatNumber: seats.seatNumber,
          membershipType: memberships.type,
          membershipStatus: memberships.status,
          membershipEndDate: memberships.endDate,
          hoursRemaining: memberships.hoursRemaining,
          customFields: students.customFields,
          createdAt: students.createdAt,
          qrToken: students.qrToken
        })
        .from(students)
        .leftJoin(seats, eq(students.seatId, seats.id))
        .leftJoin(
          memberships,
          and(eq(memberships.studentId, students.id), eq(memberships.isCurrent, true))
        )
        .where(fullWhere)
        .orderBy(desc(students.createdAt))
        .limit(params.limit)
        .offset(params.offset)
    ]);

    const total = countResult[0]?.total ?? 0;

    return {
      students: studentRows,
      total
    };
  }

  /**
   * Create a new student. Returns the raw DB row.
   */
  public async create(
    input: {
      id?: string;
      libraryId: string;
      name: string;
      phone: string;
      email?: string;
      photoUrl?: string;
      status?: 'active' | 'suspended' | 'expired' | 'inactive';
      seatId?: string;
      qrToken: string;
      customFields?: Record<string, unknown>;
      notes?: string;
      createdBy?: string;
    },
    tx?: Database
  ): Promise<typeof students.$inferSelect> {
    const database = tx ?? this.db;
    const rows = await database
      .insert(students)
      .values({
        id: input.id,
        libraryId: input.libraryId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        photoUrl: input.photoUrl,
        status: input.status ?? 'active',
        seatId: input.seatId,
        qrToken: input.qrToken,
        customFields: input.customFields ?? {},
        notes: input.notes,
        createdBy: input.createdBy
      })
      .returning();

    const created = rows[0];
    if (created === undefined) {
      throw new Error('Failed to create student');
    }

    return created;
  }

  /**
   * Update a student's fields.
   */
  public async update(
    studentId: string,
    libraryId: string,
    data: {
      name?: string;
      phone?: string;
      email?: string | null;
      photoUrl?: string | null;
      seatId?: string | null;
      customFields?: Record<string, unknown>;
      notes?: string | null;
    },
    tx?: Database
  ): Promise<typeof students.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(students)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(students.id, studentId),
          eq(students.libraryId, libraryId),
          isNull(students.deletedAt)
        )
      )
      .returning();

    return rows[0] ?? null;
  }

  /**
   * Update only the student's status.
   */
  public async updateStatus(
    studentId: string,
    libraryId: string,
    status: 'active' | 'suspended' | 'expired' | 'inactive',
    tx?: Database
  ): Promise<typeof students.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(students)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(students.id, studentId),
          eq(students.libraryId, libraryId),
          isNull(students.deletedAt)
        )
      )
      .returning();

    return rows[0] ?? null;
  }

  /**
   * Soft delete a student by setting deleted_at.
   * Students are NEVER permanently deleted.
   */
  public async softDelete(
    studentId: string,
    libraryId: string,
    tx?: Database
  ): Promise<typeof students.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(students)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(students.id, studentId),
          eq(students.libraryId, libraryId),
          isNull(students.deletedAt)
        )
      )
      .returning();

    return rows[0] ?? null;
  }

  /**
   * Update the QR token for a student.
   */
  public async updateQrToken(
    studentId: string,
    libraryId: string,
    qrToken: string,
    tx?: Database
  ): Promise<typeof students.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(students)
      .set({ qrToken, updatedAt: new Date() })
      .where(
        and(
          eq(students.id, studentId),
          eq(students.libraryId, libraryId),
          isNull(students.deletedAt)
        )
      )
      .returning();

    return rows[0] ?? null;
  }

  /**
   * Get attendance history for a student.
   */
  public async getHistory(
    studentId: string,
    libraryId: string,
    offset: number,
    limit: number
  ): Promise<{ sessions: (typeof attendanceSessions.$inferSelect)[]; total: number }> {
    const whereClause = and(
      eq(attendanceSessions.studentId, studentId),
      eq(attendanceSessions.libraryId, libraryId)
    );

    const [countResult, sessionRows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(attendanceSessions)
        .where(whereClause),
      this.db
        .select()
        .from(attendanceSessions)
        .where(whereClause)
        .orderBy(desc(attendanceSessions.checkInAt))
        .limit(limit)
        .offset(offset)
    ]);

    return {
      sessions: sessionRows,
      total: countResult[0]?.total ?? 0
    };
  }

  /**
   * Get payments for a student.
   */
  public async getPayments(
    studentId: string,
    libraryId: string,
    offset: number,
    limit: number
  ): Promise<{ payments: (typeof payments.$inferSelect)[]; total: number }> {
    const whereClause = and(
      eq(payments.studentId, studentId),
      eq(payments.libraryId, libraryId)
    );

    const [countResult, paymentRows] = await Promise.all([
      this.db
        .select({ total: count() })
        .from(payments)
        .where(whereClause),
      this.db
        .select()
        .from(payments)
        .where(whereClause)
        .orderBy(desc(payments.createdAt))
        .limit(limit)
        .offset(offset)
    ]);

    return {
      payments: paymentRows,
      total: countResult[0]?.total ?? 0
    };
  }

  /**
   * Find student by QR token + library_id. Single indexed lookup for performance.
   */
  public async findByQrToken(qrToken: string, libraryId: string): Promise<StudentWithRelations | null> {
    const rows = await this.db
      .select({
        id: students.id,
        name: students.name,
        phone: students.phone,
        email: students.email,
        photoUrl: students.photoUrl,
        status: students.status,
        seatNumber: seats.seatNumber,
        membershipType: memberships.type,
        membershipStatus: memberships.status,
        membershipEndDate: memberships.endDate,
        hoursRemaining: memberships.hoursRemaining,
        customFields: students.customFields,
        createdAt: students.createdAt,
        qrToken: students.qrToken
      })
      .from(students)
      .leftJoin(seats, eq(students.seatId, seats.id))
      .leftJoin(
        memberships,
        and(eq(memberships.studentId, students.id), eq(memberships.isCurrent, true))
      )
      .where(
        and(
          eq(students.qrToken, qrToken),
          eq(students.libraryId, libraryId),
          isNull(students.deletedAt)
        )
      )
      .limit(1);

    return rows[0] ?? null;
  }
}
