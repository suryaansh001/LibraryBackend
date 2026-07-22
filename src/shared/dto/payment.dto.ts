import { paymentMethodEnum, paymentStatusEnum } from '../../db/schema/payments.js';

export const PaymentMethod = paymentMethodEnum.enumValues;
export type PaymentMethod = (typeof PaymentMethod)[number];

export const PaymentStatus = paymentStatusEnum.enumValues;
export type PaymentStatus = (typeof PaymentStatus)[number];

export interface PaymentResponseDTO {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber: string | null;
  paymentDate: string;
  dueDate: string | null;
  notes: string | null;
  recordedByName: string | null;
}

export interface PaymentListItemDTO {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
}

export function toPaymentResponseDTO(payment: {
  id: string;
  studentId: string;
  amount: string | number;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber: string | null;
  paymentDate: string;
  dueDate: string | null;
  notes: string | null;
  recordedByName: string | null;
  studentName: string;
}): PaymentResponseDTO {
  return {
    id: payment.id,
    studentId: payment.studentId,
    studentName: payment.studentName,
    amount: Number(payment.amount),
    method: payment.method,
    status: payment.status,
    referenceNumber: payment.referenceNumber,
    paymentDate: payment.paymentDate,
    dueDate: payment.dueDate,
    notes: payment.notes,
    recordedByName: payment.recordedByName
  };
}

export function toPaymentListItemDTO(payment: {
  id: string;
  studentId: string;
  amount: string | number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  studentName: string;
}): PaymentListItemDTO {
  return {
    id: payment.id,
    studentId: payment.studentId,
    studentName: payment.studentName,
    amount: Number(payment.amount),
    method: payment.method,
    status: payment.status,
    paymentDate: payment.paymentDate
  };
}
