import { z } from 'zod';
export declare const qrCheckInBodySchema: z.ZodObject<{
    qrToken: z.ZodString;
}, z.core.$strict>;
export declare const qrCheckOutBodySchema: z.ZodObject<{
    qrToken: z.ZodString;
}, z.core.$strict>;
export declare const manualCheckInBodySchema: z.ZodObject<{
    studentId: z.ZodString;
    seatId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const manualCheckOutBodySchema: z.ZodObject<{
    studentId: z.ZodString;
}, z.core.$strict>;
export declare const correctAttendanceBodySchema: z.ZodObject<{
    sessionId: z.ZodString;
    checkInAt: z.ZodString;
    checkOutAt: z.ZodString;
    checkInMethod: z.ZodEnum<{
        qr: "qr";
        manual: "manual";
    }>;
    checkOutMethod: z.ZodEnum<{
        qr: "qr";
        manual: "manual";
        auto: "auto";
        forgot: "forgot";
    }>;
    correctionReason: z.ZodString;
}, z.core.$strict>;
export declare const attendanceListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    date: z.ZodOptional<z.ZodString>;
    studentId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        completed: "completed";
        corrected: "corrected";
    }>>;
}, z.core.$strip>;
export declare const attendanceIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type QrCheckInBody = z.infer<typeof qrCheckInBodySchema>;
export type QrCheckOutBody = z.infer<typeof qrCheckOutBodySchema>;
export type ManualCheckInBody = z.infer<typeof manualCheckInBodySchema>;
export type ManualCheckOutBody = z.infer<typeof manualCheckOutBodySchema>;
export type CorrectAttendanceBody = z.infer<typeof correctAttendanceBodySchema>;
export type AttendanceListQuery = z.infer<typeof attendanceListQuerySchema>;
export type AttendanceIdParam = z.infer<typeof attendanceIdParamSchema>;
