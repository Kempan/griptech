// server/src/controllers/admin/orderController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

enum OrderStatus {
	PENDING = "PENDING",
	PROCESSING = "PROCESSING",
	ON_HOLD = "ON_HOLD",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
	REFUNDED = "REFUNDED",
	FAILED = "FAILED",
}

/**
 * Get all orders with pagination, filtering and sorting
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
	try {
		const search = req.query.search as string | undefined;
		const status = req.query.status as OrderStatus | undefined;
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 10;
		const sortBy = (req.query.sortBy as string) || "createdAt";
		const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

		// Build filter conditions
		const whereClause: any = {};

		// Add status filter if provided
		if (status) {
			whereClause.status = status;
		}

		// Add search filter if provided
		if (search) {
			whereClause.OR = [
				{ orderNumber: { contains: search, mode: "insensitive" } },
				{ customerName: { contains: search, mode: "insensitive" } },
				{ customerEmail: { contains: search, mode: "insensitive" } },
			];
		}

		// Count total matching orders
		const totalCount = await prisma.order.count({
			where: whereClause,
		});

		// Retrieve orders with pagination
		const orders = await prisma.order.findMany({
			where: whereClause,
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				orderItems: {
					include: {
						product: true,
					},
				},
			},
			skip: (page - 1) * pageSize,
			take: pageSize,
		});

		// Format order data for response
		const formattedOrders = orders.map((order) => ({
			...order,
			total: Number(order.total),
			subtotal: Number(order.subtotal),
			tax: Number(order.tax),
			shipping: Number(order.shipping),
			discount: order.discount ? Number(order.discount) : null,
			orderItems: order.orderItems.map((item) => ({
				...item,
				price: Number(item.price),
			})),
		}));

		res.json({
			orders: formattedOrders,
			totalCount,
			pageCount: Math.ceil(totalCount / pageSize),
			currentPage: page,
		});
	} catch (error) {
		console.error("Error retrieving orders:", error);
		res.status(500).json({ message: "Error retrieving orders" });
	}
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const orderId = parseInt(id);

		if (isNaN(orderId)) {
			res.status(400).json({ message: "Invalid order ID" });
			return;
		}

		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				orderItems: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								slug: true,
								price: true,
							},
						},
					},
				},
			},
		});

		if (!order) {
			res.status(404).json({ message: "Order not found" });
			return;
		}

		// Format decimals to numbers in the response
		const formattedOrder = {
			...order,
			total: Number(order.total),
			subtotal: Number(order.subtotal),
			tax: Number(order.tax),
			shipping: Number(order.shipping),
			discount: order.discount ? Number(order.discount) : null,
			orderItems: order.orderItems.map((item) => ({
				...item,
				price: Number(item.price),
				product: {
					...item.product,
					price: Number(item.product.price),
				},
			})),
		};

		res.json(formattedOrder);
	} catch (error) {
		console.error(`Error retrieving order with ID ${req.params.id}:`, error);
		res.status(500).json({ message: "Error retrieving order" });
	}
};

/**
 * Update an order
 */
export const updateOrder = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const orderId = parseInt(id);

		if (isNaN(orderId)) {
			res.status(400).json({ message: "Invalid order ID" });
			return;
		}

		const {
			status,
			adminNote,
			customerNote,
			paymentMethod,
			paymentId,
			shippingAddress,
			billingAddress,
		} = req.body;

		// Check if order exists
		const order = await prisma.order.findUnique({
			where: { id: orderId },
		});

		if (!order) {
			res.status(404).json({ message: "Order not found" });
			return;
		}

		// Prepare update data
		const updateData: any = {};

		if (status !== undefined) {
			updateData.status = status;

			// Update timestamps based on status
			if (status === "COMPLETED" && !order.shippedAt) {
				updateData.shippedAt = new Date();
			}

			if (["COMPLETED", "PROCESSING"].includes(status) && !order.paidAt) {
				updateData.paidAt = new Date();
			}
		}

		if (adminNote !== undefined) updateData.adminNote = adminNote;
		if (customerNote !== undefined) updateData.customerNote = customerNote;
		if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
		if (paymentId !== undefined) updateData.paymentId = paymentId;
		if (shippingAddress !== undefined)
			updateData.shippingAddress = shippingAddress;
		if (billingAddress !== undefined)
			updateData.billingAddress = billingAddress;

		// Update the order
		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: updateData,
			include: {
				orderItems: true,
			},
		});

		// Format decimals to numbers in the response
		const formattedOrder = {
			...updatedOrder,
			total: Number(updatedOrder.total),
			subtotal: Number(updatedOrder.subtotal),
			tax: Number(updatedOrder.tax),
			shipping: Number(updatedOrder.shipping),
			discount: updatedOrder.discount ? Number(updatedOrder.discount) : null,
			orderItems: updatedOrder.orderItems.map((item) => ({
				...item,
				price: Number(item.price),
			})),
		};

		res.json(formattedOrder);
	} catch (error) {
		console.error(`Error updating order with ID ${req.params.id}:`, error);
		res.status(500).json({ message: "Error updating order" });
	}
};

/**
 * Delete an order
 */
export const deleteOrder = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const orderId = parseInt(id);

		if (isNaN(orderId)) {
			res.status(400).json({ message: "Invalid order ID" });
			return;
		}

		// Check if order exists
		const order = await prisma.order.findUnique({
			where: { id: orderId },
		});

		if (!order) {
			res.status(404).json({ message: "Order not found" });
			return;
		}

		// Delete order and all related items using a transaction
		await prisma.$transaction([
			prisma.orderItem.deleteMany({
				where: { orderId },
			}),
			prisma.order.delete({
				where: { id: orderId },
			}),
		]);

		res.json({ message: "Order deleted successfully" });
	} catch (error) {
		console.error(`Error deleting order with ID ${req.params.id}:`, error);
		res.status(500).json({ message: "Error deleting order" });
	}
};

/**
 * Get order statistics for admin dashboard
 */
export const getOrderStatistics = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Get total number of orders
		const totalOrders = await prisma.order.count();

		// Get total revenue
		const totalRevenueResult = await prisma.order.aggregate({
			_sum: {
				total: true,
			},
			where: {
				status: {
					in: ["COMPLETED", "PROCESSING"],
				},
			},
		});
		const totalRevenue = totalRevenueResult._sum.total
			? Number(totalRevenueResult._sum.total)
			: 0;

		// Calculate average order value
		const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

		// Count pending orders
		const pendingOrders = await prisma.order.count({
			where: {
				status: "PENDING",
			},
		});

		// Count completed orders
		const completedOrders = await prisma.order.count({
			where: {
				status: "COMPLETED",
			},
		});

		// Get recent orders
		const recentOrders = await prisma.order.findMany({
			take: 5,
			orderBy: {
				createdAt: "desc",
			},
			include: {
				orderItems: true,
			},
		});

		// Format the recent orders
		const formattedRecentOrders = recentOrders.map((order) => ({
			...order,
			total: Number(order.total),
			subtotal: Number(order.subtotal),
			tax: Number(order.tax),
			shipping: Number(order.shipping),
			discount: order.discount ? Number(order.discount) : null,
			orderItems: order.orderItems.map((item) => ({
				...item,
				price: Number(item.price),
			})),
		}));

		res.json({
			totalOrders,
			totalRevenue,
			averageOrderValue,
			pendingOrders,
			completedOrders,
			recentOrders: formattedRecentOrders,
		});
	} catch (error) {
		console.error("Error retrieving order statistics:", error);
		res.status(500).json({ message: "Error retrieving order statistics" });
	}
};

/**
 * Create a new order (typically for checkout)
 */
export const createOrder = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const {
			items,
			customerEmail,
			customerName,
			customerPhone,
			shippingAddress,
			billingAddress,
			customerNote,
			paymentMethod,
			userId,
		} = req.body;

		console.log("Creating order with userId:", userId);

		// Basic validation
		if (
			!items ||
			!items.length ||
			!customerEmail ||
			!customerName ||
			!shippingAddress
		) {
			res.status(400).json({ message: "Missing required order information" });
			return;
		}

		// Generate a unique order number
		const orderNumber = `WB-${Date.now().toString().slice(-8)}`;

		// Start a transaction to ensure all operations succeed or fail together
		const result = await prisma.$transaction(async (tx) => {
			// Validate products and calculate totals
			let subtotal = 0;
			const orderItems = [];

			for (const item of items) {
				const product = await tx.product.findUnique({
					where: { id: item.productId },
				});

				if (!product) {
					throw new Error(`Product with ID ${item.productId} not found`);
				}

				if (product.stockQuantity != null && product.stockQuantity < item.quantity) {
					throw new Error(`Not enough stock for product "${product.name}"`);
				}

				// Calculate item price
				const itemPrice = Number(product.price);
				subtotal += itemPrice * item.quantity;

				// Add to order items
				orderItems.push({
					productId: product.id,
					quantity: item.quantity,
					price: product.price || 0,
					name: product.name,
					options: item.options || {},
				});

				// Update product stock
				await tx.product.update({
					where: { id: product.id },
					data: {
						stockQuantity: {
							decrement: item.quantity,
						},
					},
				});
			}

			// Calculate tax and shipping
			const tax = Number((subtotal * 0.25).toFixed(2)); // 25% VAT
			const shipping = 99; // Fixed shipping cost in SEK
			const total = subtotal + tax + shipping;

			// Validate userId if provided
			let validatedUserId = null;
			if (userId) {
				// Check if user exists
				const user = await tx.user.findUnique({
					where: { id: userId },
					select: { id: true },
				});

				if (user) {
					validatedUserId = user.id;
					console.log(
						`Verified user ID ${validatedUserId} exists, connecting to order`
					);
				} else {
					console.warn(
						`User ID ${userId} not found, order will be created without user connection`
					);
				}
			}

			// Create the order
			const order = await tx.order.create({
				data: {
					orderNumber,
					userId: validatedUserId,
					customerEmail,
					customerName,
					customerPhone: customerPhone || null,
					shippingAddress,
					billingAddress: billingAddress || null,
					subtotal,
					tax,
					shipping,
					total,
					currency: "SEK",
					paymentMethod: paymentMethod || "pending",
					customerNote: customerNote || null,
					status: "PENDING",
					orderItems: {
						create: orderItems,
					},
				},
				include: {
					orderItems: true,
					user: validatedUserId
						? {
								select: {
									id: true,
									name: true,
									email: true,
								},
						  }
						: undefined,
				},
			});

			return order;
		});

		// Format the response
		const formattedOrder = {
			...result,
			total: Number(result.total),
			subtotal: Number(result.subtotal),
			tax: Number(result.tax),
			shipping: Number(result.shipping),
			orderItems: result.orderItems.map((item) => ({
				...item,
				price: Number(item.price),
			})),
		};

		res.status(201).json({
			success: true,
			order: formattedOrder,
		});
	} catch (error) {
		console.error("Error creating order:", error);

		// Send more specific error message if available
		const errorMessage =
			error instanceof Error
				? error.message
				: "An error occurred while creating the order";
		res.status(400).json({ error: errorMessage });
	}
};
