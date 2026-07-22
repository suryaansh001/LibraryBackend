export declare const ExpenseCategory: ["rent", "electricity", "internet", "salary", "maintenance", "miscellaneous"];
export type ExpenseCategory = (typeof ExpenseCategory)[number];
export interface ExpenseResponseDTO {
    id: string;
    category: ExpenseCategory;
    amount: number;
    description: string | null;
    expenseDate: string;
    recordedByName: string | null;
    receiptUrl: string | null;
    createdAt: string;
}
export interface ExpenseListItemDTO {
    id: string;
    category: ExpenseCategory;
    amount: number;
    description: string | null;
    expenseDate: string;
}
export declare function toExpenseResponseDTO(expense: {
    id: string;
    category: ExpenseCategory;
    amount: string | number;
    description: string | null;
    expenseDate: string;
    recordedByName: string | null;
    receiptUrl: string | null;
    createdAt: Date;
}): ExpenseResponseDTO;
export declare function toExpenseListItemDTO(expense: {
    id: string;
    category: ExpenseCategory;
    amount: string | number;
    description: string | null;
    expenseDate: string;
}): ExpenseListItemDTO;
