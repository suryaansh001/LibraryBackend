import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/utils/pagination.util.js';
import { uuidParamSchema } from '../../shared/utils/uuid.util.js';
export const createSeatBodySchema = z
    .object({
    seatNumber: z.string().trim().min(1).max(20),
    section: z.string().max(50).optional(),
    type: z.enum(['fixed', 'flexible'])
})
    .strict();
export const updateSeatBodySchema = z
    .object({
    seatNumber: z.string().trim().min(1).max(20).optional(),
    section: z.string().max(50).nullable().optional(),
    type: z.enum(['fixed', 'flexible']).optional()
})
    .strict();
export const updateSeatStatusBodySchema = z
    .object({
    status: z.enum(['available', 'occupied', 'maintenance'])
})
    .strict();
export const assignSeatBodySchema = z
    .object({
    studentId: uuidParamSchema
})
    .strict();
export const seatListQuerySchema = paginationQuerySchema.extend({
    search: z.string().trim().max(255).optional(),
    status: z.enum(['available', 'occupied', 'maintenance']).optional(),
    type: z.enum(['fixed', 'flexible']).optional()
});
export const seatIdParamSchema = z.object({
    id: uuidParamSchema
});
//# sourceMappingURL=seats.schema.js.map