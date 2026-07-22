import type { Pool } from 'pg';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import type { AuthenticatedUser } from './common.types.js';
import type { AuthPluginApi } from '../plugins/auth.plugin.js';
import type { RealtimeHub } from '../plugins/realtime.plugin.js';

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
    user: AuthenticatedUser;
    libraryId: string;
  }

  interface FastifyInstance {
    db: NodePgDatabase<typeof schema>;
    pool: Pool;
    auth: AuthPluginApi;
    realtime: RealtimeHub;
  }
}

export {};