import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema } from '../db/schema/index.js';
export declare const pool: Pool;
export declare const db: NodePgDatabase<typeof schema>;
export declare function pingDatabase(): Promise<boolean>;
export declare function closeDatabase(): Promise<void>;
