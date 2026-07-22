import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { type MembershipResponseDTO, type MembershipListItemDTO } from '../../shared/dto/membership.dto.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type { CreateMembershipBody, UpdateMembershipBody, SuspendMembershipBody, ReactivateMembershipBody, MembershipListQuery } from './memberships.schema.js';
type Database = NodePgDatabase<typeof schema>;
export declare class MembershipService {
    private readonly db;
    private readonly membershipRepository;
    private readonly auditLogRepository;
    constructor(db: Database);
    createMembership(body: CreateMembershipBody, ctx: RequestContext, ipAddress?: string): Promise<MembershipResponseDTO>;
    listMemberships(query: MembershipListQuery, libraryId: string): Promise<{
        data: MembershipListItemDTO[];
        total: number;
    }>;
    getMembershipById(membershipId: string, libraryId: string): Promise<MembershipResponseDTO>;
    updateMembership(membershipId: string, body: UpdateMembershipBody, libraryId: string): Promise<MembershipResponseDTO>;
    suspendMembership(membershipId: string, body: SuspendMembershipBody, ctx: RequestContext, ipAddress?: string): Promise<MembershipResponseDTO>;
    reactivateMembership(membershipId: string, body: ReactivateMembershipBody, ctx: RequestContext, ipAddress?: string): Promise<MembershipResponseDTO>;
}
export {};
