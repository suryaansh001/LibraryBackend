export declare const MembershipStatus: ["active", "expired", "suspended", "cancelled"];
export type MembershipStatus = (typeof MembershipStatus)[number];
export declare const MembershipType: ["monthly", "hourly"];
export type MembershipType = (typeof MembershipType)[number];
export interface MembershipResponseDTO {
    id: string;
    studentId: string;
    planId: string | null;
    planName: string | null;
    type: MembershipType;
    status: MembershipStatus;
    startDate: string;
    endDate: string | null;
    hoursTotal: number | null;
    hoursUsed: number;
    hoursRemaining: number | null;
    isCurrent: boolean;
    createdAt: string;
}
export interface MembershipListItemDTO {
    id: string;
    studentId: string;
    planName: string | null;
    type: MembershipType;
    status: MembershipStatus;
    startDate: string;
    endDate: string | null;
    hoursRemaining: number | null;
    isCurrent: boolean;
}
export declare function toMembershipResponseDTO(membership: {
    id: string;
    studentId: string;
    planId: string | null;
    type: MembershipType;
    status: MembershipStatus;
    startDate: Date | string;
    endDate: Date | string | null;
    hoursTotal: string | number | null;
    hoursUsed: string | number;
    hoursRemaining: string | number | null;
    isCurrent: boolean;
    createdAt: Date | string;
}, planName: string | null): MembershipResponseDTO;
export declare function toMembershipListItemDTO(membership: {
    id: string;
    studentId: string;
    planId: string | null;
    type: MembershipType;
    status: MembershipStatus;
    startDate: Date | string;
    endDate: Date | string | null;
    hoursRemaining: string | number | null;
    isCurrent: boolean;
    planName: string | null;
}): MembershipListItemDTO;
