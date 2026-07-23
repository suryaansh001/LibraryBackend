import { z } from 'zod';
export declare const loginBodySchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    librarySlug: z.ZodString;
}, z.core.$strict>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export declare const librarySlugParamSchema: z.ZodObject<{
    librarySlug: z.ZodString;
}, z.core.$strict>;
export type LibrarySlugParam = z.infer<typeof librarySlugParamSchema>;
export declare const registerBodySchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    libraryName: z.ZodString;
    librarySlug: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type RegisterBody = z.infer<typeof registerBodySchema>;
export declare const refreshBodySchema: z.ZodObject<{}, z.core.$strict>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;
