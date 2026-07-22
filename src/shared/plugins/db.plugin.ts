import type { FastifyPluginAsync } from 'fastify';

import { db, pool } from '../../config/database.js';

export const dbPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('db', db);
  fastify.decorate('pool', pool);
  fastify.log.info('Database plugin initialized');
};