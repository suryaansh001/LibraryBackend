import { db } from '../../config/database.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { createTenantMiddleware } from '../../shared/middleware/tenant.js';
import { AuthRepository } from '../auth/auth.repository.js';
import { StudentService } from './students.service.js';
import { createStudentBodySchema, updateStudentBodySchema, updateStudentStatusBodySchema, studentListQuerySchema, studentHistoryQuerySchema, studentPaymentsQuerySchema, studentIdParamSchema } from './students.schema.js';
import { sendSuccess } from '../../shared/utils/response.util.js';
import { buildPaginationMeta } from '../../shared/utils/pagination.util.js';
export const studentRoutes = async (fastify) => {
    const authRepository = new AuthRepository(db);
    const tenantMiddleware = createTenantMiddleware(authRepository);
    const studentService = new StudentService(db);
    // Apply authentication and tenant validation to all student routes
    fastify.addHook('preHandler', authenticate);
    fastify.addHook('preHandler', tenantMiddleware);
    // GET /students (all roles)
    fastify.get('/', async (request, reply) => {
        const query = studentListQuerySchema.parse(request.query);
        const result = await studentService.listStudents(query, request.libraryId);
        return sendSuccess(reply, request, result.data, {
            meta: buildPaginationMeta(query.page, query.limit, result.total)
        });
    });
    // POST /students (owner, staff, receptionist)
    fastify.post('/', {
        preHandler: [authorize('owner', 'staff', 'receptionist')]
    }, async (request, reply) => {
        const body = createStudentBodySchema.parse(request.body);
        const student = await studentService.createStudent(body, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, student, { statusCode: 201 });
    });
    // GET /students/me (student role) — current student profile
    fastify.get('/me', {
        preHandler: [authorize('student')]
    }, async (request, reply) => {
        const student = await studentService.getCurrentStudent(request.user.email, request.libraryId);
        return sendSuccess(reply, request, student);
    });
    // GET /students/me/history (student role)
    fastify.get('/me/history', {
        preHandler: [authorize('student')]
    }, async (request, reply) => {
        const student = await studentService.getCurrentStudent(request.user.email, request.libraryId);
        const query = studentHistoryQuerySchema.parse(request.query);
        const result = await studentService.getStudentHistory(student.id, query, request.libraryId);
        return sendSuccess(reply, request, result.data, {
            meta: buildPaginationMeta(query.page, query.limit, result.total)
        });
    });
    // GET /students/me/payments (student role)
    fastify.get('/me/payments', {
        preHandler: [authorize('student')]
    }, async (request, reply) => {
        const student = await studentService.getCurrentStudent(request.user.email, request.libraryId);
        const query = studentPaymentsQuerySchema.parse(request.query);
        const result = await studentService.getStudentPayments(student.id, query, request.libraryId);
        return sendSuccess(reply, request, result.data, {
            meta: buildPaginationMeta(query.page, query.limit, result.total)
        });
    });
    // GET /students/me/id-card (student role)
    fastify.get('/me/id-card', {
        preHandler: [authorize('student')]
    }, async (request, reply) => {
        const student = await studentService.getCurrentStudent(request.user.email, request.libraryId);
        const cardData = await studentService.getStudentIdCard(student.id, request.libraryId);
        return sendSuccess(reply, request, cardData);
    });
    // GET /students/:id (all roles)
    fastify.get('/:id', async (request, reply) => {
        const { id } = studentIdParamSchema.parse(request.params);
        const student = await studentService.getStudentById(id, request.libraryId);
        return sendSuccess(reply, request, student);
    });
    // PUT /students/:id (owner, staff)
    fastify.put('/:id', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const { id } = studentIdParamSchema.parse(request.params);
        const body = updateStudentBodySchema.parse(request.body);
        const student = await studentService.updateStudent(id, body, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, student);
    });
    // PATCH /students/:id/status (owner, staff)
    fastify.patch('/:id/status', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const { id } = studentIdParamSchema.parse(request.params);
        const body = updateStudentStatusBodySchema.parse(request.body);
        const student = await studentService.updateStudentStatus(id, body.status, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, student);
    });
    // DELETE /students/:id (owner only)
    fastify.delete('/:id', {
        preHandler: [authorize('owner')]
    }, async (request, reply) => {
        const { id } = studentIdParamSchema.parse(request.params);
        await studentService.softDeleteStudent(id, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, { deleted: true });
    });
    // POST /students/:id/qr-regenerate (owner only)
    fastify.post('/:id/qr-regenerate', {
        preHandler: [authorize('owner')]
    }, async (request, reply) => {
        const { id } = studentIdParamSchema.parse(request.params);
        const student = await studentService.regenerateQrToken(id, {
            requestId: request.id,
            libraryId: request.libraryId,
            user: request.user
        }, request.ip);
        return sendSuccess(reply, request, student);
    });
    // GET /students/:id/history (all roles)
    fastify.get('/:id/history', async (request, reply) => {
        const { id } = studentIdParamSchema.parse(request.params);
        const query = studentHistoryQuerySchema.parse(request.query);
        const result = await studentService.getStudentHistory(id, query, request.libraryId);
        return sendSuccess(reply, request, result.data, {
            meta: buildPaginationMeta(query.page, query.limit, result.total)
        });
    });
    // GET /students/:id/payments (all roles)
    fastify.get('/:id/payments', async (request, reply) => {
        const { id } = studentIdParamSchema.parse(request.params);
        const query = studentPaymentsQuerySchema.parse(request.query);
        const result = await studentService.getStudentPayments(id, query, request.libraryId);
        return sendSuccess(reply, request, result.data, {
            meta: buildPaginationMeta(query.page, query.limit, result.total)
        });
    });
    // GET /students/:id/id-card (all roles)
    fastify.get('/:id/id-card', async (request, reply) => {
        const { id } = studentIdParamSchema.parse(request.params);
        const cardData = await studentService.getStudentIdCard(id, request.libraryId);
        return sendSuccess(reply, request, cardData);
    });
};
//# sourceMappingURL=students.routes.js.map