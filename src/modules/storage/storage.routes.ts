import type { FastifyPluginAsync } from 'fastify';

import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { StorageService } from './storage.service.js';
import { storagePresignBodySchema } from './storage.schema.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { db } from '../../config/database.js';

const storageService = new StorageService();

export const storageRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authenticate);

  fastify.post('/presign', {
    preHandler: [authorize('owner', 'staff')]
  }, async (request, reply) => {
    const body = storagePresignBodySchema.parse(request.body);
    const result = await storageService.createPresignedPost(
      request.libraryId,
      request.user.id,
      body
    );
    return sendSuccess(reply, request, result);
  });
};