import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '../../shared/middleware/authenticate.js';
import { OccupancyService } from './occupancy.service.js';
import { liveOccupancyQuerySchema } from './occupancy.schema.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { db } from '../../config/database.js';

export const occupancyRoutes: FastifyPluginAsync = async (fastify) => {
  const occupancyService = new OccupancyService(db);

  fastify.addHook('preHandler', authenticate);

  fastify.get('/live', async (request, reply) => {
    const query = liveOccupancyQuerySchema.parse(request.query);
    const libraryId = query.libraryId ?? request.libraryId;

    const data = await occupancyService.getLiveOccupancy(libraryId);
    return sendSuccess(reply, request, data);
  });
};