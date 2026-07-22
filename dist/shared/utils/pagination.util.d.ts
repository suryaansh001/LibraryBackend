import { z } from 'zod';
import type { PaginationMeta } from '../types/common.types.js';
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export interface PaginationParams {
    offset: number;
    limit: number;
}
export declare function getPaginationParams(query: PaginationQuery): PaginationParams;
export declare function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta;
