import type { preHandlerHookHandler } from 'fastify';

import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
import type { AuthRepository } from '../../modules/auth/auth.repository.js';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function createTenantMiddleware(repository: AuthRepository): preHandlerHookHandler {
  return async (request) => {
    const library = await repository.findLibraryById(request.libraryId);
    if (library === null || !library.isActive) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Library not found', 404);
    }

    if (library.subscriptionStatus === 'cancelled') {
      throw new AppError(ERROR_CODES.SUBSCRIPTION_CANCELLED, 'Library subscription has been cancelled', 402);
    }

    if (library.subscriptionStatus === 'past_due' && !READ_METHODS.has(request.method)) {
      throw new AppError(ERROR_CODES.SUBSCRIPTION_PAST_DUE, 'Library subscription is past due', 402);
    }
  };
}
