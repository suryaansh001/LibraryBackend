import { z } from 'zod';
export declare const createPaymentBodySchema: z.ZodObject<{
    studentId: z.ZodString;
    amount: z.ZodNumber;
    method: z.ZodEnum<{
        cash: "cash";
        upi: "upi";
        card: "card";
        online: "online";
    }>;
    status: z.ZodDefault<z.ZodEnum<{
        paid: "paid";
        pending: "pending";
        refunded: "refunded";
    }>>;
    referenceNumber: z.ZodOptional<z.ZodString>;
    paymentDate: z.ZodString;
    dueDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const updatePaymentBodySchema: z.ZodObject<{
    amount: z.ZodOptional<z.ZodNumber>;
    method: z.ZodOptional<z.ZodEnum<{
        cash: "cash";
        upi: "upi";
        card: "card";
        online: "online";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        paid: "paid";
        pending: "pending";
        refunded: "refunded";
    }>>;
    referenceNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    paymentDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export declare const updatePaymentStatusBodySchema: z.ZodObject<{
    status: z.ZodEnum<{
        paid: "paid";
        pending: "pending";
        refunded: "refunded";
    }>;
}, z.core.$strict>;
export declare const paymentListQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    studentId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        paid: "paid";
        pending: "pending";
        refunded: "refunded";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const paymentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreatePaymentBody = z.infer<typeof createPaymentBodySchema>;
export type UpdatePaymentBody = z.infer<typeof updatePaymentBodySchema>;
export type UpdatePaymentStatusBody = z.infer<typeof updatePaymentStatusBodySchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
export type PaymentIdParam = z.infer<typeof paymentIdParamSchema>;
