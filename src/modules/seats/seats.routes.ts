import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { SeatService } from './seats.service.js';
import {
  createSeatBodySchema,
  updateSeatBodySchema,
  updateSeatStatusBodySchema,
  assignSeatBodySchema,
  seatListQuerySchema,
  seatIdParamSchema
} from './seats.schema.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.util.js';
import { db } from '../../config/database.js';

export const seatsRoutes: FastifyPluginAsync = async (fastify) => {
  const seatService = new SeatService(db);

  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request, reply) => {
    const query = seatListQuerySchema.parse(request.query);
    const result = await seatService.listSeats(query, request.libraryId);
    return sendSuccess(reply, request, result.data, {
      meta: buildPaginationMeta(query.page, query.limit, result.total)
    });
  });

  fastify.get('/live', async (request, reply) => {
    const data = await seatService.getLiveOccupancy(request.libraryId);
    return sendSuccess(reply, request, data);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = seatIdParamSchema.parse(request.params);
    const seat = await seatService.getSeatById(id, request.libraryId);
    return sendSuccess(reply, request, seat);
  });

  fastify.post('/', {
    preHandler: [authorize('owner')]
  }, async (request, reply) => {
    const body = createSeatBodySchema.parse(request.body);
    const seat = await seatService.createSeat(body, request.libraryId);
    return sendSuccess(reply, request, seat, { statusCode: 201 });
  });

  fastify.put('/:id', {
    preHandler: [authorize('owner')]
  }, async (request, reply) => {
    const { id } = seatIdParamSchema.parse(request.params);
    const body = updateSeatBodySchema.parse(request.body);
    const seat = await seatService.updateSeat(id, body, request.libraryId);
    return sendSuccess(reply, request, seat);
  });

  fastify.patch('/:id/status', {
    preHandler: [authorize('owner')]
  }, async (request, reply) => {
    const { id } = seatIdParamSchema.parse(request.params);
    const body = updateSeatStatusBodySchema.parse(request.body);
    const seat = await seatService.updateSeatStatus(id, body, request.libraryId);
    return sendSuccess(reply, request, seat);
  });

  fastify.patch('/:id/assign', {
    preHandler: [authorize('owner', 'staff')]
  }, async (request, reply) => {
    const { id } = seatIdParamSchema.parse(request.params);
    const body = assignSeatBodySchema.parse(request.body);
    const seat = await seatService.assignSeat(id, body, request.libraryId);
    return sendSuccess(reply, request, seat);
  });

  fastify.patch('/:id/unassign', {
    preHandler: [authorize('owner', 'staff')]
  }, async (request, reply) => {
    const { id } = seatIdParamSchema.parse(request.params);
    await seatService.unassignSeat(id, request.libraryId);
    return sendSuccess(reply, request, { unassigned: true });
  });

  fastify.delete('/:id', {
    preHandler: [authorize('owner')]
  }, async (request, reply) => {
    const { id } = seatIdParamSchema.parse(request.params);
    await seatService.deleteSeat(id, request.libraryId);
    return sendSuccess(reply, request, { deleted: true });
  });
};