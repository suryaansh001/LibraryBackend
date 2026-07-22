import { z } from 'zod';

import { paginationQuerySchema } from '../../shared/utils/pagination.util.js';
import { uuidParamSchema } from '../../shared/utils/uuid.util.js';

export const qrCheckInBodySchema = z.object({
  qrToken: z.string().min(1)
}).strict();

export const qrCheckOutBodySchema = z.object({
  qrToken: z.string().min(1)
}).strict();

export const manualCheckInBodySchema = z.object({
  studentId: uuidParamSchema,
  seatId: uuidParamSchema.optional()
}).strict();

export const manualCheckOutBodySchema = z.object({
  studentId: uuidParamSchema
}).strict();

export const correctAttendanceBodySchema = z.object({
  sessionId: uuidParamSchema,
  checkInAt: z.string().datetime(),
  checkOutAt: z.string().datetime(),
  checkInMethod: z.enum(['qr', 'manual']),
  checkOutMethod: z.enum(['qr', 'manual', 'auto', 'forgot']),
  correctionReason: z.string().min(10)
}).strict();

export const attendanceListQuerySchema = paginationQuerySchema.extend({
  date: z.string().date().optional(),
  studentId: uuidParamSchema.optional(),
  status: z.enum(['active', 'completed', 'corrected']).optional()
});

export const attendanceIdParamSchema = z.object({
  id: uuidParamSchema
});

export type QrCheckInBody = z.infer<typeof qrCheckInBodySchema>;
export type QrCheckOutBody = z.infer<typeof qrCheckOutBodySchema>;
export type ManualCheckInBody = z.infer<typeof manualCheckInBodySchema>;
export type ManualCheckOutBody = z.infer<typeof manualCheckOutBodySchema>;
export type CorrectAttendanceBody = z.infer<typeof correctAttendanceBodySchema>;
export type AttendanceListQuery = z.infer<typeof attendanceListQuerySchema>;
export type AttendanceIdParam = z.infer<typeof attendanceIdParamSchema>;