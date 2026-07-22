import crypto from 'node:crypto';
import { eq, and, isNull, isNotNull, desc, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { schema } from '../../db/schema/index.js';
import { attendanceSessions } from '../../db/schema/attendance-sessions.js';
import { libraryOccupancy } from '../../db/schema/library-occupancy.js';
import { memberships } from '../../db/schema/memberships.js';
import { seats } from '../../db/schema/seats.js';
import { students } from '../../db/schema/students.js';
import { AttendanceRepository } from './attendance.repository.js';
import { AuditLogRepository } from '../../shared/utils/audit-log.repository.js';
import { generateQrToken, verifyQrToken } from '../../shared/utils/qr-token.util.js';
import { toAttendanceSessionDTO, toCheckInResponseDTO, type CheckInResponseDTO, type AttendanceSessionDTO } from '../../shared/dto/attendance.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type { QrCheckInBody, ManualCheckInBody, QrCheckOutBody, ManualCheckOutBody, CorrectionBody } from '../../shared/dto/attendance.dto.js';

type Database = NodePgDatabase<typeof schema>;

export interface QrCheckInResult {
  success: true;
  data: CheckInResponseDTO;
}

export interface QrCheckOutResult {
  success: true;
  data: AttendanceSessionDTO;
}

export interface ManualCheckInResult {
  success: true;
  data: AttendanceSessionDTO;
}

export interface ManualCheckOutResult {
  success: true;
  data: AttendanceSessionDTO;
}

export interface CorrectionResult {
  success: true;
  data: AttendanceSessionDTO;
}

export class AttendanceService {
  private readonly attendanceRepository: AttendanceRepository;
  private readonly auditLogRepository: AuditLogRepository;

  public constructor(private readonly db: Database) {
    this.attendanceRepository = new AttendanceRepository(db);
    this.auditLogRepository = new AuditLogRepository(db);
  }

  public async qrCheckIn(body: QrCheckInBody, libraryId: string, ipAddress?: string): Promise<QrCheckInResult> {
    const qrPayload = verifyQrToken(body.qrToken);
    if (!qrPayload) {
      throw new AppError(ERROR_CODES.INVALID_QR_TOKEN, 'Invalid QR token', 400);
    }

    if (qrPayload.libraryId !== libraryId) {
      throw new AppError(ERROR_CODES.QR_LIBRARY_MISMATCH, 'QR token belongs to a different library', 403);
    }

    const student = await this.attendanceRepository.findStudentByQrToken(qrPayload.studentId, libraryId);
    if (!student) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    if (student.status === 'suspended') {
      throw new AppError(ERROR_CODES.STUDENT_SUSPENDED, 'Student is suspended', 403);
    }
    if (student.status === 'inactive' || student.status === 'expired') {
      throw new AppError(ERROR_CODES.STUDENT_INACTIVE, 'Student is inactive', 403);
    }

    const existingSession = await this.attendanceRepository.findOpenSessionByStudent(student.id, libraryId);
    if (existingSession) {
      throw new AppError(
        ERROR_CODES.STUDENT_ALREADY_CHECKED_IN,
        'Student is already checked in',
        409,
        { checkInAt: existingSession.checkInAt.toISOString() }
      );
    }

    const membership = await this.attendanceRepository.findActiveMembership(student.id, libraryId);
    if (!membership) {
      throw new AppError(ERROR_CODES.NO_ACTIVE_MEMBERSHIP, 'No active membership found', 403);
    }
    if (membership.type === 'monthly' && membership.endDate && new Date(membership.endDate) < new Date()) {
      throw new AppError(ERROR_CODES.MEMBERSHIP_EXPIRED, 'Monthly membership has expired', 403);
    }
    if (membership.type === 'hourly' && membership.hoursRemaining !== null && Number(membership.hoursRemaining) <= 0) {
      throw new AppError(ERROR_CODES.NO_HOURS_REMAINING, 'No hours remaining in hourly membership', 403);
    }

    let seatId = student.seatId ?? null;
    let seatNumber = null;

    if (!seatId && membership.type === 'monthly') {
      const availableSeat = await this.attendanceRepository.findAvailableFlexibleSeat(libraryId);
      if (availableSeat) {
        seatId = availableSeat.id;
        seatNumber = availableSeat.seatNumber;
        await this.attendanceRepository.assignSeatToStudent(seatId, student.id, libraryId);
        await this.attendanceRepository.updateSeatStatus(seatId, 'occupied', libraryId);
      }
    } else if (seatId) {
      const seat = await this.attendanceRepository.findSeatById(seatId, libraryId);
      if (seat) {
        seatNumber = seat.seatNumber;
        if (seat.status !== 'occupied') {
          await this.attendanceRepository.updateSeatStatus(seatId, 'occupied', libraryId);
        }
      }
    }

    const sessionId = crypto.randomUUID();
    const now = new Date();

    await this.db.transaction(async (tx) => {
      await tx.insert(attendanceSessions).values({
        id: sessionId,
        libraryId,
        studentId: student.id,
        membershipId: membership.id,
        checkInAt: now,
        checkInMethod: 'qr',
        checkInBy: undefined,
        updatedAt: now
      });

      await tx
        .update(libraryOccupancy)
        .set({
          currentCount: sql`${libraryOccupancy.currentCount} + 1`,
          lastUpdatedAt: now
        })
        .where(eq(libraryOccupancy.libraryId, libraryId));
    });

    setImmediate(() => {
      this.auditLogRepository.create({
        libraryId,
        userId: undefined,
        requestId: crypto.randomUUID(),
        action: 'QR_CHECK_IN',
        entityType: 'attendance_sessions',
        entityId: sessionId,
        newValue: { studentId: student.id, seatId, membershipId: membership.id },
        ipAddress
      }).catch(() => {});
    });

    const occupancy = await this.attendanceRepository.getOccupancy(libraryId);

    const checkInData = await this.attendanceRepository.findSessionById(sessionId, libraryId);
    if (!checkInData) {
      throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to retrieve check-in data', 500);
    }

    return {
      success: true,
      data: {
        sessionId: checkInData.id,
        studentName: student.name,
        seatNumber,
        membershipType: membership.type,
        checkInAt: checkInData.checkInAt.toISOString(),
        currentOccupancy: occupancy.currentCount
      }
    };
  }

  public async qrCheckOut(body: { qrToken: string }, libraryId: string, ipAddress?: string): Promise<{ success: true; data: AttendanceSessionDTO }> {
    const qrPayload = verifyQrToken(body.qrToken);
    if (!qrPayload) {
      throw new AppError(ERROR_CODES.INVALID_QR_TOKEN, 'Invalid QR token', 400);
    }
    if (qrPayload.libraryId !== libraryId) {
      throw new AppError(ERROR_CODES.QR_LIBRARY_MISMATCH, 'QR token belongs to a different library', 403);
    }

    const student = await this.attendanceRepository.findStudentByQrToken(qrPayload.studentId, libraryId);
    if (!student) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    const openSession = await this.attendanceRepository.findOpenSessionByStudent(student.id, libraryId);
    if (!openSession) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_CHECKED_IN, 'Student is not checked in', 409);
    }

    const membership = await this.attendanceRepository.findActiveMembership(student.id, libraryId);
    if (!membership) {
      throw new AppError(ERROR_CODES.NO_ACTIVE_MEMBERSHIP, 'No active membership', 403);
    }

    const checkOutAt = new Date();
    const durationMinutes = Math.round((checkOutAt.getTime() - openSession.checkInAt.getTime()) / 60000);

    await this.db.transaction(async (tx) => {
      const updated = await tx
        .update(attendanceSessions)
        .set({
          checkOutAt,
          durationMinutes,
          checkOutMethod: 'qr',
          updatedAt: checkOutAt
        })
        .where(and(
          eq(attendanceSessions.id, openSession.id),
          eq(attendanceSessions.libraryId, libraryId),
          isNull(attendanceSessions.checkOutAt)
        ))
        .returning();

      if (updated.length === 0) {
        throw new AppError(ERROR_CODES.STUDENT_NOT_CHECKED_IN, 'Concurrent check-out detected', 409);
      }

      if (membership.type === 'hourly') {
        const hoursUsed = durationMinutes / 60;
        const newHoursUsed = Number(membership.hoursUsed) + hoursUsed;
        const newHoursRemaining = membership.hoursRemaining !== null
          ? Math.max(0, Number(membership.hoursRemaining) - hoursUsed)
          : null;

        await tx
          .update(memberships)
          .set({
            hoursUsed: newHoursUsed.toFixed(2),
            hoursRemaining: newHoursRemaining?.toFixed(2) ?? null,
            updatedAt: checkOutAt
          })
          .where(eq(memberships.id, membership.id));
      }

      await tx
        .update(libraryOccupancy)
        .set({
          currentCount: sql`GREATEST(0, ${libraryOccupancy.currentCount} - 1)`,
          lastUpdatedAt: checkOutAt
        })
        .where(eq(libraryOccupancy.libraryId, libraryId));
    });

    setImmediate(() => {
      this.auditLogRepository.create({
        libraryId,
        userId: undefined,
        requestId: crypto.randomUUID(),
        action: 'QR_CHECK_OUT',
        entityType: 'attendance_sessions',
        entityId: openSession.id,
        oldValue: { checkInAt: openSession.checkInAt },
        newValue: { checkOutAt, durationMinutes, checkOutMethod: 'qr' },
        ipAddress
      }).catch(() => {});
    });

    const completed = await this.attendanceRepository.findSessionById(openSession.id, libraryId);
    if (!completed) {
      throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to retrieve check-out data', 500);
    }

    return {
      success: true,
      data: toAttendanceSessionDTO({ ...completed, studentName: '', seatNumber: null, checkInMethod: 'qr', checkOutMethod: 'qr', isManualCorrection: false })
    };
  }

  public async manualCheckIn(body: { studentId: string; seatId?: string }, ctx: RequestContext, ipAddress?: string): Promise<{ success: true; data: AttendanceSessionDTO }> {
    const student = await this.attendanceRepository.findStudentById(body.studentId, ctx.libraryId);
    if (!student) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    if (student.status === 'suspended') {
      throw new AppError(ERROR_CODES.STUDENT_SUSPENDED, 'Student is suspended', 403);
    }
    if (student.status === 'inactive' || student.status === 'expired') {
      throw new AppError(ERROR_CODES.STUDENT_INACTIVE, 'Student is inactive', 403);
    }

    const existingSession = await this.attendanceRepository.findOpenSessionByStudent(body.studentId, ctx.libraryId);
    if (existingSession) {
      throw new AppError(ERROR_CODES.STUDENT_ALREADY_CHECKED_IN, 'Student is already checked in', 409);
    }

    const membership = await this.attendanceRepository.findActiveMembership(body.studentId, ctx.libraryId);
    if (!membership) {
      throw new AppError(ERROR_CODES.NO_ACTIVE_MEMBERSHIP, 'No active membership', 403);
    }
    if (membership.type === 'monthly' && membership.endDate && new Date(membership.endDate) < new Date()) {
      throw new AppError(ERROR_CODES.MEMBERSHIP_EXPIRED, 'Monthly membership expired', 403);
    }
    if (membership.type === 'hourly' && membership.hoursRemaining !== null && Number(membership.hoursRemaining) <= 0) {
      throw new AppError(ERROR_CODES.NO_HOURS_REMAINING, 'No hours remaining', 403);
    }

    let seatId = body.seatId ?? student.seatId ?? null;
    let seatNumber = null;

    if (seatId) {
      const seat = await this.attendanceRepository.findSeatById(seatId, ctx.libraryId);
      if (seat && seat.status === 'available') {
        seatNumber = seat.seatNumber;
        await this.attendanceRepository.assignSeatToStudent(seatId, body.studentId, ctx.libraryId);
        await this.attendanceRepository.updateSeatStatus(seatId, 'occupied', ctx.libraryId);
      } else {
        seatId = null;
      }
    }

    const sessionId = crypto.randomUUID();
    const now = new Date();

    await this.db.transaction(async (tx) => {
      await tx.insert(attendanceSessions).values({
        id: sessionId,
        libraryId: ctx.libraryId,
        studentId: body.studentId,
        membershipId: membership.id,
        checkInAt: now,
        checkInMethod: 'manual',
        checkInBy: ctx.user?.id,
        updatedAt: now
      });

      await tx
        .update(libraryOccupancy)
        .set({ currentCount: sql`${libraryOccupancy.currentCount} + 1`, lastUpdatedAt: now })
        .where(eq(libraryOccupancy.libraryId, ctx.libraryId));
    });

    setImmediate(() => {
      this.auditLogRepository.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'MANUAL_CHECK_IN',
        entityType: 'attendance_sessions',
        entityId: sessionId,
        newValue: { studentId: body.studentId, seatId, membershipId: membership.id, checkedInBy: ctx.user?.id },
        ipAddress
      }).catch(() => {});
    });

    const session = await this.attendanceRepository.findSessionById(sessionId, ctx.libraryId);
    if (!session) {
      throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to retrieve session', 500);
    }

    const occupancy = await this.attendanceRepository.getOccupancy(ctx.libraryId);
    return {
      success: true,
      data: toAttendanceSessionDTO({ ...session, studentName: student.name, seatNumber, checkInMethod: 'manual', checkOutMethod: null, isManualCorrection: false })
    };
  }

  public async manualCheckOut(body: { studentId: string }, ctx: RequestContext, ipAddress?: string): Promise<{ success: true; data: AttendanceSessionDTO }> {
    const openSession = await this.attendanceRepository.findOpenSessionByStudent(body.studentId, ctx.libraryId);
    if (!openSession) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_CHECKED_IN, 'Student is not checked in', 409);
    }

    const checkOutAt = new Date();
    const durationMinutes = Math.round((checkOutAt.getTime() - openSession.checkInAt.getTime()) / 60000);

    await this.db.transaction(async (tx) => {
      const updated = await tx
        .update(attendanceSessions)
        .set({
          checkOutAt,
          durationMinutes,
          checkOutMethod: 'manual',
          checkOutBy: ctx.user?.id,
          updatedAt: checkOutAt
        })
        .where(and(eq(attendanceSessions.id, openSession.id), isNull(attendanceSessions.checkOutAt)))
        .returning();

      if (updated.length === 0) {
        throw new AppError(ERROR_CODES.STUDENT_NOT_CHECKED_IN, 'Concurrent check-out detected', 409);
      }

      await tx
        .update(libraryOccupancy)
        .set({ currentCount: sql`GREATEST(0, ${libraryOccupancy.currentCount} - 1)`, lastUpdatedAt: checkOutAt })
        .where(eq(libraryOccupancy.libraryId, ctx.libraryId));
    });

    setImmediate(() => {
      this.auditLogRepository.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'MANUAL_CHECK_OUT',
        entityType: 'attendance_sessions',
        entityId: openSession.id,
        oldValue: { checkInAt: openSession.checkInAt },
        newValue: { checkOutAt, durationMinutes, checkOutMethod: 'manual', checkedOutBy: ctx.user?.id },
        ipAddress
      }).catch(() => {});
    });

    const completed = await this.attendanceRepository.findSessionById(openSession.id, ctx.libraryId);
    if (!completed) {
      throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to retrieve session', 500);
    }

    return {
      success: true,
      data: toAttendanceSessionDTO({ ...completed, studentName: '', seatNumber: null, checkInMethod: 'manual', checkOutMethod: 'manual', isManualCorrection: false })
    };
  }

  public async correctSession(body: { sessionId: string; checkInAt: string; checkOutAt: string; checkInMethod: 'qr' | 'manual'; checkOutMethod: 'qr' | 'manual' | 'auto' | 'forgot'; correctionReason: string }, ctx: RequestContext, ipAddress?: string): Promise<{ success: true; data: AttendanceSessionDTO }> {
    if (ctx.user?.role !== 'owner') {
      throw new AppError(ERROR_CODES.INSUFFICIENT_PERMISSIONS, 'Only owner can correct attendance', 403);
    }
    if (!body.correctionReason || body.correctionReason.length < 10) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Correction reason must be at least 10 characters', 400);
    }

    const session = await this.attendanceRepository.findSessionById(body.sessionId, ctx.libraryId);
    if (!session) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Session not found', 404);
    }

    const newCheckInAt = new Date(body.checkInAt);
    const newCheckOutAt = new Date(body.checkOutAt);
    if (newCheckOutAt <= newCheckInAt) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Check-out must be after check-in', 400);
    }

    const newDuration = Math.round((newCheckOutAt.getTime() - newCheckInAt.getTime()) / 60000);

    await this.db.transaction(async (tx) => {
      await tx
        .update(attendanceSessions)
        .set({
          checkInAt: newCheckInAt,
          checkOutAt: newCheckOutAt,
          durationMinutes: newDuration,
          checkInMethod: body.checkInMethod,
          checkOutMethod: body.checkOutMethod,
          isManualCorrection: true,
          correctionReason: body.correctionReason,
          updatedAt: new Date()
        })
        .where(eq(attendanceSessions.id, body.sessionId));

      await this.auditLogRepository.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'ATTENDANCE_CORRECTION',
        entityType: 'attendance_sessions',
        entityId: body.sessionId,
        oldValue: { checkInAt: session.checkInAt, checkOutAt: session.checkOutAt, durationMinutes: session.durationMinutes },
        newValue: { checkInAt: newCheckInAt, checkOutAt: newCheckOutAt, durationMinutes: newDuration, reason: body.correctionReason },
        ipAddress
      }, tx);
    });

    const corrected = await this.attendanceRepository.findSessionById(body.sessionId, ctx.libraryId);
    if (!corrected) {
      throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, 'Failed to retrieve corrected session', 500);
    }

    return {
      success: true,
      data: toAttendanceSessionDTO({ ...corrected, studentName: '', seatNumber: null, checkInMethod: body.checkInMethod, checkOutMethod: body.checkOutMethod, isManualCorrection: true })
    };
  }

  public async listSessions(query: { date?: string; studentId?: string; status?: 'active' | 'completed' | 'corrected'; page: number; limit: number }, libraryId: string): Promise<{ data: AttendanceSessionDTO[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const conditions = [eq(attendanceSessions.libraryId, libraryId)];

    if (query.date) {
      const date = new Date(query.date);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      conditions.push(
        and(
          sql`${attendanceSessions.checkInAt} >= ${startOfDay}`,
          sql`${attendanceSessions.checkInAt} <= ${endOfDay}`
        )!
      );
    }

    if (query.studentId) {
      conditions.push(eq(attendanceSessions.studentId, query.studentId));
    }

    if (query.status === 'active') {
      conditions.push(isNull(attendanceSessions.checkOutAt));
    } else if (query.status === 'completed') {
      conditions.push(isNotNull(attendanceSessions.checkOutAt));
    }

    const whereClause = and(...conditions);

    const [countResult, sessionRows] = await Promise.all([
      this.db.select({ total: sql`count(*)` }).from(attendanceSessions).where(whereClause),
      this.db
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
          isManualCorrection: attendanceSessions.isManualCorrection
        })
        .from(attendanceSessions)
        .leftJoin(students, eq(attendanceSessions.studentId, students.id))
        .leftJoin(seats, eq(students.seatId, seats.id))
        .where(whereClause)
        .orderBy(desc(attendanceSessions.checkInAt))
        .limit(query.limit)
        .offset(offset)
    ]);

    const total = Number(countResult[0]?.total ?? 0);
    const data = sessionRows.map((row) => ({
      id: row.id,
      studentId: row.studentId,
      studentName: row.studentName ?? '',
      seatNumber: row.seatNumber ?? null,
      checkInAt: row.checkInAt.toISOString(),
      checkOutAt: row.checkOutAt?.toISOString() ?? null,
      durationMinutes: row.durationMinutes ?? null,
      checkInMethod: row.checkInMethod,
      checkOutMethod: row.checkOutMethod,
      isManualCorrection: row.isManualCorrection ?? false
    }));

    return { data, total };
  }

  public async getLiveOccupancy(libraryId: string): Promise<{ currentCount: number; capacity: number; availableFlexible: number }> {
    const occupancy = await this.attendanceRepository.getOccupancy(libraryId);
    return {
      currentCount: occupancy.currentCount,
      capacity: occupancy.capacity,
      availableFlexible: occupancy.availableFlexible
    };
  }
}