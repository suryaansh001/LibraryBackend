import { eq, and, desc, getTableColumns, sql, gte, lte } from 'drizzle-orm';
import { payments } from '../../db/schema/payments.js';
import { students } from '../../db/schema/students.js';
import { users } from '../../db/schema/users.js';
export class PaymentRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findById(paymentId, libraryId) {
        const rows = await this.db
            .select({
            ...getTableColumns(payments),
            studentName: students.name,
            recordedByName: users.name
        })
            .from(payments)
            .leftJoin(students, eq(payments.studentId, students.id))
            .leftJoin(users, eq(payments.recordedBy, users.id))
            .where(and(eq(payments.id, paymentId), eq(payments.libraryId, libraryId)))
            .limit(1);
        return rows[0] ?? null;
    }
    async list(params) {
        const conditions = [eq(payments.libraryId, params.libraryId)];
        if (params.from) {
            conditions.push(gte(payments.paymentDate, params.from));
        }
        if (params.to) {
            conditions.push(lte(payments.paymentDate, params.to));
        }
        if (params.studentId) {
            conditions.push(eq(payments.studentId, params.studentId));
        }
        if (params.status) {
            conditions.push(eq(payments.status, params.status));
        }
        const whereClause = and(...conditions);
        const [countResult, paymentRows] = await Promise.all([
            this.db
                .select({ total: sql `count(*)` })
                .from(payments)
                .where(whereClause),
            this.db
                .select({
                ...getTableColumns(payments),
                studentName: students.name,
                recordedByName: users.name
            })
                .from(payments)
                .leftJoin(students, eq(payments.studentId, students.id))
                .leftJoin(users, eq(payments.recordedBy, users.id))
                .where(whereClause)
                .orderBy(desc(payments.paymentDate), desc(payments.createdAt))
                .limit(params.limit)
                .offset(params.offset)
        ]);
        const total = Number(countResult[0]?.total ?? 0);
        return {
            payments: paymentRows,
            total
        };
    }
    async create(input, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .insert(payments)
            .values({
            libraryId: input.libraryId,
            studentId: input.studentId,
            membershipId: input.membershipId,
            amount: input.amount,
            method: input.method,
            status: input.status,
            referenceNumber: input.referenceNumber,
            paymentDate: input.paymentDate,
            dueDate: input.dueDate,
            notes: input.notes,
            recordedBy: input.recordedBy
        })
            .returning();
        const created = rows[0];
        if (!created) {
            throw new Error('Failed to create payment');
        }
        return created;
    }
    async update(paymentId, libraryId, data, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .update(payments)
            .set({
            ...data,
            updatedAt: new Date()
        })
            .where(and(eq(payments.id, paymentId), eq(payments.libraryId, libraryId)))
            .returning();
        return rows[0] ?? null;
    }
    async updateStatus(paymentId, libraryId, status, tx) {
        const database = tx ?? this.db;
        const rows = await database
            .update(payments)
            .set({ status, updatedAt: new Date() })
            .where(and(eq(payments.id, paymentId), eq(payments.libraryId, libraryId)))
            .returning();
        return rows[0] ?? null;
    }
}
//# sourceMappingURL=payments.repository.js.map