import { expenseCategoryEnum } from '../../db/schema/expenses.js';

export const ExpenseCategory = expenseCategoryEnum.enumValues;
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

export function toExpenseResponseDTO(expense: {
  id: string;
  category: ExpenseCategory;
  amount: string | number;
  description: string | null;
  expenseDate: string;
  recordedByName: string | null;
  receiptUrl: string | null;
  createdAt: Date;
}): ExpenseResponseDTO {
  return {
    id: expense.id,
    category: expense.category,
    amount: Number(expense.amount),
    description: expense.description,
    expenseDate: expense.expenseDate,
    recordedByName: expense.recordedByName,
    receiptUrl: expense.receiptUrl,
    createdAt: expense.createdAt.toISOString()
  };
}

export function toExpenseListItemDTO(expense: {
  id: string;
  category: ExpenseCategory;
  amount: string | number;
  description: string | null;
  expenseDate: string;
}): ExpenseListItemDTO {
  return {
    id: expense.id,
    category: expense.category,
    amount: Number(expense.amount),
    description: expense.description,
    expenseDate: expense.expenseDate
  };
}
