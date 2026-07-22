import { membershipPlanTypeEnum } from '../../db/schema/membership-plans.js';
export const MembershipPlanType = membershipPlanTypeEnum.enumValues;
export function toMembershipPlanResponseDTO(plan) {
    return {
        id: plan.id,
        name: plan.name,
        type: plan.type,
        price: Number(plan.price),
        durationDays: plan.durationDays,
        hoursIncluded: plan.hoursIncluded ? Number(plan.hoursIncluded) : null,
        isActive: plan.isActive,
        createdAt: plan.createdAt.toISOString()
    };
}
export function toMembershipPlanListItemDTO(plan) {
    return {
        id: plan.id,
        name: plan.name,
        type: plan.type,
        price: Number(plan.price),
        isActive: plan.isActive
    };
}
//# sourceMappingURL=membership-plan.dto.js.map