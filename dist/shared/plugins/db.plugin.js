import { db, pool } from '../../config/database.js';
export const dbPlugin = async (fastify) => {
    fastify.decorate('db', db);
    fastify.decorate('pool', pool);
    fastify.log.info('Database plugin initialized');
};
//# sourceMappingURL=db.plugin.js.map