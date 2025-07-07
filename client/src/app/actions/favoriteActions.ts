// client/src/app/actions/favoriteActions.ts
"use server";

import { cookies } from "next/headers";
import { getSession } from "@/app/lib/utils/get-session";

export interface Favorite {
	id: number;
	productId: number;
	userId: number;
	createdAt: Date;
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

export interface FavoritesResponse {
	favorites: Favorite[];
	totalCount: number;
	pageCount: number;
	currentPage: number;
}

/**
 * Get current user's favorite products
 */
export async function getUserFavorites({
	page = 1,
	pageSize = 12,
}: {
	page?: number;
	pageSize?: number;
} = {}): Promise<FavoritesResponse> {
	try {
		const sessionCookie = await getSession();
		if (!sessionCookie) {
			return { favorites: [], totalCount: 0, pageCount: 0, currentPage: 1 };
		}

		const queryParams = new URLSearchParams({
			page: String(page),
			pageSize: String(pageSize),
		});

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites?${queryParams}`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session=${sessionCookie}`,
				},
			}
		);

		if (!response.ok) {
			if (response.status === 401) {
				return { favorites: [], totalCount: 0, pageCount: 0, currentPage: 1 };
			}
			throw new Error(`Failed to fetch favorites: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching favorites:", error);
		return { favorites: [], totalCount: 0, pageCount: 0, currentPage: 1 };
	}
}

/**
 * Add a product to favorites
 */
export async function addToFavorites(productId: number): Promise<{
	success: boolean;
	message: string;
	favorite?: Favorite;
}> {
	try {
		const sessionCookie = await getSession();
		if (!sessionCookie) {
			return { success: false, message: "Not authenticated" };
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session=${sessionCookie}`,
				},
				body: JSON.stringify({ productId }),
			}
		);

		if (!response.ok) {
			if (response.status === 401) {
				return { success: false, message: "Not authenticated" };
			}
			if (response.status === 400) {
				const data = await response.json();
				return {
					success: false,
					message: data.message || "Product already in favorites",
				};
			}
			throw new Error(`Failed to add to favorites: ${response.status}`);
		}

		const data = await response.json();
		return {
			success: true,
			message: data.message || "Product added to favorites",
			favorite: data.favorite,
		};
	} catch (error) {
		console.error("Error adding to favorites:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to add to favorites",
		};
	}
}

/**
 * Remove a product from favorites
 */
export async function removeFromFavorites(productId: number): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const sessionCookie = await getSession();
		if (!sessionCookie) {
			return { success: false, message: "Not authenticated" };
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites/${productId}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session=${sessionCookie}`,
				},
			}
		);

		if (!response.ok) {
			if (response.status === 401) {
				return { success: false, message: "Not authenticated" };
			}
			throw new Error(`Failed to remove from favorites: ${response.status}`);
		}

		return {
			success: true,
			message: "Product removed from favorites",
		};
	} catch (error) {
		console.error("Error removing from favorites:", error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to remove from favorites",
		};
	}
}

/**
 * Toggle favorite status for a product
 */
export async function toggleFavorite(productId: number | string): Promise<{
	success: boolean;
	message: string;
	isFavorited: boolean;
}> {
	try {
		const sessionCookie = await getSession();
		if (!sessionCookie) {
			return {
				success: false,
				message: "Not authenticated",
				isFavorited: false,
			};
		}

		const numericProductId =
			typeof productId === "string" ? parseInt(productId, 10) : productId;

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites/toggle`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session=${sessionCookie}`,
				},
				body: JSON.stringify({ productId: numericProductId }),
			}
		);

		if (!response.ok) {
			if (response.status === 401) {
				return {
					success: false,
					message: "Not authenticated",
					isFavorited: false,
				};
			}
			throw new Error(`Failed to toggle favorite: ${response.status}`);
		}

		const data = await response.json();
		return {
			success: true,
			message: data.message,
			isFavorited: data.isFavorited,
		};
	} catch (error) {
		console.error("Error toggling favorite:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to toggle favorite",
			isFavorited: false,
		};
	}
}

/**
 * Check if multiple products are favorited by the current user
 */
export async function checkFavorites(
	productIds: number[]
): Promise<Record<number, boolean>> {
	try {
		const sessionCookie = await getSession();
		if (!sessionCookie) {
			// Return all as false if not authenticated
			return productIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites/check`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session=${sessionCookie}`,
				},
				body: JSON.stringify({ productIds }),
			}
		);

		if (!response.ok) {
			// Return all as false on error
			return productIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
		}

		return await response.json();
	} catch (error) {
		console.error("Error checking favorites:", error);
		// Return all as false on error
		return productIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
	}
}

/**
 * Get favorite count for a specific product (public)
 */
export async function getProductFavoriteCount(productId: number): Promise<{
	productId: number;
	favoriteCount: number;
}> {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites/count/${productId}`,
			{
				cache: "no-store",
			}
		);

		if (!response.ok) {
			return { productId, favoriteCount: 0 };
		}

		return await response.json();
	} catch (error) {
		console.error("Error getting favorite count:", error);
		return { productId, favoriteCount: 0 };
	}
}
