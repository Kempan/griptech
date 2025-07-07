// server/src/controllers/public/orderController.ts
import { Request, Response } from "express";
import { OrderStatus, PrismaClient } from "@prisma/client";
import { decrypt } from "../../lib/session";

const prisma = new PrismaClient();

/**
 * Create a new order (public checkout endpoint)
 */
export const createOrder = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Get current user from session
		const sessionCookie = req.cookies.session;
		let sessionUserId = null;
		
		if (sessionCookie) {
			try {
				const session = await decrypt(sessionCookie);
				if (session?.userId) {
					// Verify the user exists before using their ID
					const user = await prisma.user.findUnique({
						where: { id: parseInt(session.userId.toString()) },
						select: { id: true },
					});
					console.log("user from session", user);
					if (user) {
						sessionUserId = user.id;
					}
				}
			} catch (e) {
				console.error("Session decryption error:", e);
			}
		}

		const {
			items,
			customerEmail,
			customerName,
			customerPhone,
			shippingAddress,
			billingAddress,
			customerNote,
			paymentMethod,
			userId: bodyUserId, // Extract userId from request body
		} = req.body;

		console.log("Body userId:", bodyUserId, "Session userId:", sessionUserId);

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

			// Determine which userId to use - prefer the one from the body if provided
			let finalUserId = null;

			// First check if we have a valid userId in the request body
			if (bodyUserId) {
				// Validate the body userId
				const bodyUser = await tx.user.findUnique({
					where: { id: Number(bodyUserId) },
					select: { id: true },
				});

				if (bodyUser) {
					finalUserId = bodyUser.id;
					console.log(`Using userId from request body: ${finalUserId}`);
				} else {
					console.warn(`User ID ${bodyUserId} from request body not found`);
				}
			}

			// If no valid userId from body, use session userId as fallback
			if (!finalUserId && sessionUserId) {
				finalUserId = sessionUserId;
				console.log(`Using userId from session: ${finalUserId}`);
			}

			if (finalUserId) {
				console.log(`Order will be connected to user ID: ${finalUserId}`);
			} else {
				console.log("Order will be created without user connection");
			}

			// Create the order
			const order = await tx.order.create({
				data: {
					orderNumber,
					userId: finalUserId,
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
					user: finalUserId
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

/**
 * Get orders for the current user with proper search and filtering
 */
export const getUserOrders = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Get current user from session
		const sessionCookie = req.cookies.session;
		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const session = await decrypt(sessionCookie);
		if (!session?.userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const userId = parseInt(session.userId.toString());

		// Extract query parameters
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 10;
		const search = req.query.search as string | undefined;
		const status = req.query.status as OrderStatus | undefined;
		const sortBy = (req.query.sortBy as string) || "createdAt";
		const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

		console.log("Backend: getUserOrders - received params:", {
			userId,
			page,
			pageSize,
			search,
			status,
			sortBy,
			sortOrder,
		});

		// Build where clause with filters
		const whereClause: any = { userId };

		// Add status filter if provided
		if (status) {
			whereClause.status = status;
		}

		// Add search filter if provided
		if (search && search.trim() !== "") {
			whereClause.OR = [
				// Search by order number (exact match for order numbers)
				{
					orderNumber: {
						contains: search,
						mode: "insensitive",
					},
				},
				// Search by product name
				{
					orderItems: {
						some: {
							name: {
								contains: search,
								mode: "insensitive",
							},
						},
					},
				},
			];
		}

		console.log(
			"Backend: Where clause for orders query:",
			JSON.stringify(whereClause, null, 2)
		);

		// Count total user orders with filters
		const totalCount = await prisma.order.count({
			where: whereClause,
		});

		// Get user orders with pagination and filters
		const orders = await prisma.order.findMany({
			where: whereClause,
			orderBy: { [sortBy]: sortOrder },
			include: {
				orderItems: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				},
			},
			skip: (page - 1) * pageSize,
			take: pageSize,
		});

		console.log(
			`Backend: Found ${orders.length} orders of ${totalCount} total for user ${userId}`
		);

		if (search) {
			console.log(`Backend: Search filter "${search}" applied to orders`);

			// For debugging, let's check what order numbers we have
			console.log(
				"Backend: Order numbers in results:",
				orders.map((o) => o.orderNumber)
			);
		}

		// Format orders for response
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
		console.error("Error retrieving user orders:", error);
		res.status(500).json({ message: "Error retrieving orders" });
	}
};

/**
 * Get a specific order by order number
 * Allows both authenticated users and guest orders
 */
export const getUserOrderByNumber = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { orderNumber } = req.params;

		// Try to get current user from session
		const sessionCookie = req.cookies.session;
		let userId: number | null = null;

		if (sessionCookie) {
			try {
				const session = await decrypt(sessionCookie);
				if (session?.userId) {
					userId = parseInt(session.userId.toString());
				}
			} catch (e) {
				// Invalid session, but we'll still allow finding the order
				console.warn("Invalid session when retrieving order");
			}
		}

		// Build the query - either filter by user ID if authenticated,
		// or just find by order number for recent guest orders
		const whereClause: any = { orderNumber };

		// If authenticated, we only show orders belonging to this user
		if (userId) {
			whereClause.userId = userId;
		} else {
			// For guest orders, only allow viewing orders created in the last 24 hours
			// This is a security measure to prevent guessing order numbers
			whereClause.createdAt = {
				gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
			};
		}

		// Find the order
		const order = await prisma.order.findFirst({
			where: whereClause,
			include: {
				orderItems: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								slug: true,
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

		// Format order for response
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
			})),
		};

		res.json(formattedOrder);
	} catch (error) {
		console.error(`Error retrieving order ${req.params.orderNumber}:`, error);
		res.status(500).json({ message: "Error retrieving order" });
	}
};

/**
 * Get a specific order by ID
 * Allows authenticated users to fetch their orders
 */
export const getUserOrderById = async (
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

		// Get user from session
		const sessionCookie = req.cookies.session;
		let userId: number | null = null;

		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		try {
			const session = await decrypt(sessionCookie);
			if (session?.userId) {
				userId = parseInt(session.userId.toString());
			}
		} catch (e) {
			res.status(401).json({ message: "Invalid session" });
			return;
		}

		if (!userId) {
			res.status(401).json({ message: "User not found in session" });
			return;
		}

		// Find the order - ensuring it belongs to the current user
		const order = await prisma.order.findFirst({
			where: {
				id: orderId,
				userId: userId,
			},
			include: {
				orderItems: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								slug: true,
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

		// Format order for response
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
			})),
		};

		res.json(formattedOrder);
	} catch (error) {
		console.error(`Error retrieving order with ID ${req.params.id}:`, error);
		res.status(500).json({ message: "Error retrieving order" });
	}
};
