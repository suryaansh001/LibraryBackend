import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { MembershipService } from './memberships.service.js';
import { createMembershipBodySchema, updateMembershipBodySchema, suspendMembershipBodySchema, reactivateMembershipBodySchema, membershipListQuerySchema, membershipIdParamSchema } from './memberships.schema.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.util.js';
import { db } from '../../config/database.js';
export const membershipsRoutes = async (fastify) => {
    const membershipService = new MembershipService(db);
    fastify.addHook('preHandler', authenticate);
    fastify.get('/', async (request, reply) => {
        const query = membershipListQuerySchema.parse(request.query);
        const result = await membershipService.listMemberships(query, request.libraryId);
        return sendSuccess(reply, request, result.data, {
            meta: buildPaginationMeta(query.page, query.limit, result.total)
        });
    });
    fastify.get('/:id', async (request, reply) => {
        const { id } = membershipIdParamSchema.parse(request.params);
        const membership = await membershipService.getMembershipById(id, request.libraryId);
        return sendSuccess(reply, request, membership);
    });
    fastify.post('/', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const body = createMembershipBodySchema.parse(request.body);
        const membership = await membershipService.createMembership(body, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, membership, { statusCode: 201 });
    });
    fastify.put('/:id', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const { id } = membershipIdParamSchema.parse(request.params);
        const body = updateMembershipBodySchema.parse(request.body);
        const membership = await membershipService.updateMembership(id, body, request.libraryId);
        return sendSuccess(reply, request, membership);
    });
    fastify.patch('/:id/suspend', {
        preHandler: [authorize('owner')]
    }, async (request, reply) => {
        const { id } = membershipIdParamSchema.parse(request.params);
        const body = suspendMembershipBodySchema.parse(request.body);
        const membership = await membershipService.suspendMembership(id, body, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, membership);
    });
    fastify.patch('/:id/reactivate', {
        preHandler: [authorize('owner')]
    }, async (request, reply) => {
        const { id } = membershipIdParamSchema.parse(request.params);
        const body = reactivateMembershipBodySchema.parse(request.body);
        const membership = await membershipService.reactivateMembership(id, body, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, membership);
    });
};
//# sourceMappingURL=memberships.routes.js.map