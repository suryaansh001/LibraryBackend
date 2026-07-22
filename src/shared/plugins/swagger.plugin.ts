import type { FastifyPluginAsync } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';

import { config } from '../../config/env.js';

const schemas = [
  ['CreateStudentBody', (await import('../../modules/students/students.schema.js')).createStudentBodySchema],
  ['UpdateStudentBody', (await import('../../modules/students/students.schema.js')).updateStudentBodySchema],
  ['UpdateStudentStatusBody', (await import('../../modules/students/students.schema.js')).updateStudentStatusBodySchema],
  ['StudentListQuery', (await import('../../modules/students/students.schema.js')).studentListQuerySchema],
  ['StudentHistoryQuery', (await import('../../modules/students/students.schema.js')).studentHistoryQuerySchema],
  ['StudentPaymentsQuery', (await import('../../modules/students/students.schema.js')).studentPaymentsQuerySchema],
  ['StudentIdParam', (await import('../../modules/students/students.schema.js')).studentIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['LoginBody', (await import('../../modules/auth/auth.schema.js')).loginBodySchema],
  ['LibrarySlugParam', (await import('../../modules/auth/auth.schema.js')).librarySlugParamSchema],

  ['CreatePaymentBody', (await import('../../modules/payments/payments.schema.js')).createPaymentBodySchema],
  ['UpdatePaymentBody', (await import('../../modules/payments/payments.schema.js')).updatePaymentBodySchema],
  ['UpdatePaymentStatusBody', (await import('../../modules/payments/payments.schema.js')).updatePaymentStatusBodySchema],
  ['PaymentListQuery', (await import('../../modules/payments/payments.schema.js')).paymentListQuerySchema],
  ['PaymentIdParam', (await import('../../modules/payments/payments.schema.js')).paymentIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['QrCheckInBody', (await import('../../modules/attendance/attendance.schema.js')).qrCheckInBodySchema],
  ['QrCheckOutBody', (await import('../../modules/attendance/attendance.schema.js')).qrCheckOutBodySchema],
  ['ManualCheckInBody', (await import('../../modules/attendance/attendance.schema.js')).manualCheckInBodySchema],
  ['ManualCheckOutBody', (await import('../../modules/attendance/attendance.schema.js')).manualCheckOutBodySchema],
  ['CorrectAttendanceBody', (await import('../../modules/attendance/attendance.schema.js')).correctAttendanceBodySchema],
  ['AttendanceListQuery', (await import('../../modules/attendance/attendance.schema.js')).attendanceListQuerySchema],
  ['AttendanceIdParam', (await import('../../modules/attendance/attendance.schema.js')).attendanceIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],

  ['CreateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).createMembershipBodySchema],
  ['UpdateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).updateMembershipBodySchema],
  ['SuspendMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).suspendMembershipBodySchema],
  ['ReactivateMembershipBody', (await import('../../modules/memberships/memberships.schema.js')).reactivateMembershipBodySchema],
  ['MembershipListQuery', (await import('../../modules/memberships/memberships.schema.js')).membershipListQuerySchema],
  ['MembershipIdParam', (await import('../../modules/memberships/memberships.schema.js')).membershipIdParamSchema],

  ['CreateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).createExpenseBodySchema],
  ['UpdateExpenseBody', (await import('../../modules/expenses/expenses.schema.js')).updateExpenseBodySchema],
  ['ExpenseListQuery', (await import('../../modules/expenses/expenses.schema.js')).expenseListQuerySchema],
  ['ExpenseIdParam', (await import('../../modules/expenses/expenses.schema.js')).expenseIdParamSchema],

  ['CreateSeatBody', (await import('../../modules/seats/seats.schema.js')).createSeatBodySchema],
  ['UpdateSeatBody', (await import('../../modules/seats/seats.schema.js')).updateSeatBodySchema],
  ['UpdateSeatStatusBody', (await import('../../modules/seats/seats.schema.js')).updateSeatStatusBodySchema],
  ['AssignSeatBody', (await import('../../modules/seats/seats.schema.js')).assignSeatBodySchema],
  ['SeatListQuery', (await import('../../modules/seats/seats.schema.js')).seatListQuerySchema],
  ['SeatIdParam', (await import('../../modules/seats/seats.schema.js')).seatIdParamSchema],

  ['CreatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).createPlanBodySchema],
  ['UpdatePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).updatePlanBodySchema],
  ['TogglePlanBody', (await import('../../modules/membership-plans/plans.schema.js')).togglePlanBodySchema],
  ['PlanListQuery', (await import('../../modules/membership-plans/plans.schema.js')).planListQuerySchema],
  ['PlanIdParam', (await import('../../modules/membership-plans/plans.schema.js')).planIdParamSchema],
];

export const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  if (config.NODE_ENV === 'production') {
    fastify.get('/api/docs', async (_, reply) => {
      void reply.code(404).send({ message: 'Not Found' });
    });

    fastify.get('/api/docs/*', async (_, reply) => {
      void reply.code(404).send({ message: 'Not Found' });
    });

    return;
  }

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'LibraryOS API',
        description: 'LibraryOS backend API',
        version: '1.0.0'
      },
      servers: [{ url: `/api/${config.API_VERSION}` }],
      components: {
        schemas: {}
      }
    },
    transform: ({ schema, url }) => {
      if (schema.body instanceof z.ZodType) {
        return {
          schema: { ...schema, body: z.toJSONSchema(schema.body) },
          url
        };
      }
      return { schema, url };
    }
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/api/docs'
  });
};
