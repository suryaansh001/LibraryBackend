import { Readable } from 'stream';
import { stringify } from 'csv-stringify';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { students, seats, memberships, payments, expenses } from '../../db/schema/index.js';
import { db } from '../../config/database.js';

export async function exportStudentsToCSV(
  libraryId: string,
  filters: { status?: 'active' | 'suspended' | 'expired' | 'inactive'; from?: Date; to?: Date } = {}
): Promise<Readable> {
  const conditions = [eq(students.libraryId, libraryId)];

  if (filters.status) {
    conditions.push(eq(students.status, filters.status));
  }
  if (filters.from) {
    conditions.push(gte(students.createdAt, filters.from));
  }
  if (filters.to) {
    conditions.push(lte(students.createdAt, filters.to));
  }

  const studentsData = await db
    .select({
      id: students.id,
      name: students.name,
      phone: students.phone,
      email: students.email,
      status: students.status,
      seatNumber: seats.seatNumber,
      membershipType: memberships.type,
      createdAt: students.createdAt
    })
    .from(students)
    .leftJoin(seats, eq(students.seatId, seats.id))
    .leftJoin(memberships, and(eq(memberships.studentId, students.id), eq(memberships.isCurrent, true)))
    .where(and(...conditions))
    .orderBy(desc(students.createdAt));

  const stringifier = stringify({
    header: true,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'phone', header: 'Phone' },
      { key: 'email', header: 'Email' },
      { key: 'status', header: 'Status' },
      { key: 'seatNumber', header: 'Seat Number' },
      { key: 'membershipType', header: 'Membership Type' },
      { key: 'createdAt', header: 'Created At' }
    ]
  });

  const readable = new Readable({
    objectMode: true,
    read() {
      studentsData.forEach(student => {
        this.push({
          id: student.id,
          name: student.name,
          phone: student.phone,
          email: student.email || '',
          status: student.status,
          seatNumber: student.seatNumber || '',
          membershipType: student.membershipType || '',
          createdAt: student.createdAt.toISOString().split('T')[0]
        });
      });
      this.push(null);
    }
  });

  return readable.pipe(stringifier);
}

export async function exportAttendanceToCSV(
  libraryId: string,
  from: Date,
  to: Date
): Promise<NodeJS.ReadableStream> {
  const { attendanceSessions, students, seats, memberships } = await import('../../db/schema/index.js');
  const { db } = await import('../../config/database.js');
  const { and, desc, eq, gte, lte } = await import('drizzle-orm');

  const sessions = await db
    .select({
      id: attendanceSessions.id,
      studentId: attendanceSessions.studentId,
      studentName: students.name,
      seatNumber: seats.seatNumber,
      checkInAt: attendanceSessions.checkInAt,
      checkOutAt: attendanceSessions.checkOutAt,
      durationMinutes: attendanceSessions.durationMinutes,
      checkInMethod: attendanceSessions.checkInMethod,
      checkOutMethod: attendanceSessions.checkOutMethod,
      membershipType: memberships.type
    })
    .from(attendanceSessions)
    .leftJoin(students, eq(attendanceSessions.studentId, students.id))
    .leftJoin(seats, eq(students.seatId, seats.id))
    .leftJoin(memberships, eq(attendanceSessions.membershipId, memberships.id))
    .where(and(
      eq(attendanceSessions.libraryId, libraryId),
      gte(attendanceSessions.checkInAt, from),
      lte(attendanceSessions.checkInAt, to)
    ))
    .orderBy(desc(attendanceSessions.checkInAt));

  const stringifier = stringify({
    header: true,
    columns: [
      { key: 'id', header: 'Session ID' },
      { key: 'studentId', header: 'Student ID' },
      { key: 'studentName', header: 'Student Name' },
      { key: 'seatNumber', header: 'Seat Number' },
      { key: 'checkInAt', header: 'Check-in Time' },
      { key: 'checkOutAt', header: 'Check-out Time' },
      { key: 'durationMinutes', header: 'Duration (minutes)' },
      { key: 'checkInMethod', header: 'Check-in Method' },
      { key: 'checkOutMethod', header: 'Check-out Method' },
      { key: 'membershipType', header: 'Membership Type' }
    ]
  });

  const readable = Readable.from(sessions);
  return readable.pipe(stringifier);
}

export async function exportPaymentsToCSV(
  libraryId: string,
  from: Date,
  to: Date
): Promise<NodeJS.ReadableStream> {
  const { payments, students, users } = await import('../../db/schema/index.js');
  const { db } = await import('../../config/database.js');
  const { and, desc, eq, gte, lte } = await import('drizzle-orm');

  const paymentsData = await db
    .select({
      id: payments.id,
      studentId: payments.studentId,
      studentName: students.name,
      amount: payments.amount,
      method: payments.method,
      status: payments.status,
      referenceNumber: payments.referenceNumber,
      paymentDate: payments.paymentDate,
      dueDate: payments.dueDate,
      notes: payments.notes,
      recordedByName: users.name
    })
    .from(payments)
    .leftJoin(students, eq(payments.studentId, students.id))
    .leftJoin(users, eq(payments.recordedBy, users.id))
    .where(and(
      eq(payments.libraryId, libraryId),
      eq(payments.status, 'paid'),
      gte(payments.paymentDate, toIsoDate(from)),
      lte(payments.paymentDate, toIsoDate(to))
    ))
    .orderBy(desc(payments.paymentDate));

  const stringifier = stringify({
    header: true,
    columns: [
      { key: 'id', header: 'Payment ID' },
      { key: 'studentId', header: 'Student ID' },
      { key: 'studentName', header: 'Student Name' },
      { key: 'amount', header: 'Amount' },
      { key: 'method', header: 'Method' },
      { key: 'status', header: 'Status' },
      { key: 'referenceNumber', header: 'Reference Number' },
      { key: 'paymentDate', header: 'Payment Date' },
      { key: 'dueDate', header: 'Due Date' },
      { key: 'notes', header: 'Notes' },
      { key: 'recordedByName', header: 'Recorded By' }
    ]
  });

  const readable = Readable.from(paymentsData);
  return readable.pipe(stringifier);
}

export async function exportExpensesToCSV(
  libraryId: string,
  from: Date,
  to: Date
): Promise<NodeJS.ReadableStream> {
  const { expenses, users } = await import('../../db/schema/index.js');
  const { db } = await import('../../config/database.js');
  const { and, desc, eq, gte, lte } = await import('drizzle-orm');

  const expensesData = await db
    .select({
      id: expenses.id,
      category: expenses.category,
      amount: expenses.amount,
      description: expenses.description,
      expenseDate: expenses.expenseDate,
      recordedByName: users.name,
      receiptUrl: expenses.receiptUrl
    })
    .from(expenses)
    .leftJoin(users, eq(expenses.recordedBy, users.id))
    .where(and(
      eq(expenses.libraryId, libraryId),
      gte(expenses.expenseDate, toIsoDate(from)),
      lte(expenses.expenseDate, toIsoDate(to))
    ))
    .orderBy(desc(expenses.expenseDate));

  const stringifier = stringify({
    header: true,
    columns: [
      { key: 'id', header: 'Expense ID' },
      { key: 'category', header: 'Category' },
      { key: 'amount', header: 'Amount' },
      { key: 'description', header: 'Description' },
      { key: 'expenseDate', header: 'Expense Date' },
      { key: 'recordedByName', header: 'Recorded By' },
      { key: 'receiptUrl', header: 'Receipt URL' }
    ]
  });

  const readable = Readable.from(expensesData);
  return readable.pipe(stringifier);
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}