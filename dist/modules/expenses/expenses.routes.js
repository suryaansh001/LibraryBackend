import { db } from '../../config/database.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.util.js';
import { createExpenseBodySchema, expenseIdParamSchema, expenseListQuerySchema, updateExpenseBodySchema } from './expenses.schema.js';
import { ExpenseService } from './expenses.service.js';
const expenseService = new ExpenseService(db);
export const expenseRoutes = async (fastify) => {
    fastify.addHook('preHandler', authenticate);
    fastify.get('/', async (request, reply) => {
        const query = expenseListQuerySchema.parse(request.query);
        const result = await expenseService.listExpenses(query, request.libraryId);
        return sendSuccess(reply, request, result.data, {
            meta: buildPaginationMeta(query.page, query.limit, result.total)
        });
    });
    fastify.get('/:id', async (request, reply) => {
        const { id } = expenseIdParamSchema.parse(request.params);
        return sendSuccess(reply, request, await expenseService.getExpenseById(id, request.libraryId));
    });
    fastify.post('/', { preHandler: [authorize('owner', 'staff')] }, async (request, reply) => {
        const expense = await expenseService.createExpense(createExpenseBodySchema.parse(request.body), {
            requestId: request.id, libraryId: request.libraryId, user: request.user
        }, request.ip);
        return sendSuccess(reply, request, expense, { statusCode: 201 });
    });
    fastify.put('/:id', { preHandler: [authorize('owner', 'staff')] }, async (request, reply) => {
        const { id } = expenseIdParamSchema.parse(request.params);
        const expense = await expenseService.updateExpense(id, updateExpenseBodySchema.parse(request.body), request.libraryId, {
            requestId: request.id, libraryId: request.libraryId, user: request.user
        }, request.ip);
        return sendSuccess(reply, request, expense);
    });
    fastify.delete('/:id', { preHandler: [authorize('owner')] }, async (request, reply) => {
        const { id } = expenseIdParamSchema.parse(request.params);
        await expenseService.deleteExpense(id, request.libraryId, {
            requestId: request.id, libraryId: request.libraryId, user: request.user
        }, request.ip);
        return sendSuccess(reply, request, { deleted: true });
    });
};
//# sourceMappingURL=expenses.routes.js.map