import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/utils/pagination.util.js';
export const expenseCategorySchema = z.enum([
    'rent',
    'electricity',
    'internet',
    'salary',
    'maintenance',
    'miscellaneous'
]);
export const createExpenseBodySchema = z.object({
    category: expenseCategorySchema,
    amount: z.number().positive(),
    description: z.string().max(5000).optional(),
    expenseDate: z.string().date(),
    receiptUrl: z.string().url().nullable().optional()
}).strict();
export const updateExpenseBodySchema = z.object({
    category: expenseCategorySchema.optional(),
    amount: z.number().positive().optional(),
    description: z.string().max(5000).nullable().optional(),
    expenseDate: z.string().date().nullable().optional(),
    receiptUrl: z.string().url().nullable().optional()
}).strict();
export const expenseListQuerySchema = paginationQuerySchema.extend({
    from: z.string().date().optional(),
    to: z.string().date().optional(),
    category: expenseCategorySchema.optional()
});
export const expenseIdParamSchema = z.object({
    id: z.string().uuid()
});
//# sourceMappingURL=expenses.schema.js.map