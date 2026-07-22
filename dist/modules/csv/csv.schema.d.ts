import { z } from 'zod';
export declare const importStudentsSchema: z.ZodObject<{
    file: z.ZodAny;
}, z.core.$strip>;
export declare const exportStudentsSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        suspended: "suspended";
        expired: "expired";
        inactive: "inactive";
    }>>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const exportAttendanceSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
}, z.core.$strip>;
export declare const exportPaymentsSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
}, z.core.$strip>;
export declare const exportExpensesSchema: z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
}, z.core.$strip>;
export type ImportStudentsBody = z.infer<typeof importStudentsSchema>;
export type ExportStudentsQuery = z.infer<typeof exportStudentsSchema>;
export type ExportAttendanceQuery = z.infer<typeof exportAttendanceSchema>;
export type ExportPaymentsQuery = z.infer<typeof exportPaymentsSchema>;
export type ExportExpensesQuery = z.infer<typeof exportExpensesSchema>;
