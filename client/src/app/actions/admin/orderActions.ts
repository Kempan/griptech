// client/src/app/actions/admin/orderActions.ts
"use server";

import { Order, OrderStatus, UpdateOrderInput } from "@/app/types";
import { getAuthToken } from "@/app/lib/utils/get-auth-token";

export interface AdminOrdersResponse {
	orders: Order[];
	totalCount: number;
}

/**
 * Fetch orders with pagination, sorting and filtering
 */
export async function getAdminOrders({
	search,
	status,
	page = 1,
	pageSize = 10,
	sortBy = "createdAt",
	sortOrder = "desc",
}: {
	search?: string;
	status?: OrderStatus;
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}): Promise<AdminOrdersResponse> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const queryParams = new URLSearchParams({
			...(search ? { search } : {}),
			...(status ? { status } : {}),
			page: String(page),
			pageSize: String(pageSize),
			sortBy,
			sortOrder,
		});

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/orders?${queryParams}`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch orders: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching admin orders:", error);
		return { orders: [], totalCount: 0 };
	}
}

/**
 * Fetch a single order by ID
 */
export async function getOrderById(id: number): Promise<Order | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/orders/${id}`,
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
			throw new Error(`Failed to fetch order: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching order ${id}:`, error);
		return null;
	}
}

/**
 * Update an order
 */
export async function updateOrder(
	id: number,
	data: UpdateOrderInput
): Promise<Order | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/orders/${id}`,
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
			throw new Error(`Failed to update order: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error updating order ${id}:`, error);
		return null;
	}
}

/**
 * Update just the order status
 */
export async function updateOrderStatus(
	id: number,
	status: OrderStatus
): Promise<Order | null> {
	return updateOrder(id, { status });
}

/**
 * Update admin notes for an order
 */
export async function updateOrderAdminNote(
	id: number,
	adminNote: string
): Promise<Order | null> {
	return updateOrder(id, { adminNote });
}

/**
 * Delete an order
 */
export async function deleteOrder(id: number): Promise<boolean> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/orders/${id}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to delete order: ${response.status}`);
		}

		return true;
	} catch (error) {
		console.error(`Error deleting order ${id}:`, error);
		return false;
	}
}

/**
 * Create a new order (typically used in checkout process)
 */
export async function createOrder(orderData: {
	items: {
		productId: number;
		quantity: number;
		options?: any;
	}[];
	customerName: string;
	customerEmail: string;
	customerPhone?: string;
	shippingAddress: any;
	billingAddress?: any;
	customerNote?: string;
	paymentMethod?: string;
}): Promise<{ order: any; success: boolean; error?: string } | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify(orderData),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.error || `Failed to create order: ${response.status}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error creating order:", error);
		return {
			success: false,
			order: null,
			error: error instanceof Error ? error.message : "Failed to create order",
		};
	}
}

/**
 * Get user's order by order number
 */
export async function getOrderByNumber(
	orderNumber: string
): Promise<any | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/user/${orderNumber}`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		// If order not found or unauthorized, we just return null instead of throwing an error
		// This allows the confirmation page to show generic information
		if (!response.ok) {
			console.warn(`Order fetch returned status: ${response.status}`);
			return null;
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching order ${orderNumber}:`, error);
		return null;
	}
}

/**
 * Get order history for the current user
 */
export async function getUserOrders(
	page = 1,
	pageSize = 10
): Promise<AdminOrdersResponse> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/orders?` +
				new URLSearchParams({
					page: String(page),
					pageSize: String(pageSize),
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
			throw new Error(`Failed to fetch user orders: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching user orders:", error);
		return { orders: [], totalCount: 0 };
	}
}

/**
 * Get a specific order for the current user
 */
export async function getUserOrderById(
	orderNumber: string
): Promise<Order | null> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/orders/${orderNumber}`,
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
			throw new Error(`Failed to fetch user order: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching user order ${orderNumber}:`, error);
		return null;
	}
}

/**
 * Dashboard - Get order statistics
 */
export async function getOrderStatistics(): Promise<{
	totalOrders: number;
	totalRevenue: number;
	averageOrderValue: number;
	pendingOrders: number;
	completedOrders: number;
	recentOrders: Order[];
}> {
	try {
		const authToken = await getAuthToken();
		if (!authToken) {
			throw new Error("No auth token found.");
		}
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/orders/statistics`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch order statistics: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching order statistics:", error);
		return {
			totalOrders: 0,
			totalRevenue: 0,
			averageOrderValue: 0,
			pendingOrders: 0,
			completedOrders: 0,
			recentOrders: [],
		};
	}
}
