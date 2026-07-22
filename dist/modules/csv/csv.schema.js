import { z } from 'zod';
export const importStudentsSchema = z.object({
    file: z.any() // File upload handled by multipart
});
export const exportStudentsSchema = z.object({
    status: z.enum(['active', 'suspended', 'expired', 'inactive']).optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional()
});
export const exportAttendanceSchema = z.object({
    from: z.string().date(),
    to: z.string().date()
});
export const exportPaymentsSchema = z.object({
    from: z.string().date(),
    to: z.string().date()
});
export const exportExpensesSchema = z.object({
    from: z.string().date(),
    to: z.string().date()
});
//# sourceMappingURL=csv.schema.js.map