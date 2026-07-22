import { membershipStatusEnum, membershipTypeEnum } from '../../db/schema/memberships.js';
import { z } from 'zod';

export const MembershipStatus = membershipStatusEnum.enumValues;
export type MembershipStatus = (typeof MembershipStatus)[number];

export const MembershipType = membershipTypeEnum.enumValues;
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

export function toMembershipResponseDTO(
  membership: {
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
  },
  planName: string | null
): MembershipResponseDTO {
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

export function toMembershipListItemDTO(membership: {
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
}): MembershipListItemDTO {
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