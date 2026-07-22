import { z } from 'zod';
export const liveOccupancyQuerySchema = z.object({
    libraryId: z.string().uuid().optional()
});
//# sourceMappingURL=occupancy.schema.js.map