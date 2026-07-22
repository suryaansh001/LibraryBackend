import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { AttendanceService } from './attendance.service.js';
import { qrCheckInBodySchema, qrCheckOutBodySchema, manualCheckInBodySchema, manualCheckOutBodySchema, correctAttendanceBodySchema, attendanceListQuerySchema, attendanceIdParamSchema } from './attendance.schema.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.util.js';
import { db } from '../../config/database.js';
export const attendanceRoutes = async (fastify) => {
    const attendanceService = new AttendanceService(db);
    fastify.addHook('preHandler', authenticate);
    fastify.post('/qr-checkin', async (request, reply) => {
        const body = qrCheckInBodySchema.parse(request.body);
        const result = await attendanceService.qrCheckIn(body, request.libraryId, request.ip);
        return sendSuccess(reply, request, result.data);
    });
    fastify.post('/qr-checkout', async (request, reply) => {
        const body = qrCheckOutBodySchema.parse(request.body);
        const result = await attendanceService.qrCheckOut(body, request.libraryId, request.ip);
        return sendSuccess(reply, request, result.data);
    });
    fastify.post('/manual-checkin', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const body = manualCheckInBodySchema.parse(request.body);
        const result = await attendanceService.manualCheckIn({
            studentId: body.studentId,
            seatId: body.seatId
        }, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, result.data);
    });
    fastify.post('/manual-checkout', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const body = manualCheckOutBodySchema.parse(request.body);
        const result = await attendanceService.manualCheckOut(body, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, result.data);
    });
    fastify.patch('/:id/correct', {
        preHandler: [authorize('owner')]
    }, async (request, reply) => {
        const { id } = attendanceIdParamSchema.parse(request.params);
        const body = correctAttendanceBodySchema.parse(request.body);
        const result = await attendanceService.correctSession({ ...body, sessionId: id }, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, result.data);
    });
    fastify.get('/', async (request, reply) => {
        const query = attendanceListQuerySchema.parse(request.query);
        const result = await attendanceService.listSessions(query, request.libraryId);
        return sendSuccess(reply, request, result.data, {
            meta: buildPaginationMeta(query.page, query.limit, result.total)
        });
    });
    fastify.get('/live', async (request, reply) => {
        const result = await attendanceService.getLiveOccupancy(request.libraryId);
        return sendSuccess(reply, request, result);
    });
};
//# sourceMappingURL=attendance.routes.js.map