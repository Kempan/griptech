// client/src/app/types/orders.ts

import { Product } from "./product";
import { User } from "./user";

export enum OrderStatus {
	PENDING = "PENDING",
	PROCESSING = "PROCESSING",
	ON_HOLD = "ON_HOLD",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
	REFUNDED = "REFUNDED",
	FAILED = "FAILED",
}

export interface OrderAddress {
	firstName: string;
	lastName: string;
	company?: string;
	address1: string;
	address2?: string;
	city: string;
	state?: string;
	postalCode: string;
	country: string;
	phone?: string;
}

export interface OrderItem {
	id: number;
	orderId: number;
	productId: number;
	quantity: number;
	price: number;
	name: string;
	sku?: string;
	options?: any; // This can be more specific if you have a consistent structure
	product?: Product; // For relations when needed
}

export interface Order {
	id: number;
	orderNumber: string;
	userId?: number;
	status: OrderStatus;

	// Payment details
	total: number;
	subtotal: number;
	tax: number;
	shipping: number;
	discount?: number;
	currency: string;
	paymentMethod?: string;
	paymentId?: string;

	// Customer information
	customerEmail: string;
	customerName: string;
	customerPhone?: string;

	// Addresses
	shippingAddress: OrderAddress;
	billingAddress?: OrderAddress;

	// Notes
	customerNote?: string;
	adminNote?: string;

	// Timestamps
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	paidAt?: string; // ISO date string
	shippedAt?: string; // ISO date string

	// Relations
	user?: User;
	orderItems: OrderItem[];
}

// Types for API responses
export interface OrdersResponse {
	orders: Order[];
	totalCount: number;
	pageCount: number;
	currentPage: number;
}

export interface OrderStatistics {
	totalOrders: number;
	totalRevenue: number;
	averageOrderValue: number;
	pendingOrders: number;
	completedOrders: number;
	recentOrders: Order[];
}

// Types for creating/updating orders
export interface CreateOrderInput {
	items: {
		productId: number;
		quantity: number;
		options?: any;
	}[];
	customerEmail: string;
	customerName: string;
	customerPhone?: string;
	shippingAddress: OrderAddress;
	billingAddress?: OrderAddress;
	customerNote?: string;
	paymentMethod?: string;
	userId?: number;
}

export interface UpdateOrderInput {
	status?: OrderStatus;
	customerNote?: string;
	adminNote?: string;
	paymentMethod?: string;
	paymentId?: string;
	shippingAddress?: OrderAddress;
	billingAddress?: OrderAddress;
}
