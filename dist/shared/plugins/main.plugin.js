import { config } from '../../config/env.js';
import { dbPlugin } from './db.plugin.js';
import { authPlugin } from './auth.plugin.js';
import { realtimePlugin } from './realtime.plugin.js';
import { swaggerPlugin } from './swagger.plugin.js';
import { authRoutes } from '../../modules/auth/auth.routes.js';
import { studentRoutes } from '../../modules/students/students.routes.js';
import { seatsRoutes } from '../../modules/seats/seats.routes.js';
import { planRoutes } from '../../modules/membership-plans/plans.routes.js';
import { membershipsRoutes } from '../../modules/memberships/memberships.routes.js';
import { attendanceRoutes } from '../../modules/attendance/attendance.routes.js';
import { paymentRoutes } from '../../modules/payments/payments.routes.js';
import { expenseRoutes } from '../../modules/expenses/expenses.routes.js';
import { dashboardRoutes } from '../../modules/dashboard/dashboard.routes.js';
import { occupancyRoutes } from '../../modules/occupancy/occupancy.routes.js';
import { csvRoutes } from '../../modules/csv/csv.routes.js';
import { storageRoutes } from '../../modules/storage/storage.routes.js';
export const mainPlugin = async (fastify) => {
    // Register infrastructure plugins first
    await fastify.register(dbPlugin);
    await fastify.register(authPlugin);
    await fastify.register(realtimePlugin);
    await fastify.register(swaggerPlugin);
    // Register route plugins
    await fastify.register(authRoutes, { prefix: `/api/${config.API_VERSION}/auth` });
    await fastify.register(studentRoutes, { prefix: `/api/${config.API_VERSION}/students` });
    await fastify.register(seatsRoutes, { prefix: `/api/${config.API_VERSION}/seats` });
    await fastify.register(planRoutes, { prefix: `/api/${config.API_VERSION}/membership-plans` });
    await fastify.register(membershipsRoutes, { prefix: `/api/${config.API_VERSION}/memberships` });
    await fastify.register(attendanceRoutes, { prefix: `/api/${config.API_VERSION}/attendance` });
    await fastify.register(paymentRoutes, { prefix: `/api/${config.API_VERSION}/payments` });
    await fastify.register(expenseRoutes, { prefix: `/api/${config.API_VERSION}/expenses` });
    await fastify.register(dashboardRoutes, { prefix: `/api/${config.API_VERSION}/dashboard` });
    await fastify.register(occupancyRoutes, { prefix: `/api/${config.API_VERSION}/occupancy` });
    await fastify.register(storageRoutes, { prefix: `/api/${config.API_VERSION}/storage` });
    await fastify.register(csvRoutes, { prefix: `/api/${config.API_VERSION}/csv` });
};
//# sourceMappingURL=main.plugin.js.map