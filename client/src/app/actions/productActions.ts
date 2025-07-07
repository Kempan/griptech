"use server";

import { Product } from "@/app/types";

export async function getProducts({ limit = 999 }: { limit?: number } = {}) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/products?limit=${limit}`, // ✅ Send limit as query param
		{
			cache: "no-cache", // Ensure fresh data
		}
	);
	if (!res.ok) throw new Error("Products not found");
	return res.json();
}

export async function getProductById(id: number) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`,
		{
			cache: "no-cache", // Ensure fresh data
		}
	);
	if (!res.ok) throw new Error("Product not found");
	return res.json();
}

export async function getProductBySlug(slug: string) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/by-slug/${slug}`,
		{
			cache: "no-cache", // Ensure fresh data
		}
	);
	if (!res.ok) throw new Error("Product not found");
	return res.json();
}

export async function getProductsByCategorySlug(
	slug: string
): Promise<Product[] | null> {
	try {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/by-category/${slug}`,
			{
				cache: "no-store",
			}
		);

		if (!res.ok) throw new Error("Failed to fetch products");
		return await res.json();
	} catch (error) {
		console.error("Error fetching products:", error);
		return null;
	}
}
