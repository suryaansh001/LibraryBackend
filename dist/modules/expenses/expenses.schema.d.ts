import { z } from 'zod';
export declare const expenseCategorySchema: z.ZodEnum<{
    maintenance: "maintenance";
    rent: "rent";
    electricity: "electricity";
    internet: "internet";
    salary: "salary";
    miscellaneous: "miscellaneous";
}>;
export declare const createExpenseBodySchema: z.ZodObject<{
    category: z.ZodEnum<{
        maintenance: "maintenance";
        rent: "rent";
        electricity: "electricity";
        internet: "internet";
        salary: "salary";
        miscellaneous: "miscellaneous";
    }>;
    amount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
    expenseDate: z.ZodString;
    receiptUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export declare const updateExpenseBodySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<{
        maintenance: "maintenance";
        rent: "rent";
        electricity: "electricity";
        internet: "internet";
        salary: "salary";
        miscellaneous: "miscellaneous";
    }>>;
    amount: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    expenseDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    receiptUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export declare const expenseListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        maintenance: "maintenance";
        rent: "rent";
        electricity: "electricity";
        internet: "internet";
        salary: "salary";
        miscellaneous: "miscellaneous";
    }>>;
}, z.core.$strip>;
export declare const expenseIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateExpenseBody = z.infer<typeof createExpenseBodySchema>;
export type UpdateExpenseBody = z.infer<typeof updateExpenseBodySchema>;
export type ExpenseListQuery = z.infer<typeof expenseListQuerySchema>;
export type ExpenseIdParam = z.infer<typeof expenseIdParamSchema>;
