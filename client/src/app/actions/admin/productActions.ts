// client/src/app/actions/admin/productActions.ts
"use server";

import { Product } from "@/app/types";
import { getSession } from "@/app/lib/utils/get-session";

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
		const sessionCookie = await getSession();

		if (!sessionCookie) {
			throw new Error("No session cookie found.");
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
					Cookie: `session=${sessionCookie}`,
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
