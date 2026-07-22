export declare const MembershipPlanType: ["monthly", "hourly"];
export type MembershipPlanType = (typeof MembershipPlanType)[number];
export interface MembershipPlanResponseDTO {
    id: string;
    name: string;
    type: MembershipPlanType;
    price: number;
    durationDays: number | null;
    hoursIncluded: number | null;
    isActive: boolean;
    createdAt: string;
}
export interface MembershipPlanListItemDTO {
    id: string;
    name: string;
    type: MembershipPlanType;
    price: number;
    isActive: boolean;
}
export declare function toMembershipPlanResponseDTO(plan: {
    id: string;
    name: string;
    type: MembershipPlanType;
    price: string | number;
    durationDays: number | null;
    hoursIncluded: string | number | null;
    isActive: boolean;
    createdAt: Date;
}): MembershipPlanResponseDTO;
export declare function toMembershipPlanListItemDTO(plan: {
    id: string;
    name: string;
    type: MembershipPlanType;
    price: string | number;
    isActive: boolean;
}): MembershipPlanListItemDTO;
