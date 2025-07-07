// client/src/app/lib/utils/formatCurrency.ts

export function formatCurrency(amount: number, currency: string = "SEK"): string {
	return new Intl.NumberFormat("sv-SE", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 2,
	}).format(amount);
}
