import type { FastifyReply, FastifyRequest } from 'fastify';

import type { PaginationMeta } from '../types/common.types.js';

export interface ApiSuccessResponse<TData> {
  success: true;
  data: TData;
  meta?: PaginationMeta;
  message?: string;
  requestId: string;
}

export function sendSuccess<TData>(
  reply: FastifyReply,
  request: FastifyRequest,
  data: TData,
  options?: { message?: string; meta?: PaginationMeta; statusCode?: number }
): FastifyReply {
  const payload: ApiSuccessResponse<TData> = {
    success: true,
    data,
    requestId: request.requestId ?? request.id,
    ...(options?.message !== undefined ? { message: options.message } : {}),
    ...(options?.meta !== undefined ? { meta: options.meta } : {})
  };

  return reply.status(options?.statusCode ?? 200).send(payload);
}