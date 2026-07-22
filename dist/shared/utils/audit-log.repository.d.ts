import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
type Database = NodePgDatabase<typeof schema>;
export interface AuditLogInput {
    libraryId: string;
    userId?: string;
    requestId: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ipAddress?: string;
}
export declare class AuditLogRepository {
    private readonly db;
    constructor(db: Database);
    /**
     * Insert an audit log entry. This table is append-only.
     * No update or delete methods are exposed.
     */
    create(input: AuditLogInput, tx?: Database): Promise<void>;
}
export {};
