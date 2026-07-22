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

export type ImportStudentsBody = z.infer<typeof importStudentsSchema>;
export type ExportStudentsQuery = z.infer<typeof exportStudentsSchema>;
export type ExportAttendanceQuery = z.infer<typeof exportAttendanceSchema>;
export type ExportPaymentsQuery = z.infer<typeof exportPaymentsSchema>;
export type ExportExpensesQuery = z.infer<typeof exportExpensesSchema>;