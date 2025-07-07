// client/src/app/types/salesSummary.ts

/**
 * SalesSummary type definition based on Prisma Schema
 */
export interface SalesSummary {
	id: number;
	totalValue: number;
	changePercentage?: number;
	date: string;
}

/**
 * PurchaseSummary type definition based on Prisma Schema
 */
export interface PurchaseSummary {
	id: number;
	totalPurchased: number;
	changePercentage?: number;
	date: string;
}
