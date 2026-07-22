export declare const PaymentMethod: ["cash", "upi", "card", "online"];
export type PaymentMethod = (typeof PaymentMethod)[number];
export declare const PaymentStatus: ["paid", "pending", "refunded"];
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
export declare function toPaymentResponseDTO(payment: {
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
}): PaymentResponseDTO;
export declare function toPaymentListItemDTO(payment: {
    id: string;
    studentId: string;
    amount: string | number;
    method: PaymentMethod;
    status: PaymentStatus;
    paymentDate: string;
    studentName: string;
}): PaymentListItemDTO;
