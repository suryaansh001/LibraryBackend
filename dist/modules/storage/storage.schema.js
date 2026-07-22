import { z } from 'zod';
export const storagePresignBodySchema = z.object({
    fileName: z.string().min(1).max(255),
    contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    fileSize: z.number().int().positive().max(10 * 1024 * 1024)
}).strict();
//# sourceMappingURL=storage.schema.js.map