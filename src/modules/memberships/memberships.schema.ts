import { z } from 'zod';

import { membershipStatusEnum, membershipTypeEnum } from '../../db/schema/memberships.js';
import { paginationQuerySchema } from '../../shared/utils/pagination.util.js';
import { uuidParamSchema } from '../../shared/utils/uuid.util.js';

export const membershipStatusSchema = z.enum(membershipStatusEnum.enumValues);
export const membershipTypeSchema = z.enum(membershipTypeEnum.enumValues);

export const createMembershipBodySchema = z.object({
  studentId: uuidParamSchema,
  planId: uuidParamSchema.optional(),
  type: membershipTypeSchema,
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  hoursTotal: z.string().optional(),
  hoursRemaining: z.string().optional()
}).strict();

export const updateMembershipBodySchema = z.object({
  endDate: z.string().date().nullable().optional(),
  hoursTotal: z.string().nullable().optional(),
  hoursRemaining: z.string().nullable().optional()
}).strict();

export const suspendMembershipBodySchema = z.object({
  reason: z.string().min(10).optional()
}).strict();

export const reactivateMembershipBodySchema = z.object({
  newEndDate: z.string().date().optional()
}).strict();

export const membershipListQuerySchema = paginationQuerySchema.extend({
  studentId: uuidParamSchema.optional(),
  status: membershipStatusSchema.optional(),
  type: membershipTypeSchema.optional(),
  isCurrent: z.coerce.boolean().optional()
});

export const membershipIdParamSchema = z.object({
  id: uuidParamSchema
});

export type CreateMembershipBody = z.infer<typeof createMembershipBodySchema>;
export type UpdateMembershipBody = z.infer<typeof updateMembershipBodySchema>;
export type SuspendMembershipBody = z.infer<typeof suspendMembershipBodySchema>;
export type ReactivateMembershipBody = z.infer<typeof reactivateMembershipBodySchema>;
export type MembershipListQuery = z.infer<typeof membershipListQuerySchema>;
export type MembershipIdParam = z.infer<typeof membershipIdParamSchema>;