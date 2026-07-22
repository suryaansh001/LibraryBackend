import { config } from './src/config/env.js';
export default {
    schema: './src/db/schema/index.ts',
    out: './db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: config.DATABASE_URL
    }
};
//# sourceMappingURL=drizzle.config.js.map