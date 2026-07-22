import { and, count, desc, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { attendanceSessions } from '../../db/schema/attendance-sessions.js';
import { libraryOccupancy } from '../../db/schema/library-occupancy.js';
import { memberships } from '../../db/schema/memberships.js';
import { payments } from '../../db/schema/payments.js';
import { students } from '../../db/schema/students.js';
import { auditLogs } from '../../db/schema/audit-logs.js';

type Database = NodePgDatabase<typeof schema>;

export interface DashboardRepository {
  getCurrentOccupancy(libraryId: string): Promise<number>;
  getCapacity(libraryId: string): Promise<number>;
  getTodayCheckins(libraryId: string): Promise<number>;
  getMonthlyRevenue(libraryId: string): Promise<number>;
  getPendingFees(libraryId: string): Promise<{ count: number; amount: number }>;
  getActiveStudents(libraryId: string): Promise<number>;
  getRevenue30Days(libraryId: string): Promise<Array<{ date: string; amount: number }>>;
  getAttendance30Days(libraryId: string): Promise<Array<{ date: string; count: number }>>;
  getRecentActivity(libraryId: string): Promise<Array<{ action: string; entityType: string; createdAt: string }>>;
}

export class DashboardRepositoryImpl implements DashboardRepository {
  public constructor(private readonly db: Database) {}

  public async getCurrentOccupancy(libraryId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(attendanceSessions)
      .where(and(eq(attendanceSessions.libraryId, libraryId), isNull(attendanceSessions.checkOutAt)));
    return Number(result[0]?.count ?? 0);
  }

  public async getCapacity(libraryId: string): Promise<number> {
    const result = await this.db
      .select({ capacity: libraryOccupancy.capacity })
      .from(libraryOccupancy)
      .where(eq(libraryOccupancy.libraryId, libraryId))
      .limit(1);
    return result[0]?.capacity ?? 100;
  }

  public async getTodayCheckins(libraryId: string): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const result = await this.db
      .select({ count: count() })
      .from(attendanceSessions)
      .where(and(
        eq(attendanceSessions.libraryId, libraryId),
        gte(attendanceSessions.checkInAt, startOfDay),
        lte(attendanceSessions.checkInAt, endOfDay)
      ));
    return Number(result[0]?.count ?? 0);
  }

public async getMonthlyRevenue(libraryId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startStr = startOfMonth.toISOString().slice(0, 10);
    const endStr = endOfMonth.toISOString().slice(0, 10);

    const result = await this.db
      .select({ total: sql`sum(${payments.amount})` })
      .from(payments)
      .where(and(
        eq(payments.libraryId, libraryId),
        eq(payments.status, 'paid'),
        gte(payments.paymentDate, startStr),
        lte(payments.paymentDate, endStr)
      ));
    return Number(result[0]?.total ?? 0);
  }

  public async getPendingFees(libraryId: string): Promise<{ count: number; amount: number }> {
    const activeMonthlyMembers = await this.db
      .select({ membershipId: memberships.id })
      .from(memberships)
      .where(and(
        eq(memberships.libraryId, libraryId),
        eq(memberships.isCurrent, true),
        eq(memberships.type, 'monthly'),
        eq(memberships.status, 'active')
      ));

    if (activeMonthlyMembers.length === 0) {
      return { count: 0, amount: 0 };
    }

    const membershipIds = activeMonthlyMembers.map(m => m.membershipId);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const pendingPayments = await this.db
      .select({ count: count(), total: sql`sum(${payments.amount})` })
      .from(payments)
      .where(and(
        eq(payments.libraryId, libraryId),
        eq(payments.status, 'pending'),
        inArray(payments.membershipId, membershipIds),
        lte(payments.dueDate, todayStr)
      ));

    return {
      count: Number(pendingPayments[0]?.count ?? 0),
      amount: Number(pendingPayments[0]?.total ?? 0)
    };
  }

  public async getActiveStudents(libraryId: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(students)
      .where(and(
        eq(students.libraryId, libraryId),
        eq(students.status, 'active'),
        isNull(students.deletedAt)
      ));
    return Number(result[0]?.count ?? 0);
  }

  public async getRevenue30Days(libraryId: string): Promise<Array<{ date: string; amount: number }>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    const results = await this.db
      .select({
        date: sql`date(${payments.paymentDate})`,
        total: sql`sum(${payments.amount})`
      })
      .from(payments)
      .where(and(
        eq(payments.libraryId, libraryId),
        eq(payments.status, 'paid'),
        gte(payments.paymentDate, startStr),
        lte(payments.paymentDate, endStr)
      ))
      .groupBy(sql`date(${payments.paymentDate})`)
      .orderBy(sql`date(${payments.paymentDate})`);

    return results.map(r => ({
      date: r.date as string,
      amount: Number(r.total ?? 0)
    }));
  }

  public async getAttendance30Days(libraryId: string): Promise<Array<{ date: string; count: number }>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const results = await this.db
      .select({
        date: sql`date(${attendanceSessions.checkInAt})`,
        count: count()
      })
      .from(attendanceSessions)
      .where(and(
        eq(attendanceSessions.libraryId, libraryId),
        gte(attendanceSessions.checkInAt, startDate),
        lte(attendanceSessions.checkInAt, endDate)
      ))
      .groupBy(sql`date(${attendanceSessions.checkInAt})`)
      .orderBy(sql`date(${attendanceSessions.checkInAt})`);

    return results.map(r => ({
      date: r.date as string,
      count: Number(r.count ?? 0)
    }));
  }

  public async getRecentActivity(libraryId: string): Promise<Array<{ action: string; entityType: string; createdAt: string }>> {
    const results = await this.db
      .select({
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        createdAt: auditLogs.createdAt
      })
      .from(auditLogs)
      .where(eq(auditLogs.libraryId, libraryId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(20);

    return results.map(r => ({
      action: r.action,
      entityType: r.entityType ?? '',
      createdAt: r.createdAt.toISOString()
    }));
  }
}
