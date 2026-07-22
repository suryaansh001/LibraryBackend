import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '../../shared/middleware/authenticate.js';
import { DashboardServiceImpl } from './dashboard.service.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { db } from '../../config/database.js';

const dashboardService = new DashboardServiceImpl(db);

export const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request, reply) => {
    const result = await dashboardService.getDashboard(request.libraryId, request.id);
    return sendSuccess(reply, request, result);
  });
};