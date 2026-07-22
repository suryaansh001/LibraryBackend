import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from './env.js';
import { schema } from '../db/schema/index.js';
export const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
    allowExitOnIdle: false
});
pool.on('connect', (client) => {
    void client.query(`SET statement_timeout = '5000'`);
});
export const db = drizzle(pool, { schema });
export async function pingDatabase() {
    const result = await pool.query('SELECT 1 AS ok');
    return result.rowCount === 1;
}
export async function closeDatabase() {
    await pool.end();
}
//# sourceMappingURL=database.js.map