import { z } from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../config/constants.js';
export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE)
});
export function getPaginationParams(query) {
    return {
        offset: (query.page - 1) * query.limit,
        limit: query.limit
    };
}
export function buildPaginationMeta(page, limit, total) {
    return { page, limit, total };
}
//# sourceMappingURL=pagination.util.js.map