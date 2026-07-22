import type { FastifyPluginAsync } from 'fastify';

export interface JwtClaims {
  sub: string;
  library_id: string;
  role: 'owner' | 'staff' | 'receptionist' | 'student';
  email: string;
}

export const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Auth utilities are now imported directly from @/shared/utils/auth.util.js
  // This plugin is kept for future extensibility (e.g., custom auth hooks)
  fastify.log.debug('Auth plugin registered (no-op)');
};