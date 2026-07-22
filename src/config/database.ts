import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
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

export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });

export async function pingDatabase(): Promise<boolean> {
  const result = await pool.query('SELECT 1 AS ok');
  return result.rowCount === 1;
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}