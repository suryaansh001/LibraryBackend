import { membershipStatusEnum, membershipTypeEnum } from '../../db/schema/memberships.js';
export const MembershipStatus = membershipStatusEnum.enumValues;
export const MembershipType = membershipTypeEnum.enumValues;
export function toMembershipResponseDTO(membership, planName) {
    const start = membership.startDate instanceof Date ? membership.startDate : new Date(membership.startDate);
    const end = membership.endDate ? (membership.endDate instanceof Date ? membership.endDate : new Date(membership.endDate)) : null;
    const created = membership.createdAt instanceof Date ? membership.createdAt : new Date(membership.createdAt);
    return {
        id: membership.id,
        studentId: membership.studentId,
        planId: membership.planId,
        planName,
        type: membership.type,
        status: membership.status,
        startDate: start.toISOString().split('T')[0] ?? '',
        endDate: end?.toISOString().split('T')[0] ?? null,
        hoursTotal: membership.hoursTotal !== null && membership.hoursTotal !== undefined ? Number(membership.hoursTotal) : null,
        hoursUsed: Number(membership.hoursUsed),
        hoursRemaining: membership.hoursRemaining !== null && membership.hoursRemaining !== undefined ? Number(membership.hoursRemaining) : null,
        isCurrent: membership.isCurrent,
        createdAt: created.toISOString()
    };
}
export function toMembershipListItemDTO(membership) {
    const start = membership.startDate instanceof Date ? membership.startDate : new Date(membership.startDate);
    const end = membership.endDate ? (membership.endDate instanceof Date ? membership.endDate : new Date(membership.endDate)) : null;
    return {
        id: membership.id,
        studentId: membership.studentId,
        planName: membership.planName,
        type: membership.type,
        status: membership.status,
        startDate: start.toISOString().split('T')[0] ?? '',
        endDate: end?.toISOString().split('T')[0] ?? null,
        hoursRemaining: membership.hoursRemaining !== null && membership.hoursRemaining !== undefined ? Number(membership.hoursRemaining) : null,
        isCurrent: membership.isCurrent
    };
}
//# sourceMappingURL=membership.dto.js.map