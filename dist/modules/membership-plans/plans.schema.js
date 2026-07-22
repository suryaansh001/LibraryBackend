import { z } from 'zod';
import { membershipPlanTypeEnum } from '../../db/schema/membership-plans.js';
import { paginationQuerySchema } from '../../shared/utils/pagination.util.js';
import { uuidParamSchema } from '../../shared/utils/uuid.util.js';
export const membershipPlanTypeSchema = z.enum(membershipPlanTypeEnum.enumValues);
export const createPlanBodySchema = z.object({
    name: z.string().trim().min(1).max(100),
    type: membershipPlanTypeSchema,
    price: z.number().nonnegative(),
    durationDays: z.number().int().positive().optional(),
    hoursIncluded: z.number().nonnegative().optional()
}).strict();
export const updatePlanBodySchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    price: z.number().nonnegative().optional(),
    durationDays: z.number().int().positive().nullable().optional(),
    hoursIncluded: z.number().nonnegative().nullable().optional()
}).strict();
export const togglePlanBodySchema = z.object({
    isActive: z.boolean()
}).strict();
export const planListQuerySchema = paginationQuerySchema.extend({
    type: membershipPlanTypeSchema.optional(),
    isActive: z.coerce.boolean().optional()
});
export const planIdParamSchema = z.object({
    id: uuidParamSchema
});
//# sourceMappingURL=plans.schema.js.map