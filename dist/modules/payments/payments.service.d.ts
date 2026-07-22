import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';
import type { RequestContext } from '../../shared/types/common.types.js';
type Database = NodePgDatabase<typeof schema>;
export declare class PaymentService {
    private readonly db;
    private readonly paymentRepository;
    private readonly auditLogRepository;
    constructor(db: Database);
    createPayment(body: import('./payments.schema.js').CreatePaymentBody, ctx: RequestContext, ipAddress?: string): Promise<import('../../shared/dto/payment.dto.js').PaymentResponseDTO>;
    listPayments(query: import('./payments.schema.js').PaymentListQuery, libraryId: string): Promise<{
        data: import('../../shared/dto/payment.dto.js').PaymentListItemDTO[];
        total: number;
    }>;
    getPaymentById(paymentId: string, libraryId: string): Promise<import('../../shared/dto/payment.dto.js').PaymentResponseDTO>;
    updatePayment(paymentId: string, body: import('./payments.schema.js').UpdatePaymentBody, libraryId: string, ctx: RequestContext, ipAddress?: string): Promise<import('../../shared/dto/payment.dto.js').PaymentResponseDTO>;
    updatePaymentStatus(paymentId: string, body: import('./payments.schema.js').UpdatePaymentStatusBody, libraryId: string): Promise<import('../../shared/dto/payment.dto.js').PaymentResponseDTO>;
}
export {};
