import { z } from 'zod';
export declare const storagePresignBodySchema: z.ZodObject<{
    fileName: z.ZodString;
    contentType: z.ZodEnum<{
        "image/jpeg": "image/jpeg";
        "image/png": "image/png";
        "image/webp": "image/webp";
        "application/pdf": "application/pdf";
    }>;
    fileSize: z.ZodNumber;
}, z.core.$strict>;
export type StoragePresignBody = z.infer<typeof storagePresignBodySchema>;
