import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { auditLogs } from '../../db/schema/audit-logs.js';

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

export class AuditLogRepository {
  public constructor(private readonly db: Database) {}

  /**
   * Insert an audit log entry. This table is append-only.
   * No update or delete methods are exposed.
   */
  public async create(input: AuditLogInput, tx?: Database): Promise<void> {
    const database = tx ?? this.db;
    await database.insert(auditLogs).values({
      libraryId: input.libraryId,
      userId: input.userId,
      requestId: input.requestId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValue: input.oldValue,
      newValue: input.newValue,
      ipAddress: input.ipAddress
    });
  }
}
