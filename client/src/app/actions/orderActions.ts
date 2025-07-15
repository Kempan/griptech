// client/src/app/actions/orderActions.ts
"use server";

import { getAuthToken } from "@/app/lib/utils/get-auth-token";
import { Order, OrderStatus } from "../types";

/**
 * Create a new order from checkout
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
	userId?: number;
}): Promise<{ order: any; success: boolean; error?: string } | null> {
	try {
		console.log(
			"Creating order with data:",
			JSON.stringify({
				...orderData,
				items: `${orderData.items.length} items`,
			})
		);

		const authToken = await getAuthToken();

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
 * Get customer orders with pagination, filtering and sorting
 */
export async function getCustomerOrders({
	userId,
	search,
	status,
	page = 1,
	pageSize = 10,
	sortBy = "createdAt",
	sortOrder = "desc",
}: {
	userId: number;
	search?: string;
	status?: OrderStatus;
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}): Promise<{ orders: Order[]; totalCount: number }> {
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
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/user?${queryParams}`,
			{
				method: "GET",
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`, // Use Authorization header
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch user orders: ${response.status}`);
		}

		const data = await response.json();
		return {
			orders: data.orders || [],
			totalCount: data.totalCount || 0,
		};
	} catch (error) {
		console.error("Error fetching customer orders:", error);
		return { orders: [], totalCount: 0 };
	}
}

/**
 * Get order by ID for customer viewing
 */
export async function getCustomerOrderById(
	orderId: string | number
): Promise<Order | null> {
	try {
		const id = typeof orderId === "string" ? parseInt(orderId, 10) : orderId;

		const authToken = await getAuthToken();

		if (!authToken) {
			console.error("No auth token found");
			return null;
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${id}`,
			{
				cache: "no-store",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`, // Use Authorization header
				},
			}
		);

		if (!response.ok) {
			if (response.status === 404) {
				console.error(`Order with ID ${id} not found`);
				return null;
			}
			throw new Error(`Failed to fetch order: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching order ${orderId}:`, error);
		return null;
	}
}
