import { z } from 'zod';
export declare const membershipPlanTypeSchema: z.ZodEnum<{
    monthly: "monthly";
    hourly: "hourly";
}>;
export declare const createPlanBodySchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        monthly: "monthly";
        hourly: "hourly";
    }>;
    price: z.ZodNumber;
    durationDays: z.ZodOptional<z.ZodNumber>;
    hoursIncluded: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const updatePlanBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    durationDays: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    hoursIncluded: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strict>;
export declare const togglePlanBodySchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, z.core.$strict>;
export declare const planListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    type: z.ZodOptional<z.ZodEnum<{
        monthly: "monthly";
        hourly: "hourly";
    }>>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export declare const planIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreatePlanBody = z.infer<typeof createPlanBodySchema>;
export type UpdatePlanBody = z.infer<typeof updatePlanBodySchema>;
export type TogglePlanBody = z.infer<typeof togglePlanBodySchema>;
export type PlanListQuery = z.infer<typeof planListQuerySchema>;
export type PlanIdParam = z.infer<typeof planIdParamSchema>;
