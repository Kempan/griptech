// client/src/app/types/expense.ts

/**
 * Expense type definition based on Prisma Schema
 */
export interface Expense {
	id: number;
	category: string;
	amount: number;
	timestamp: string;
}

/**
 * ExpenseSummary type
 */
export interface ExpenseSummary {
	id: number;
	totalExpenses: number;
	date: string;
	expensesByCategory?: ExpenseByCategory[];
}

/**
 * ExpenseByCategory type
 */
export interface ExpenseByCategory {
	id: number;
	expenseSummaryId: number;
	category: string;
	amount: number;
	date: string;
	expenseSummary?: ExpenseSummary;
}
