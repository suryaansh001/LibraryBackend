import { expenseCategoryEnum } from '../../db/schema/expenses.js';
export const ExpenseCategory = expenseCategoryEnum.enumValues;
export function toExpenseResponseDTO(expense) {
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
export function toExpenseListItemDTO(expense) {
    return {
        id: expense.id,
        category: expense.category,
        amount: Number(expense.amount),
        description: expense.description,
        expenseDate: expense.expenseDate
    };
}
//# sourceMappingURL=expense.dto.js.map