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
export declare class MembershipPlanRepository {
    private readonly db;
    constructor(db: Database);
    findById(planId: string, libraryId: string): Promise<typeof membershipPlans.$inferSelect | null>;
    list(params: PlanListParams): Promise<PlanListResult>;
    create(input: {
        libraryId: string;
        name: string;
        type: 'monthly' | 'hourly';
        price: string;
        durationDays?: number | null;
        hoursIncluded?: string | null;
    }, tx?: Database): Promise<typeof membershipPlans.$inferSelect>;
    update(planId: string, libraryId: string, data: {
        name?: string;
        price?: string;
        durationDays?: number | null;
        hoursIncluded?: string | null;
    }, tx?: Database): Promise<typeof membershipPlans.$inferSelect | null>;
    toggleActive(planId: string, libraryId: string, isActive: boolean, tx?: Database): Promise<typeof membershipPlans.$inferSelect | null>;
    delete(planId: string, libraryId: string, tx?: Database): Promise<void>;
}
export {};
