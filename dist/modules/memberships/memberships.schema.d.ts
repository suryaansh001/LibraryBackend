import { z } from 'zod';
export declare const membershipStatusSchema: z.ZodEnum<{
    active: "active";
    cancelled: "cancelled";
    suspended: "suspended";
    expired: "expired";
}>;
export declare const membershipTypeSchema: z.ZodEnum<{
    monthly: "monthly";
    hourly: "hourly";
}>;
export declare const createMembershipBodySchema: z.ZodObject<{
    studentId: z.ZodString;
    planId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        monthly: "monthly";
        hourly: "hourly";
    }>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    hoursTotal: z.ZodOptional<z.ZodString>;
    hoursRemaining: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const updateMembershipBodySchema: z.ZodObject<{
    endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hoursTotal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hoursRemaining: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export declare const suspendMembershipBodySchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const reactivateMembershipBodySchema: z.ZodObject<{
    newEndDate: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const membershipListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    studentId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        cancelled: "cancelled";
        suspended: "suspended";
        expired: "expired";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        monthly: "monthly";
        hourly: "hourly";
    }>>;
    isCurrent: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export declare const membershipIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateMembershipBody = z.infer<typeof createMembershipBodySchema>;
export type UpdateMembershipBody = z.infer<typeof updateMembershipBodySchema>;
export type SuspendMembershipBody = z.infer<typeof suspendMembershipBodySchema>;
export type ReactivateMembershipBody = z.infer<typeof reactivateMembershipBodySchema>;
export type MembershipListQuery = z.infer<typeof membershipListQuerySchema>;
export type MembershipIdParam = z.infer<typeof membershipIdParamSchema>;
