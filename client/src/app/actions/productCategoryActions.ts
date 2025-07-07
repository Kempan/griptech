// client/src/app/actions/productCategoryActions.ts
"use server";

import { ProductCategory } from "@/app/types";

export async function getCategories(): Promise<ProductCategory[]> {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch categories: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching categories:", error);
		return [];
	}
}

export async function getCategoryBySlug(
	slug: string
): Promise<ProductCategory | null> {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${slug}`,
			{
				cache: "no-store",
			}
		);

		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}
			throw new Error(`Failed to fetch category: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching category by slug ${slug}:`, error);
		return null;
	}
}

export async function getCategoryTopLevelBySlug(
	slug: string
): Promise<ProductCategory | null> {
	try {

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/category-top-level/${slug}`,
			{
				cache: "no-store",
			}
		);
		
		if (!response.ok) {
			if (response.status === 404) {
				return null;
			}
			throw new Error(`Failed to fetch category: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching category by slug ${slug}:`, error);
		return null;
	}
}