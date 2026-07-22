import { membershipPlanTypeEnum } from '../../db/schema/membership-plans.js';
import { z } from 'zod';

export const MembershipPlanType = membershipPlanTypeEnum.enumValues;
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

export function toMembershipPlanResponseDTO(plan: {
  id: string;
  name: string;
  type: MembershipPlanType;
  price: string | number;
  durationDays: number | null;
  hoursIncluded: string | number | null;
  isActive: boolean;
  createdAt: Date;
}): MembershipPlanResponseDTO {
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

export function toMembershipPlanListItemDTO(plan: {
  id: string;
  name: string;
  type: MembershipPlanType;
  price: string | number;
  isActive: boolean;
}): MembershipPlanListItemDTO {
  return {
    id: plan.id,
    name: plan.name,
    type: plan.type,
    price: Number(plan.price),
    isActive: plan.isActive
  };
}