import type { preHandlerHookHandler } from 'fastify';
import type { AuthRepository } from '../../modules/auth/auth.repository.js';
export declare function createTenantMiddleware(repository: AuthRepository): preHandlerHookHandler;
