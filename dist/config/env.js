import 'dotenv/config';
import { z } from 'zod';
const envSchema = z.object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_PRIVATE_KEY: z.string().min(1, 'JWT_PRIVATE_KEY is required'),
    JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY is required'),
    JWT_ACCESS_EXPIRES_IN: z.string().min(1, 'JWT_ACCESS_EXPIRES_IN is required'),
    JWT_REFRESH_EXPIRES_IN: z.string().min(1, 'JWT_REFRESH_EXPIRES_IN is required'),
    QR_HMAC_SECRET: z.string().length(64, 'QR_HMAC_SECRET must be 64 characters long'),
    AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
    AWS_S3_BUCKET: z.string().min(1, 'AWS_S3_BUCKET is required'),
    AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
    AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
    S3_PRESIGN_EXPIRES_IN: z.coerce.number().int().positive().default(300),
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGINS: z
        .string()
        .min(1, 'CORS_ORIGINS is required')
        .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
    LOG_LEVEL: z.enum(['info', 'debug', 'warn', 'error']).default('info'),
    MAX_REQUEST_BODY_SIZE: z
        .string()
        .regex(/^\d+(b|kb|mb|gb)$/i, 'MAX_REQUEST_BODY_SIZE must look like 1mb or 10kb')
        .default('1mb'),
    API_VERSION: z.string().min(1, 'API_VERSION is required').default('v1')
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    const formattedIssues = parsedEnv.error.issues
        .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
        .join('; ');
    throw new Error(`Invalid environment configuration: ${formattedIssues}`);
}
export const config = Object.freeze(parsedEnv.data);
//# sourceMappingURL=env.js.map