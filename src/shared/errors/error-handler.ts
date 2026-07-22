import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { AppError } from './app-error.js';
import { ERROR_CODES } from './error-codes.js';

type PgErrorLike = Error & {
  code?: string;
  constraint?: string;
  detail?: string;
  cause?: Error & { code?: string; constraint?: string };
};

export function mapDatabaseError(error: PgErrorLike): AppError {
  const pgError = error.cause ?? error;
  if (pgError.code === '23505') {
    if (pgError.constraint?.includes('phone')) {
      return new AppError(ERROR_CODES.DUPLICATE_PHONE, 'Duplicate phone number', 409);
    }

    if (pgError.constraint?.includes('email')) {
      return new AppError(ERROR_CODES.DUPLICATE_EMAIL, 'Duplicate email address', 409);
    }

    if (pgError.constraint?.includes('seat_number')) {
      return new AppError(ERROR_CODES.SEAT_NUMBER_EXISTS, 'Seat number already exists', 409);
    }

    return new AppError(ERROR_CODES.DATABASE_ERROR, 'Database constraint violation', 409);
  }

  if (pgError.code === '23503') {
    return new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Related resource not found', 400);
  }

  return new AppError(ERROR_CODES.DATABASE_ERROR, 'Database error', 500);
}

function buildErrorResponse(error: AppError, requestId: string): {
  success: false;
  error: { code: string; message: string; details?: unknown };
  requestId: string;
} {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    },
    requestId
  };
}

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): void {
  console.error('ERROR IN ERROR_HANDLER:', error);
  const requestId = request.requestId;

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      request.log.error({ error, requestId }, error.message);
    } else {
      request.log.warn({ error, requestId }, error.message);
    }
    void reply.status(error.statusCode).send(buildErrorResponse(error, requestId));
    return;
  }

  if (error instanceof ZodError) {
    const appError = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Validation failed', 400, {
      issues: error.issues
    });

    request.log.warn({ error, requestId }, 'Validation failed');
    void reply.status(400).send(buildErrorResponse(appError, requestId));
    return;
  }

  const maybePgError = error as PgErrorLike;
  const pgErrorCode = maybePgError.cause?.code ?? maybePgError.code;
  if (typeof pgErrorCode === 'string' && pgErrorCode.startsWith('23')) {
    const appError = mapDatabaseError(maybePgError);
    request.log.error({ error, requestId }, 'Database error');
    void reply.status(appError.statusCode).send(buildErrorResponse(appError, requestId));
    return;
  }

  request.log.error({ error, requestId }, 'Unhandled error');
  const appError = new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Internal server error', 500);
  void reply.status(500).send(buildErrorResponse(appError, requestId));
}