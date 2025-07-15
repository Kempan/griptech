// client/src/app/actions/bundleActions.ts
"use server";

import { getAuthToken } from "@/app/lib/utils/get-auth-token";
import { revalidatePath } from "next/cache";

export interface BundleItem {
	productId: number;
	quantity: number;
	order: number;
	product?: {
		id: number;
		name: string;
		slug: string;
		price: number;
		stockQuantity?: number;
		categories?: Array<{
			id: number;
			name: string;
			slug: string;
		}>;
	};
}

export interface ProductBundle {
	id: number;
	userId: number;
	name: string;
	description?: string | null;
	items: BundleItem[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface BundlesResponse {
	bundles: ProductBundle[];
	totalCount: number;
	pageCount: number;
	currentPage: number;
}

/**
 * Get current user's product bundles
 */
export async function getUserBundles({
	page = 1,
	pageSize = 10,
}: {
	page?: number;
	pageSize?: number;
} = {}): Promise<BundlesResponse> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const queryParams = new URLSearchParams({
			page: String(page),
			pageSize: String(pageSize),
		});

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/bundles?${queryParams}`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		return await response.json();
	} catch (error) {
		console.error("Error fetching bundles:", error);
		return { bundles: [], totalCount: 0, pageCount: 0, currentPage: 1 };
	}
}

/**
 * Get a single bundle by ID
 */
export async function getBundleById(id: number): Promise<ProductBundle | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/bundles/${id}`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error(`Failed to fetch bundle: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching bundle ${id}:`, error);
		return null;
	}
}

/**
 * Create a new bundle
 */
export async function createBundle(data: {
	name: string;
	description?: string;
}): Promise<{
	success: boolean;
	message: string;
	bundle?: ProductBundle;
}> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/bundles`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify(data),
			}
		);

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				message: error.message || "Failed to create bundle",
			};
		}

		const result = await response.json();

		// Revalidate the bundles pages
		revalidatePath("/favorite-bundles");
		revalidatePath("/[locale]/favorite-bundles");

		return {
			success: true,
			message: result.message,
			bundle: result.bundle,
		};
	} catch (error) {
		console.error("Error creating bundle:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to create bundle",
		};
	}
}

/**
 * Update bundle details (name, description)
 */
export async function updateBundle(
	id: number,
	data: {
		name?: string;
		description?: string;
	}
): Promise<{
	success: boolean;
	message: string;
	bundle?: ProductBundle;
}> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/bundles/${id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify(data),
			}
		);

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				message: error.message || "Failed to update bundle",
			};
		}

		const result = await response.json();

		// Revalidate the bundle detail page and list
		revalidatePath(`/favorite-bundles/${id}`);
		revalidatePath(`/[locale]/favorite-bundles/${id}`);
		revalidatePath("/favorite-bundles");
		revalidatePath("/[locale]/favorite-bundles");

		return {
			success: true,
			message: result.message,
			bundle: result.bundle,
		};
	} catch (error) {
		console.error("Error updating bundle:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to update bundle",
		};
	}
}

/**
 * Update bundle items (for reordering, updating quantities)
 */
export async function updateBundleItems(
	id: number,
	items: Array<{
		productId: number;
		quantity: number;
		order: number;
	}>
): Promise<{
	success: boolean;
	message: string;
	bundle?: ProductBundle;
}> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/bundles/${id}/items`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({ items }),
			}
		);

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				message: error.message || "Failed to update bundle items",
			};
		}

		const result = await response.json();

		// Revalidate the bundle detail page
		revalidatePath(`/favorite-bundles/${id}`);
		revalidatePath(`/[locale]/favorite-bundles/${id}`);

		return {
			success: true,
			message: result.message,
			bundle: result.bundle,
		};
	} catch (error) {
		console.error("Error updating bundle items:", error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to update bundle items",
		};
	}
}

/**
 * Add a product to bundle
 */
export async function addProductToBundle(
	bundleId: number,
	productId: number,
	quantity: number = 1
): Promise<{
	success: boolean;
	message: string;
	bundle?: ProductBundle;
}> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/bundles/${bundleId}/products`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({ productId, quantity }),
			}
		);

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				message: error.message || "Failed to add product to bundle",
			};
		}

		const result = await response.json();

		// Revalidate the bundle detail page and list
		revalidatePath(`/favorite-bundles/${bundleId}`);
		revalidatePath(`/[locale]/favorite-bundles/${bundleId}`);
		revalidatePath("/favorite-bundles");
		revalidatePath("/[locale]/favorite-bundles");

		return {
			success: true,
			message: result.message,
			bundle: result.bundle,
		};
	} catch (error) {
		console.error("Error adding product to bundle:", error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to add product to bundle",
		};
	}
}

/**
 * Remove a product from bundle
 */
export async function removeProductFromBundle(
	bundleId: number,
	productId: number
): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/bundles/${bundleId}/products/${productId}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				message: error.message || "Failed to remove product from bundle",
			};
		}

		const result = await response.json();

		// Revalidate the bundle detail page
		revalidatePath(`/favorite-bundles/${bundleId}`);
		revalidatePath(`/[locale]/favorite-bundles/${bundleId}`);

		return {
			success: true,
			message: result.message,
		};
	} catch (error) {
		console.error("Error removing product from bundle:", error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to remove product from bundle",
		};
	}
}

/**
 * Delete a bundle
 */
export async function deleteBundle(id: number): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/bundles/${id}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			const error = await response.json();
			return {
				success: false,
				message: error.message || "Failed to delete bundle",
			};
		}

		// Revalidate the bundles list page
		revalidatePath("/favorite-bundles");
		revalidatePath("/[locale]/favorite-bundles");

		return {
			success: true,
			message: "Bundle deleted successfully",
		};
	} catch (error) {
		console.error("Error deleting bundle:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to delete bundle",
		};
	}
}
