import { z } from 'zod';
export const loginBodySchema = z
    .object({
    email: z.string().trim().email(),
    password: z.string().min(1),
    librarySlug: z.string().trim().min(1).max(100)
})
    .strict();
export const librarySlugParamSchema = z
    .object({
    librarySlug: z.string().trim().min(1).max(100)
})
    .strict();
export const registerBodySchema = z
    .object({
    name: z.string().trim().min(1).max(255),
    email: z.string().trim().email(),
    password: z.string().min(6),
    libraryName: z.string().trim().min(1).max(255),
    librarySlug: z.string().trim().min(1).max(100),
    phone: z.string().trim().max(20).optional()
})
    .strict();
export const refreshBodySchema = z.object({}).strict();
//# sourceMappingURL=auth.schema.js.map