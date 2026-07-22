import { z } from 'zod';
export declare const createStudentBodySchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        suspended: "suspended";
        expired: "expired";
        inactive: "inactive";
    }>>;
    seatId: z.ZodOptional<z.ZodString>;
    customFields: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type CreateStudentBody = z.infer<typeof createStudentBodySchema>;
export declare const updateStudentBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    photoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    seatId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export type UpdateStudentBody = z.infer<typeof updateStudentBodySchema>;
export declare const updateStudentStatusBodySchema: z.ZodObject<{
    status: z.ZodEnum<{
        active: "active";
        suspended: "suspended";
        expired: "expired";
        inactive: "inactive";
    }>;
}, z.core.$strict>;
export type UpdateStudentStatusBody = z.infer<typeof updateStudentStatusBodySchema>;
export declare const studentListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        suspended: "suspended";
        expired: "expired";
        inactive: "inactive";
    }>>;
    membershipType: z.ZodOptional<z.ZodEnum<{
        monthly: "monthly";
        hourly: "hourly";
    }>>;
    seatId: z.ZodOptional<z.ZodString>;
    includeDeleted: z.ZodDefault<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type StudentListQuery = z.infer<typeof studentListQuerySchema>;
export declare const studentHistoryQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type StudentHistoryQuery = z.infer<typeof studentHistoryQuerySchema>;
export declare const studentPaymentsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type StudentPaymentsQuery = z.infer<typeof studentPaymentsQuerySchema>;
export declare const studentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type StudentIdParam = z.infer<typeof studentIdParamSchema>;
