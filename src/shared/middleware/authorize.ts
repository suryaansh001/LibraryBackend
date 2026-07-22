import type { preHandlerHookHandler } from 'fastify';

import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
import type { AuthenticatedUser } from '../types/common.types.js';

type AllowedRole = AuthenticatedUser['role'];

export function authorize(...allowedRoles: AllowedRole[]): preHandlerHookHandler {
  return async (request) => {
    if (!allowedRoles.includes(request.user.role)) {
      throw new AppError(ERROR_CODES.INSUFFICIENT_PERMISSIONS, 'Insufficient permissions', 403);
    }
  };
}
