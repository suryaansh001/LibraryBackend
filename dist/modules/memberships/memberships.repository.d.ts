import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { memberships } from '../../db/schema/memberships.js';
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
export declare class MembershipRepository {
    private readonly db;
    constructor(db: Database);
    findById(membershipId: string, libraryId: string): Promise<MembershipWithRelations | null>;
    findCurrentByStudent(studentId: string, libraryId: string): Promise<typeof memberships.$inferSelect | null>;
    list(params: MembershipListParams): Promise<MembershipListResult>;
    create(input: {
        libraryId: string;
        studentId: string;
        planId: string | null;
        type: 'monthly' | 'hourly';
        startDate: string;
        endDate: string | null;
        hoursTotal: string | null;
        hoursRemaining: string | null;
        createdBy: string | null;
    }, tx?: Database): Promise<typeof memberships.$inferSelect>;
    update(membershipId: string, libraryId: string, data: {
        endDate?: string | null;
        hoursTotal?: string | null;
        hoursRemaining?: string | null;
    }, tx?: Database): Promise<typeof memberships.$inferSelect | null>;
    suspend(membershipId: string, libraryId: string, tx?: Database): Promise<typeof memberships.$inferSelect | null>;
    reactivate(membershipId: string, libraryId: string, newEndDate: string | null, tx?: Database): Promise<typeof memberships.$inferSelect | null>;
    updateHours(membershipId: string, libraryId: string, hoursUsed: number, hoursRemaining: number, tx?: Database): Promise<typeof memberships.$inferSelect | null>;
    setCurrent(membershipId: string, libraryId: string, isCurrent: boolean, tx?: Database): Promise<typeof memberships.$inferSelect | null>;
}
export {};
