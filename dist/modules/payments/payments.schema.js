import { z } from 'zod';
export const createPaymentBodySchema = z.object({
    studentId: z.string().uuid(),
    amount: z.number().positive(),
    method: z.enum(['cash', 'upi', 'card', 'online']),
    status: z.enum(['paid', 'pending', 'refunded']).default('paid'),
    referenceNumber: z.string().max(100).optional(),
    paymentDate: z.string().date(),
    dueDate: z.string().date().optional(),
    notes: z.string().max(5000).optional()
}).strict();
export const updatePaymentBodySchema = z.object({
    amount: z.number().positive().optional(),
    method: z.enum(['cash', 'upi', 'card', 'online']).optional(),
    status: z.enum(['paid', 'pending', 'refunded']).optional(),
    referenceNumber: z.string().max(100).nullable().optional(),
    paymentDate: z.string().date().optional(),
    dueDate: z.string().date().nullable().optional(),
    notes: z.string().max(5000).nullable().optional()
}).strict();
export const updatePaymentStatusBodySchema = z.object({
    status: z.enum(['paid', 'pending', 'refunded'])
}).strict();
export const paymentListQuerySchema = z.object({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
    studentId: z.string().uuid().optional(),
    status: z.enum(['paid', 'pending', 'refunded']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
});
export const paymentIdParamSchema = z.object({
    id: z.string().uuid()
});
//# sourceMappingURL=payments.schema.js.map