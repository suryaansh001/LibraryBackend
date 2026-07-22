import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { PaymentService } from './payments.service.js';
import { createPaymentBodySchema, updatePaymentBodySchema, updatePaymentStatusBodySchema, paymentListQuerySchema, paymentIdParamSchema } from './payments.schema.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.util.js';
import { db } from '../../config/database.js';
export const paymentRoutes = async (fastify) => {
    const paymentService = new PaymentService(db);
    fastify.addHook('preHandler', authenticate);
    fastify.get('/', async (request, reply) => {
        const query = paymentListQuerySchema.parse(request.query);
        const result = await paymentService.listPayments(query, request.libraryId);
        return sendSuccess(reply, request, result.data, {
            meta: buildPaginationMeta(query.page, query.limit, result.total)
        });
    });
    fastify.get('/:id', async (request, reply) => {
        const { id } = paymentIdParamSchema.parse(request.params);
        const payment = await paymentService.getPaymentById(id, request.libraryId);
        return sendSuccess(reply, request, payment);
    });
    fastify.post('/', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const body = createPaymentBodySchema.parse(request.body);
        const payment = await paymentService.createPayment(body, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, payment, { statusCode: 201 });
    });
    fastify.put('/:id', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const { id } = paymentIdParamSchema.parse(request.params);
        const body = updatePaymentBodySchema.parse(request.body);
        const payment = await paymentService.updatePayment(id, body, request.libraryId, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, payment);
    });
    fastify.patch('/:id/status', {
        preHandler: [authorize('owner')]
    }, async (request, reply) => {
        const { id } = paymentIdParamSchema.parse(request.params);
        const body = updatePaymentStatusBodySchema.parse(request.body);
        const payment = await paymentService.updatePaymentStatus(id, body, request.libraryId);
        return sendSuccess(reply, request, payment);
    });
};
//# sourceMappingURL=payments.routes.js.map