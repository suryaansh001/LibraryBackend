import type { preHandlerHookHandler } from 'fastify';
import type { AuthenticatedUser } from '../types/common.types.js';
type AllowedRole = AuthenticatedUser['role'];
export declare function authorize(...allowedRoles: AllowedRole[]): preHandlerHookHandler;
export {};
