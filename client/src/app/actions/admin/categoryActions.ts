// client/src/app/actions/admin/categoryActions.ts
"use server";

import { ProductCategory } from "@/app/types";
import { getAuthToken } from "@/app/lib/utils/get-auth-token";

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(
	id: number
): Promise<ProductCategory | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/categories/${id}`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,	
				},
			}
		);

		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}
			console.error(`Failed to fetch category: ${response.status}`);
			return null;
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(`Error fetching category ${id}:`, error);
		return null;
	}
}

/**
 * Update a category
 */
export async function updateCategory(
	id: number,
	data: {
		name: string;
		slug: string;
		parentId: number | null;
		description: string;
		metaTitle: string;
		metaDescription: string;
		metaKeywords: string;
	}
): Promise<ProductCategory | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/categories/${id}`,
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
			throw new Error(`Failed to update category: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error updating category ${id}:`, error);
		return null;
	}
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number): Promise<boolean> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/categories/${id}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to delete category: ${response.status}`);
		}

		return true;
	} catch (error) {
		console.error(`Error deleting category ${id}:`, error);
		return false;
	}
}
