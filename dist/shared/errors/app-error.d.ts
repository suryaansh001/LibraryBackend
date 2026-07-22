import type { ErrorCode } from './error-codes.js';
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    readonly details?: unknown;
    constructor(code: ErrorCode, message: string, statusCode: number, details?: unknown);
}
