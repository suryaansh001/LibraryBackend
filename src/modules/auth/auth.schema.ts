import { z } from 'zod';

export const loginBodySchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(1),
    librarySlug: z.string().trim().min(1).max(100)
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;

export const librarySlugParamSchema = z
  .object({
    librarySlug: z.string().trim().min(1).max(100)
  })
  .strict();

export type LibrarySlugParam = z.infer<typeof librarySlugParamSchema>;

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

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const refreshBodySchema = z.object({}).strict();

export type RefreshBody = z.infer<typeof refreshBodySchema>;
