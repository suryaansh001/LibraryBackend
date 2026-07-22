import { z } from 'zod';

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../config/constants.js';
import type { PaginationMeta } from '../types/common.types.js';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE)
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginationParams {
  offset: number;
  limit: number;
}

export function getPaginationParams(query: PaginationQuery): PaginationParams {
  return {
    offset: (query.page - 1) * query.limit,
    limit: query.limit
  };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total };
}
