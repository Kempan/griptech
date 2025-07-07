// app/lib/utils/dateFormat.ts

/**
 * Format a date string consistently for display
 *
 * @param dateString ISO date string or null/undefined
 * @param defaultText Text to show when date is missing
 * @returns Formatted date string for display
 */
export function formatDateDisplay(
	dateString: string | null | undefined,
	defaultText = "Not yet"
): string {
	if (!dateString) return defaultText;

	try {
		// Parse the ISO string and format it consistently
		const date = new Date(dateString);

		// Check if the date is valid
		if (isNaN(date.getTime())) {
			return defaultText;
		}

		// Format the date consistently (this avoids hydration errors)
		return new Intl.DateTimeFormat("sv-SE", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	} catch (e) {
		console.error("Error formatting date:", e);
		return defaultText;
	}
}

/**
 * Convert a date to a consistent ISO string format for storage or passing between components
 *
 * @param date Date object or date string or null/undefined
 * @returns ISO string or null
 */
export function toISOString(
	date: Date | string | null | undefined
): string | null {
	if (!date) return null;

	try {
		if (typeof date === "string") {
			date = new Date(date);
		}

		return date.toISOString();
	} catch (e) {
		console.error("Error converting to ISO string:", e);
		return null;
	}
}
