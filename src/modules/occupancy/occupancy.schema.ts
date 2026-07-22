import { z } from 'zod';

export const liveOccupancyQuerySchema = z.object({
  libraryId: z.string().uuid().optional()
});

export type LiveOccupancyQuery = z.infer<typeof liveOccupancyQuerySchema>;