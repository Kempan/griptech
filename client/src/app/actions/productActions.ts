"use server";

import { Product } from "@/app/types";
import { cookies } from "next/headers";

export async function getProducts({ limit = 999 }: { limit?: number } = {}) {
	try {
		const cookieStore = await cookies();
		const authToken = cookieStore.get("auth-token")?.value;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (authToken) {
			headers.Authorization = `Bearer ${authToken}`;
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/products?limit=${limit}`,
			{
				cache: "no-cache",
				headers,
			}
		);
		if (!res.ok) {
			console.error("Failed to fetch products:", res.status, res.statusText);
			return [];
		}
		return res.json();
	} catch (error) {
		console.error("Error fetching products:", error);
		return [];
	}
}

export async function getProductById(id: number) {
	try {
		const cookieStore = await cookies();
		const authToken = cookieStore.get("auth-token")?.value;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (authToken) {
			headers.Authorization = `Bearer ${authToken}`;
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`,
			{
				cache: "no-cache",
				headers,
			}
		);
		if (!res.ok) {
			console.error("Failed to fetch product by ID:", res.status, res.statusText);
			return null;
		}
		return res.json();
	} catch (error) {
		console.error("Error fetching product by ID:", error);
		return null;
	}
}

export async function getProductBySlug(slug: string) {
	try {
		const cookieStore = await cookies();
		const authToken = cookieStore.get("auth-token")?.value;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (authToken) {
			headers.Authorization = `Bearer ${authToken}`;
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/by-slug/${slug}`,
			{
				cache: "no-cache",
				headers,
			}
		);
		if (!res.ok) {
			console.error("Failed to fetch product by slug:", res.status, res.statusText);
			return null;
		}
		return res.json();
	} catch (error) {
		console.error("Error fetching product by slug:", error);
		return null;
	}
}

export async function getProductsByCategorySlug(
	slug: string
): Promise<Product[] | null> {
	try {
		const cookieStore = await cookies();
		const authToken = cookieStore.get("auth-token")?.value;

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (authToken) {
			headers.Authorization = `Bearer ${authToken}`;
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/by-category/${slug}`,
			{
				cache: "no-store",
				headers,
			}
		);

		if (!res.ok) {
			console.error("Failed to fetch products by category:", res.status, res.statusText);
			return [];
		}
		return await res.json();
	} catch (error) {
		console.error("Error fetching products by category:", error);
		return [];
	}
}
