import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import { payments } from '../../db/schema/payments.js';
type Database = NodePgDatabase<typeof schema>;
export interface PaymentListParams {
    libraryId: string;
    from?: string;
    to?: string;
    studentId?: string;
    status?: 'paid' | 'pending' | 'refunded';
    offset: number;
    limit: number;
}
export interface PaymentListResult {
    payments: Array<typeof payments.$inferSelect & {
        studentName: string | null;
        recordedByName: string | null;
    }>;
    total: number;
}
export declare class PaymentRepository {
    private readonly db;
    constructor(db: Database);
    findById(paymentId: string, libraryId: string): Promise<typeof payments.$inferSelect & {
        studentName: string | null;
        recordedByName: string | null;
    } | null>;
    list(params: PaymentListParams): Promise<{
        payments: Array<typeof payments.$inferSelect & {
            studentName: string | null;
            recordedByName: string | null;
        }>;
        total: number;
    }>;
    create(input: {
        libraryId: string;
        studentId: string;
        membershipId: string | null;
        amount: string;
        method: 'cash' | 'upi' | 'card' | 'online';
        status: 'paid' | 'pending' | 'refunded';
        referenceNumber: string | null;
        paymentDate: string;
        dueDate: string | null;
        notes: string | null;
        recordedBy: string | null;
    }, tx?: Database): Promise<typeof payments.$inferSelect>;
    update(paymentId: string, libraryId: string, data: {
        amount?: string;
        method?: 'cash' | 'upi' | 'card' | 'online';
        status?: 'paid' | 'pending' | 'refunded';
        referenceNumber?: string | null;
        paymentDate?: string;
        dueDate?: string | null;
        notes?: string | null;
    }, tx?: Database): Promise<typeof payments.$inferSelect | null>;
    updateStatus(paymentId: string, libraryId: string, status: 'paid' | 'pending' | 'refunded', tx?: Database): Promise<typeof payments.$inferSelect | null>;
}
export {};
