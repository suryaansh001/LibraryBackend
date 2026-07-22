import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { membershipPlans } from '../../db/schema/membership-plans.js';

type Database = NodePgDatabase<typeof schema>;

export interface PlanListParams {
  libraryId: string;
  type?: 'monthly' | 'hourly';
  isActive?: boolean;
  offset: number;
  limit: number;
}

export interface PlanListResult {
  plans: (typeof membershipPlans.$inferSelect)[];
  total: number;
}

export class MembershipPlanRepository {
  public constructor(private readonly db: Database) {}

  public async findById(planId: string, libraryId: string): Promise<typeof membershipPlans.$inferSelect | null> {
    const rows = await this.db
      .select()
      .from(membershipPlans)
      .where(and(eq(membershipPlans.id, planId), eq(membershipPlans.libraryId, libraryId)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async list(params: PlanListParams): Promise<PlanListResult> {
    const conditions = [eq(membershipPlans.libraryId, params.libraryId)];

    if (params.type !== undefined) {
      conditions.push(eq(membershipPlans.type, params.type));
    }

    if (params.isActive !== undefined) {
      conditions.push(eq(membershipPlans.isActive, params.isActive));
    }

    const whereClause = and(...conditions);

    const [countResult, planRows] = await Promise.all([
      this.db
        .select({ total: sql`count(*)` })
        .from(membershipPlans)
        .where(whereClause),
      this.db
        .select()
        .from(membershipPlans)
        .where(whereClause)
        .orderBy(desc(membershipPlans.createdAt))
        .limit(params.limit)
        .offset(params.offset)
    ]);

    const total = Number(countResult[0]?.total ?? 0);

    return {
      plans: planRows,
      total
    };
  }

  public async create(
    input: {
      libraryId: string;
      name: string;
      type: 'monthly' | 'hourly';
      price: string;
      durationDays?: number | null;
      hoursIncluded?: string | null;
    },
    tx?: Database
  ): Promise<typeof membershipPlans.$inferSelect> {
    const database = tx ?? this.db;
    const rows = await database
      .insert(membershipPlans)
      .values({
        libraryId: input.libraryId,
        name: input.name,
        type: input.type,
        price: input.price,
        durationDays: input.durationDays ?? null,
        hoursIncluded: input.hoursIncluded ?? null
      })
      .returning();

    const created = rows[0];
    if (created === undefined) {
      throw new Error('Failed to create membership plan');
    }

    return created;
  }

  public async update(
    planId: string,
    libraryId: string,
    data: {
      name?: string;
      price?: string;
      durationDays?: number | null;
      hoursIncluded?: string | null;
    },
    tx?: Database
  ): Promise<typeof membershipPlans.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(membershipPlans)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(and(eq(membershipPlans.id, planId), eq(membershipPlans.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }

  public async toggleActive(
    planId: string,
    libraryId: string,
    isActive: boolean,
    tx?: Database
  ): Promise<typeof membershipPlans.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(membershipPlans)
      .set({ isActive, updatedAt: new Date() })
      .where(and(eq(membershipPlans.id, planId), eq(membershipPlans.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }

  public async delete(planId: string, libraryId: string, tx?: Database): Promise<void> {
    const database = tx ?? this.db;
    await database
      .delete(membershipPlans)
      .where(and(eq(membershipPlans.id, planId), eq(membershipPlans.libraryId, libraryId)));
  }
}