import type { FastifyPluginAsync } from 'fastify';

import { db } from '../../config/database.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { createTenantMiddleware } from '../../shared/middleware/tenant.js';
import { AuthRepository } from '../auth/auth.repository.js';
import { MembershipPlanService } from './plans.service.js';
import {
  createPlanBodySchema,
  updatePlanBodySchema,
  togglePlanBodySchema,
  planListQuerySchema,
  planIdParamSchema
} from './plans.schema.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.util.js';

const authRepository = new AuthRepository(db);
const tenantMiddleware = createTenantMiddleware(authRepository);
const planService = new MembershipPlanService(db);

export const planRoutes: FastifyPluginAsync = async (fastify) => {
  // Apply authentication and tenant validation to all plan routes
  fastify.addHook('preHandler', authenticate);
  fastify.addHook('preHandler', tenantMiddleware);

  // GET /membership-plans (all roles)
  fastify.get('/', async (request, reply) => {
    const query = planListQuerySchema.parse(request.query);
    const result = await planService.listPlans(query, request.libraryId);
    return sendSuccess(reply, request, result.data, {
      meta: buildPaginationMeta(query.page, query.limit, result.total)
    });
  });

  // GET /membership-plans/:id (all roles)
  fastify.get('/:id', async (request, reply) => {
    const { id } = planIdParamSchema.parse(request.params);
    const plan = await planService.getPlanById(id, request.libraryId);
    return sendSuccess(reply, request, plan);
  });

  // POST /membership-plans (owner only)
  fastify.post('/', {
    preHandler: [authorize('owner')]
  }, async (request, reply) => {
    const body = createPlanBodySchema.parse(request.body);
    const plan = await planService.createPlan(body, {
      requestId: request.id,
      libraryId: request.libraryId,
      user: request.user
    });
    return sendSuccess(reply, request, plan, { statusCode: 201 });
  });

  // PUT /membership-plans/:id (owner only)
  fastify.put('/:id', {
    preHandler: [authorize('owner')]
  }, async (request, reply) => {
    const { id } = planIdParamSchema.parse(request.params);
    const body = updatePlanBodySchema.parse(request.body);
    const plan = await planService.updatePlan(id, body, request.libraryId);
    return sendSuccess(reply, request, plan);
  });

  // PATCH /membership-plans/:id/toggle (owner only)
  fastify.patch('/:id/toggle', {
    preHandler: [authorize('owner')]
  }, async (request, reply) => {
    const { id } = planIdParamSchema.parse(request.params);
    const body = togglePlanBodySchema.parse(request.body);
    const plan = await planService.togglePlan(id, body, request.libraryId);
    return sendSuccess(reply, request, plan);
  });

  // DELETE /membership-plans/:id (owner only)
  fastify.delete('/:id', {
    preHandler: [authorize('owner')]
  }, async (request, reply) => {
    const { id } = planIdParamSchema.parse(request.params);
    await planService.deletePlan(id, request.libraryId);
    return sendSuccess(reply, request, { deleted: true });
  });
};