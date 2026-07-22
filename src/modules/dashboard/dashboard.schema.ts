import { z } from 'zod';

import { paginationQuerySchema } from '../../shared/utils/pagination.util.js';

export const dashboardQuerySchema = z.object({});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;