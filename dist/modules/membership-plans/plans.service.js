import { MembershipPlanRepository } from './plans.repository.js';
import { toMembershipPlanResponseDTO, toMembershipPlanListItemDTO } from '../../shared/dto/membership-plan.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
export class MembershipPlanService {
    planRepository;
    constructor(db) {
        this.planRepository = new MembershipPlanRepository(db);
    }
    async createPlan(body, ctx) {
        const plan = await this.planRepository.create({
            libraryId: ctx.libraryId,
            name: body.name,
            type: body.type,
            price: body.price.toString(),
            durationDays: body.durationDays ?? null,
            hoursIncluded: body.hoursIncluded?.toString() ?? null
        });
        return toMembershipPlanResponseDTO(plan);
    }
    async getPlanById(planId, libraryId) {
        const plan = await this.planRepository.findById(planId, libraryId);
        if (!plan) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
        }
        return toMembershipPlanResponseDTO(plan);
    }
    async updatePlan(planId, body, libraryId) {
        const existing = await this.planRepository.findById(planId, libraryId);
        if (!existing) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
        }
        const updated = await this.planRepository.update(planId, libraryId, {
            name: body.name,
            price: body.price?.toString(),
            durationDays: body.durationDays,
            hoursIncluded: body.hoursIncluded?.toString()
        });
        if (!updated) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
        }
        return toMembershipPlanResponseDTO(updated);
    }
    async togglePlan(planId, body, libraryId) {
        const existing = await this.planRepository.findById(planId, libraryId);
        if (!existing) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
        }
        const updated = await this.planRepository.toggleActive(planId, libraryId, body.isActive);
        if (!updated) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
        }
        return toMembershipPlanResponseDTO(updated);
    }
    async deletePlan(planId, libraryId) {
        const existing = await this.planRepository.findById(planId, libraryId);
        if (!existing) {
            throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
        }
        await this.planRepository.delete(planId, libraryId);
    }
    async listPlans(query, libraryId) {
        const offset = (query.page - 1) * query.limit;
        const result = await this.planRepository.list({
            libraryId,
            type: query.type,
            isActive: query.isActive,
            offset,
            limit: query.limit
        });
        return {
            data: result.plans.map(toMembershipPlanListItemDTO),
            total: result.total
        };
    }
}
//# sourceMappingURL=plans.service.js.map