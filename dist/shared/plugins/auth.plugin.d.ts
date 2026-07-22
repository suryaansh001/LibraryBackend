import type { FastifyPluginAsync } from 'fastify';
export interface JwtClaims {
    sub: string;
    library_id: string;
    role: 'owner' | 'staff' | 'receptionist' | 'student';
    email: string;
}
export declare const authPlugin: FastifyPluginAsync;
