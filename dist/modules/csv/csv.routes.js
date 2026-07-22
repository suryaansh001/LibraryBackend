import '@fastify/multipart';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { csvImportService } from './csv.import.service.js';
import { exportStudentsToCSV } from './csv.export.service.js';
import { exportAttendanceToCSV, exportPaymentsToCSV, exportExpensesToCSV } from './csv.export.service.js';
export const csvRoutes = async (fastify) => {
    fastify.addHook('preHandler', authenticate);
    fastify.post('/import/students', {
        preHandler: [authorize('owner')],
        bodyLimit: 5 * 1024 * 1024
    }, async (request, reply) => {
        const data = await request.file();
        if (!data) {
            return reply.code(400).send({ error: 'No file uploaded' });
        }
        const buffer = await data.toBuffer();
        const result = await csvImportService.importStudents(buffer, request.libraryId, request.user.id);
        return { imported: result.success, errors: result.errors };
    });
    fastify.get('/export/students', {
        preHandler: [authorize('owner')]
    }, async (request, reply) => {
        const stream = await exportStudentsToCSV(request.libraryId, {
            status: request.query.status,
            from: request.query.from ? new Date(request.query.from) : undefined,
            to: request.query.to ? new Date(request.query.to) : undefined
        });
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="students-export.csv"');
        return stream;
    });
    fastify.get('/export/attendance', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const from = new Date(request.query.from);
        const to = new Date(request.query.to);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            return reply.code(400).send({ error: 'Invalid date range' });
        }
        const stream = await exportAttendanceToCSV(request.libraryId, from, to);
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="attendance-export.csv"');
        return stream;
    });
    fastify.get('/export/payments', {
        preHandler: [authorize('owner', 'staff')]
    }, async (request, reply) => {
        const from = new Date(request.query.from);
        const to = new Date(request.query.to);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            return reply.code(400).send({ error: 'Invalid date range' });
        }
        const stream = await exportPaymentsToCSV(request.libraryId, from, to);
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="payments-export.csv"');
        return stream;
    });
    fastify.get('/export/expenses', {
        preHandler: [authorize('owner')]
    }, async (request, reply) => {
        const from = new Date(request.query.from);
        const to = new Date(request.query.to);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            return reply.code(400).send({ error: 'Invalid date range' });
        }
        const stream = await exportExpensesToCSV(request.libraryId, from, to);
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="expenses-export.csv"');
        return stream;
    });
};
//# sourceMappingURL=csv.routes.js.map