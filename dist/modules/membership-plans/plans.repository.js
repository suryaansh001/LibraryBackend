import { and, desc, eq, sql } from 'drizzle-orm';
import { membershipPlans } from '../../db/schema/membership-plans.js';
export class MembershipPlanRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(planId, libraryId) {
        const rows = await this.db
            .select()
            .from(membershipPlans)
            .where(and(eq(membershipPlans.id, planId), eq(membershipPlans.libraryId, libraryId)))
            .limit(1);
        return rows[0] ?? null;
    }
    async list(params) {
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
                .select({ total: sql `count(*)` })
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
    async create(input, tx) {
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
    async update(planId, libraryId, data, tx) {
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
    async toggleActive(planId, libraryId, isActive, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .update(membershipPlans)
            .set({ isActive, updatedAt: new Date() })
            .where(and(eq(membershipPlans.id, planId), eq(membershipPlans.libraryId, libraryId)))
            .returning();
        return rows[0] ?? null;
    }
    async delete(planId, libraryId, tx) {
        const database = tx ?? this.db;
        await database
            .delete(membershipPlans)
            .where(and(eq(membershipPlans.id, planId), eq(membershipPlans.libraryId, libraryId)));
    }
}
//# sourceMappingURL=plans.repository.js.map