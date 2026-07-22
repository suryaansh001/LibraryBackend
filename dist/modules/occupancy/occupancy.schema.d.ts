import { z } from 'zod';
export declare const liveOccupancyQuerySchema: z.ZodObject<{
    libraryId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type LiveOccupancyQuery = z.infer<typeof liveOccupancyQuerySchema>;
