import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { memberships } from '../../db/schema/memberships.js';
import { membershipPlans } from '../../db/schema/membership-plans.js';
import { students } from '../../db/schema/students.js';

type Database = NodePgDatabase<typeof schema>;

export interface MembershipListParams {
  libraryId: string;
  studentId?: string;
  status?: 'active' | 'expired' | 'suspended' | 'cancelled';
  type?: 'monthly' | 'hourly';
  isCurrent?: boolean;
  offset: number;
  limit: number;
}

export interface MembershipWithRelations {
  id: string;
  libraryId: string;
  studentId: string;
  planId: string | null;
  type: 'monthly' | 'hourly';
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  startDate: string;
  endDate: string | null;
  hoursTotal: string | null;
  hoursUsed: string;
  hoursRemaining: string | null;
  isCurrent: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  planName: string | null;
  studentName: string | null;
}

export interface MembershipListResult {
  memberships: MembershipWithRelations[];
  total: number;
}

export class MembershipRepository {
  public constructor(private readonly db: Database) {}

  public async findById(membershipId: string, libraryId: string): Promise<MembershipWithRelations | null> {
    const rows = await this.db
      .select({
        id: memberships.id,
        libraryId: memberships.libraryId,
        studentId: memberships.studentId,
        planId: memberships.planId,
        type: memberships.type,
        status: memberships.status,
        startDate: memberships.startDate,
        endDate: memberships.endDate,
        hoursTotal: memberships.hoursTotal,
        hoursUsed: memberships.hoursUsed,
        hoursRemaining: memberships.hoursRemaining,
        isCurrent: memberships.isCurrent,
        createdBy: memberships.createdBy,
        createdAt: memberships.createdAt,
        updatedAt: memberships.updatedAt,
        planName: membershipPlans.name,
        studentName: students.name
      })
      .from(memberships)
      .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
      .leftJoin(students, eq(memberships.studentId, students.id))
      .where(and(eq(memberships.id, membershipId), eq(memberships.libraryId, libraryId)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findCurrentByStudent(studentId: string, libraryId: string): Promise<typeof memberships.$inferSelect | null> {
    const rows = await this.db
      .select()
      .from(memberships)
      .where(and(eq(memberships.studentId, studentId), eq(memberships.libraryId, libraryId), eq(memberships.isCurrent, true)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async list(params: MembershipListParams): Promise<MembershipListResult> {
    const conditions = [eq(memberships.libraryId, params.libraryId)];

    if (params.studentId) {
      conditions.push(eq(memberships.studentId, params.studentId));
    }

    if (params.status) {
      conditions.push(eq(memberships.status, params.status));
    }

    if (params.type) {
      conditions.push(eq(memberships.type, params.type));
    }

    if (params.isCurrent !== undefined) {
      conditions.push(eq(memberships.isCurrent, params.isCurrent));
    }

    const whereClause = and(...conditions);

    const [countResult, membershipRows] = await Promise.all([
      this.db
        .select({ total: sql`count(*)` })
        .from(memberships)
        .where(whereClause),
      this.db
        .select({
          id: memberships.id,
          libraryId: memberships.libraryId,
          studentId: memberships.studentId,
          planId: memberships.planId,
          type: memberships.type,
          status: memberships.status,
          startDate: memberships.startDate,
          endDate: memberships.endDate,
          hoursTotal: memberships.hoursTotal,
          hoursUsed: memberships.hoursUsed,
          hoursRemaining: memberships.hoursRemaining,
          isCurrent: memberships.isCurrent,
          createdBy: memberships.createdBy,
          createdAt: memberships.createdAt,
          updatedAt: memberships.updatedAt,
          planName: membershipPlans.name,
          studentName: students.name
        })
        .from(memberships)
        .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
        .leftJoin(students, eq(memberships.studentId, students.id))
        .where(whereClause)
        .orderBy(desc(memberships.createdAt))
        .limit(params.limit)
        .offset(params.offset)
    ]);

    const total = Number(countResult[0]?.total ?? 0);

    return {
      memberships: membershipRows.map((row) => ({
        ...row,
        startDate: row.startDate,
        endDate: row.endDate,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })),
      total
    };
  }

  public async create(
    input: {
      libraryId: string;
      studentId: string;
      planId: string | null;
      type: 'monthly' | 'hourly';
      startDate: string;
      endDate: string | null;
      hoursTotal: string | null;
      hoursRemaining: string | null;
      createdBy: string | null;
    },
    tx?: Database
  ): Promise<typeof memberships.$inferSelect> {
    const database = tx ?? this.db;

    await database
      .update(memberships)
      .set({ isCurrent: false, updatedAt: new Date() })
      .where(and(eq(memberships.studentId, input.studentId), eq(memberships.isCurrent, true)));

    const rows = await database
      .insert(memberships)
      .values({
        libraryId: input.libraryId,
        studentId: input.studentId,
        planId: input.planId,
        type: input.type,
        status: 'active',
        startDate: input.startDate,
        endDate: input.endDate,
        hoursTotal: input.hoursTotal ?? null,
        hoursUsed: '0',
        hoursRemaining: input.hoursRemaining ?? null,
        isCurrent: true,
        createdBy: input.createdBy
      })
      .returning();

    const created = rows[0];
    if (!created) {
      throw new Error('Failed to create membership');
    }

    return created;
  }

  public async update(
    membershipId: string,
    libraryId: string,
    data: {
      endDate?: string | null;
      hoursTotal?: string | null;
      hoursRemaining?: string | null;
    },
    tx?: Database
  ): Promise<typeof memberships.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(memberships)
      .set({
        ...data,
        hoursTotal: data.hoursTotal ?? undefined,
        updatedAt: new Date()
      })
      .where(and(eq(memberships.id, membershipId), eq(memberships.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }

  public async suspend(
    membershipId: string,
    libraryId: string,
    tx?: Database
  ): Promise<typeof memberships.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(memberships)
      .set({ status: 'suspended', updatedAt: new Date() })
      .where(and(eq(memberships.id, membershipId), eq(memberships.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }

  public async reactivate(
    membershipId: string,
    libraryId: string,
    newEndDate: string | null,
    tx?: Database
  ): Promise<typeof memberships.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(memberships)
      .set({
        status: 'active',
        endDate: newEndDate,
        updatedAt: new Date()
      })
      .where(and(eq(memberships.id, membershipId), eq(memberships.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }

  public async updateHours(
    membershipId: string,
    libraryId: string,
    hoursUsed: number,
    hoursRemaining: number,
    tx?: Database
  ): Promise<typeof memberships.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(memberships)
      .set({
        hoursUsed: hoursUsed.toFixed(2),
        hoursRemaining: hoursRemaining.toFixed(2),
        updatedAt: new Date()
      })
      .where(and(eq(memberships.id, membershipId), eq(memberships.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }

  public async setCurrent(
    membershipId: string,
    libraryId: string,
    isCurrent: boolean,
    tx?: Database
  ): Promise<typeof memberships.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(memberships)
      .set({ isCurrent, updatedAt: new Date() })
      .where(and(eq(memberships.id, membershipId), eq(memberships.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }
}