import type { preHandlerHookHandler } from 'fastify';
import jwt from 'jsonwebtoken';

import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
import type { AuthenticatedUser } from '../types/common.types.js';
import { verifyAccessToken } from '../utils/auth.util.js';

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (authorizationHeader === undefined) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || token === undefined || token.length === 0) {
    return null;
  }

  return token;
}

export const authenticate: preHandlerHookHandler = async (request) => {
  const token = extractBearerToken(request.headers.authorization);
  if (token === null) {
    throw new AppError(ERROR_CODES.TOKEN_INVALID, 'Access token is invalid', 401);
  }

  try {
    const claims = verifyAccessToken(token);
    if (typeof claims.sub !== 'string' || typeof claims.library_id !== 'string' || typeof claims.email !== 'string') {
      throw new AppError(ERROR_CODES.TOKEN_INVALID, 'Access token is invalid', 401);
    }

    const user: AuthenticatedUser = {
      id: claims.sub,
      libraryId: claims.library_id,
      role: claims.role,
      email: claims.email
    };

    request.user = user;
    request.libraryId = claims.library_id;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(ERROR_CODES.TOKEN_EXPIRED, 'Access token has expired', 401);
    }

    throw new AppError(ERROR_CODES.TOKEN_INVALID, 'Access token is invalid', 401);
  }
};
