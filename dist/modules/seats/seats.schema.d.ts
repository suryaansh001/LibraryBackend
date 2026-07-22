import { z } from 'zod';
export declare const createSeatBodySchema: z.ZodObject<{
    seatNumber: z.ZodString;
    section: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        fixed: "fixed";
        flexible: "flexible";
    }>;
}, z.core.$strict>;
export type CreateSeatBody = z.infer<typeof createSeatBodySchema>;
export declare const updateSeatBodySchema: z.ZodObject<{
    seatNumber: z.ZodOptional<z.ZodString>;
    section: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<{
        fixed: "fixed";
        flexible: "flexible";
    }>>;
}, z.core.$strict>;
export type UpdateSeatBody = z.infer<typeof updateSeatBodySchema>;
export declare const updateSeatStatusBodySchema: z.ZodObject<{
    status: z.ZodEnum<{
        available: "available";
        occupied: "occupied";
        maintenance: "maintenance";
    }>;
}, z.core.$strict>;
export type UpdateSeatStatusBody = z.infer<typeof updateSeatStatusBodySchema>;
export declare const assignSeatBodySchema: z.ZodObject<{
    studentId: z.ZodString;
}, z.core.$strict>;
export type AssignSeatBody = z.infer<typeof assignSeatBodySchema>;
export declare const seatListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        available: "available";
        occupied: "occupied";
        maintenance: "maintenance";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        fixed: "fixed";
        flexible: "flexible";
    }>>;
}, z.core.$strip>;
export type SeatListQuery = z.infer<typeof seatListQuerySchema>;
export declare const seatIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type SeatIdParam = z.infer<typeof seatIdParamSchema>;
