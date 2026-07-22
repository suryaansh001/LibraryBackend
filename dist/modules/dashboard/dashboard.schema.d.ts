import { z } from 'zod';
export declare const dashboardQuerySchema: z.ZodObject<{}, z.core.$strip>;
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
