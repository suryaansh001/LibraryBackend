import { eq, and, isNull, desc, getTableColumns, sql, gte, lte } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schema } from '../../db/schema/index.js';

import { payments } from '../../db/schema/payments.js';
import { students } from '../../db/schema/students.js';
import { users } from '../../db/schema/users.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import {
  toPaymentResponseDTO,
  toPaymentListItemDTO,
  type PaymentResponseDTO,
  type PaymentListItemDTO
} from '../../shared/dto/payment.dto.js';
import type {
  CreatePaymentBody,
  UpdatePaymentBody,
  UpdatePaymentStatusBody,
  PaymentListQuery
} from './payments.schema.js';

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
  payments: Array<typeof payments.$inferSelect & { studentName: string | null; recordedByName: string | null }>;
  total: number;
}

export class PaymentRepository {
  public constructor(private readonly db: Database) {}

  public async findById(paymentId: string, libraryId: string): Promise<typeof payments.$inferSelect & { studentName: string | null; recordedByName: string | null } | null> {
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

  public async list(params: PaymentListParams): Promise<{ payments: Array<typeof payments.$inferSelect & { studentName: string | null; recordedByName: string | null }>; total: number }> {
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
        .select({ total: sql`count(*)` })
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

  public async create(
    input: {
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
    },
    tx?: Database
  ): Promise<typeof payments.$inferSelect> {
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

  public async update(
    paymentId: string,
    libraryId: string,
    data: {
      amount?: string;
      method?: 'cash' | 'upi' | 'card' | 'online';
      status?: 'paid' | 'pending' | 'refunded';
      referenceNumber?: string | null;
      paymentDate?: string;
      dueDate?: string | null;
      notes?: string | null;
    },
    tx?: Database
  ): Promise<typeof payments.$inferSelect | null> {
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

  public async updateStatus(
    paymentId: string,
    libraryId: string,
    status: 'paid' | 'pending' | 'refunded',
    tx?: Database
  ): Promise<typeof payments.$inferSelect | null> {
    const database = tx ?? this.db;
    const rows = await database
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(payments.id, paymentId), eq(payments.libraryId, libraryId)))
      .returning();

    return rows[0] ?? null;
  }
}
