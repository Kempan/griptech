// server/src/lib/slugify.ts
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

/**
 * Configure slugify for consistent behavior across the app
 */
const slugifyOptions = {
	lower: true, // Convert to lowercase
	strict: true, // Strip special characters except replacement
	remove: undefined, // Don't remove any characters before slugifying
	locale: "en", // Use English locale for transliteration
};

/**
 * Generate a slug using the slugify library
 */
export function generateSlug(text: string): string {
	return slugify(text, slugifyOptions);
}

/**
 * Generate a unique slug for a product
 * If the slug already exists, append a number to make it unique
 */
export async function generateUniqueProductSlug(
	prisma: PrismaClient,
	name: string,
	providedSlug?: string
): Promise<string> {
	// If a slug is provided, use it as the base
	let baseSlug = providedSlug?.trim()
		? generateSlug(providedSlug)
		: generateSlug(name);

	let slug = baseSlug;
	let count = 1;

	// Check if slug exists and increment counter until we find a unique one
	while (await prisma.product.findUnique({ where: { slug } })) {
		slug = `${baseSlug}-${count++}`;
	}

	return slug;
}

/**
 * Generate a unique slug for a category
 * If the slug already exists, append a number to make it unique
 */
export async function generateUniqueCategorySlug(
	prisma: PrismaClient,
	name: string,
	providedSlug?: string,
	excludeId?: number
): Promise<string> {
	// If a slug is provided, use it as the base
	let baseSlug = providedSlug?.trim()
		? generateSlug(providedSlug)
		: generateSlug(name);

	let slug = baseSlug;
	let count = 1;

	// Check if slug exists and increment counter until we find a unique one
	while (true) {
		const existing = await prisma.productCategory.findFirst({
			where: {
				slug,
				...(excludeId && { NOT: { id: excludeId } }),
			},
		});

		if (!existing) break;

		slug = `${baseSlug}-${count++}`;
	}

	return slug;
}
