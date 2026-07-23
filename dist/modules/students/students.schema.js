import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/utils/pagination.util.js';
import { uuidParamSchema } from '../../shared/utils/uuid.util.js';
// ── Create Student ────────────────────────────────────────────
export const createStudentBodySchema = z
    .object({
    name: z.string().trim().min(1).max(255),
    phone: z.string().trim().min(1).max(20),
    email: z.string().trim().email().max(255).optional(),
    photoUrl: z.string().url().optional(),
    status: z.enum(['active', 'suspended', 'expired', 'inactive']).default('active'),
    seatId: uuidParamSchema.optional(),
    password: z.string().min(6).max(128).optional(),
    paymentStatus: z.enum(['paid', 'pending']).optional(),
    customFields: z.record(z.string(), z.unknown()).default({}),
    notes: z.string().max(5000).optional()
})
    .strict();
// ── Update Student ────────────────────────────────────────────
export const updateStudentBodySchema = z
    .object({
    name: z.string().trim().min(1).max(255).optional(),
    phone: z.string().trim().min(1).max(20).optional(),
    email: z.string().trim().email().max(255).nullable().optional(),
    photoUrl: z.string().url().nullable().optional(),
    seatId: uuidParamSchema.nullable().optional(),
    customFields: z.record(z.string(), z.unknown()).optional(),
    notes: z.string().max(5000).nullable().optional()
})
    .strict();
// ── Update Student Status ──────────────────────────────────────
export const updateStudentStatusBodySchema = z
    .object({
    status: z.enum(['active', 'suspended', 'expired', 'inactive'])
})
    .strict();
// ── Student List Query ────────────────────────────────────────
export const studentListQuerySchema = paginationQuerySchema.extend({
    search: z.string().trim().max(255).optional(),
    status: z.enum(['active', 'suspended', 'expired', 'inactive']).optional(),
    membershipType: z.enum(['monthly', 'hourly']).optional(),
    seatId: uuidParamSchema.optional(),
    includeDeleted: z.coerce.boolean().default(false)
});
// ── Student History Query ─────────────────────────────────────
export const studentHistoryQuerySchema = paginationQuerySchema;
// ── Student Payments Query ──────────────────────────────────
export const studentPaymentsQuerySchema = paginationQuerySchema;
// ── Param schemas ─────────────────────────────────────────────
export const studentIdParamSchema = z.object({
    id: uuidParamSchema
});
//# sourceMappingURL=students.schema.js.map