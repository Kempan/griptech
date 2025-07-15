// client/src/app/actions/admin/productActions.ts
"use server";

import { Product } from "@/app/types";
import { getAuthToken } from "@/app/lib/utils/get-auth-token";

export interface AdminProductsResponse {
	products: Product[];
	totalCount: number;
}

/**
 * Get admin products
 */
export async function getAdminProducts({
	search,
	page = 1,
	pageSize = 10,
	sortBy = "id",
}: {
	search?: string;
	page?: number;
	pageSize?: number;
	sortBy?: string;
}): Promise<AdminProductsResponse> {
	try {
		const authToken = await getAuthToken();

		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/products?` +
				new URLSearchParams({
					...(search ? { search } : {}),
					page: String(page),
					pageSize: String(pageSize),
					sortBy,
				}),
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch products: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching admin products:", error);
		return { products: [], totalCount: 0 };
	}
}
