import type { FastifyReply, FastifyRequest } from 'fastify';
import type { PaginationMeta } from '../types/common.types.js';
export interface ApiSuccessResponse<TData> {
    success: true;
    data: TData;
    meta?: PaginationMeta;
    message?: string;
    requestId: string;
}
export declare function sendSuccess<TData>(reply: FastifyReply, request: FastifyRequest, data: TData, options?: {
    message?: string;
    meta?: PaginationMeta;
    statusCode?: number;
}): FastifyReply;
