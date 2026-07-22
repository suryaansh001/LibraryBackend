import { auditLogs } from '../../db/schema/audit-logs.js';
export class AuditLogRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Insert an audit log entry. This table is append-only.
     * No update or delete methods are exposed.
     */
    async create(input, tx) {
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
//# sourceMappingURL=audit-log.repository.js.map