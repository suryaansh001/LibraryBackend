import { type MembershipPlanResponseDTO, type MembershipPlanListItemDTO } from '../../shared/dto/membership-plan.dto.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type { CreatePlanBody, UpdatePlanBody, TogglePlanBody, PlanListQuery } from './plans.schema.js';
export declare class MembershipPlanService {
    private readonly planRepository;
    constructor(db: typeof import('../../config/database.js').db);
    createPlan(body: CreatePlanBody, ctx: RequestContext): Promise<MembershipPlanResponseDTO>;
    getPlanById(planId: string, libraryId: string): Promise<MembershipPlanResponseDTO>;
    updatePlan(planId: string, body: UpdatePlanBody, libraryId: string): Promise<MembershipPlanResponseDTO>;
    togglePlan(planId: string, body: TogglePlanBody, libraryId: string): Promise<MembershipPlanResponseDTO>;
    deletePlan(planId: string, libraryId: string): Promise<void>;
    listPlans(query: PlanListQuery, libraryId: string): Promise<{
        data: MembershipPlanListItemDTO[];
        total: number;
    }>;
}
