"use server";

import { User, UpdateUserInput } from "@/app/types";
import { revalidatePath } from "next/cache";
import { getAuthToken } from "@/app/lib/utils/get-auth-token";

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		return res.ok ? await res.json() : [];
	} catch (err) {
		console.error("Error fetching users:", err);
		return [];
	}
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${id}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!res.ok) return null;
		return await res.json();
	} catch (err) {
		console.error(`Error fetching user ${id}:`, err);
		return null;
	}
}

/**
 * Create a new user
 */
export async function createUser(userData: {
	name: string;
	email: string;
	password: string;
	roles: string[];
	phone?: string;
	shippingAddress?: any;
	billingAddress?: any;
}): Promise<User | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify(userData),
			}
		);

		return res.ok ? await res.json() : null;
	} catch (err) {
		console.error("Error creating user:", err);
		return null;
	}
}

/**
 * Update user
 */
export async function updateUser(
	id: number,
	userData: UpdateUserInput
): Promise<User | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify(userData),
			}
		);

		if (!res.ok) return null;
		const data = await res.json();
		revalidatePath(`/[locale]/admin/user/${id}`);
		return data;
	} catch (err) {
		console.error(`Error updating user ${id}:`, err);
		return null;
	}
}

/**
 * Delete user
 */
export async function deleteUser(id: number): Promise<boolean> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${id}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!res.ok) return false;
		revalidatePath("/[locale]/admin/users");
		return true;
	} catch (err) {
		console.error(`Error deleting user ${id}:`, err);
		return false;
	}
}

/**
 * Search users
 */
export async function searchUsers(query: string): Promise<User[]> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const res = await fetch(
			`${
				process.env.NEXT_PUBLIC_API_BASE_URL
			}/admin/users/search?query=${encodeURIComponent(query)}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		return res.ok ? await res.json() : [];
	} catch (err) {
		console.error("Error searching users:", err);
		return [];
	}
}

/**
 * Connect user to order
 */
export async function connectOrderToUser(
	orderId: number,
	userId: number | null
): Promise<boolean> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/orders/${orderId}/connect-user`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({ userId }),
			}
		);

		if (!res.ok) return false;
		revalidatePath(`/[locale]/admin/order/${orderId}`);
		return true;
	} catch (err) {
		console.error("Error connecting order to user:", err);
		return false;
	}
}

/**
 * Get user orders
 */
export async function getUserOrders(userId: number): Promise<{
	orders: any[];
	totalCount: number;
	pageCount: number;
	currentPage: number;
}> {
	try {
		const authToken = await getAuthToken();
		if (!authToken)
			return { orders: [], totalCount: 0, pageCount: 0, currentPage: 1 };

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}/orders`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		return res.ok
			? await res.json()
			: { orders: [], totalCount: 0, pageCount: 0, currentPage: 1 };
	} catch (err) {
		console.error("Error fetching user orders:", err);
		return { orders: [], totalCount: 0, pageCount: 0, currentPage: 1 };
	}
}

/**
 * Fetch current user profile
 */
export async function fetchUserProfile() {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!res.ok) {
			if (res.status === 401) return null;
			throw new Error("Failed to fetch profile");
		}

		return await res.json();
	} catch (err) {
		console.error("Error fetching user profile:", err);
		return null;
	}
}

/**
 * Update user addresses
 */
export async function updateUserAddresses({
	shippingAddress,
	billingAddress,
	useSameAddress = false,
}: {
	shippingAddress: any;
	billingAddress?: any;
	useSameAddress: boolean;
}) {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/addresses`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({
					shippingAddress,
					billingAddress: useSameAddress ? null : billingAddress,
					useSameAddress,
				}),
			}
		);

		if (!res.ok) throw new Error("Failed to update addresses");

		revalidatePath("/[locale]/account/addresses");
		return await res.json();
	} catch (err) {
		console.error("Error updating user addresses:", err);
		return null;
	}
}
