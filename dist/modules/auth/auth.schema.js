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
export const refreshBodySchema = z.object({}).strict();
//# sourceMappingURL=auth.schema.js.map