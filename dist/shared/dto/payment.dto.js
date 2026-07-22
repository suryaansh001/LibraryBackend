import { paymentMethodEnum, paymentStatusEnum } from '../../db/schema/payments.js';
export const PaymentMethod = paymentMethodEnum.enumValues;
export const PaymentStatus = paymentStatusEnum.enumValues;
export function toPaymentResponseDTO(payment) {
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
export function toPaymentListItemDTO(payment) {
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
//# sourceMappingURL=payment.dto.js.map