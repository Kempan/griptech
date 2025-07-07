"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.getOrderStatistics = exports.deleteOrder = exports.updateOrder = exports.getOrderById = exports.getOrders = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["ON_HOLD"] = "ON_HOLD";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
    OrderStatus["FAILED"] = "FAILED";
})(OrderStatus || (OrderStatus = {}));
/**
 * Get all orders with pagination, filtering and sorting
 */
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search;
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder || "desc";
        // Build filter conditions
        const whereClause = {};
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
        const totalCount = yield prisma.order.count({
            where: whereClause,
        });
        // Retrieve orders with pagination
        const orders = yield prisma.order.findMany({
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
        const formattedOrders = orders.map((order) => (Object.assign(Object.assign({}, order), { total: Number(order.total), subtotal: Number(order.subtotal), tax: Number(order.tax), shipping: Number(order.shipping), discount: order.discount ? Number(order.discount) : null, orderItems: order.orderItems.map((item) => (Object.assign(Object.assign({}, item), { price: Number(item.price) }))) })));
        res.json({
            orders: formattedOrders,
            totalCount,
            pageCount: Math.ceil(totalCount / pageSize),
            currentPage: page,
        });
    }
    catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({ message: "Error retrieving orders" });
    }
});
exports.getOrders = getOrders;
/**
 * Get a single order by ID
 */
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const orderId = parseInt(id);
        if (isNaN(orderId)) {
            res.status(400).json({ message: "Invalid order ID" });
            return;
        }
        const order = yield prisma.order.findUnique({
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
        const formattedOrder = Object.assign(Object.assign({}, order), { total: Number(order.total), subtotal: Number(order.subtotal), tax: Number(order.tax), shipping: Number(order.shipping), discount: order.discount ? Number(order.discount) : null, orderItems: order.orderItems.map((item) => (Object.assign(Object.assign({}, item), { price: Number(item.price), product: Object.assign(Object.assign({}, item.product), { price: Number(item.product.price) }) }))) });
        res.json(formattedOrder);
    }
    catch (error) {
        console.error(`Error retrieving order with ID ${req.params.id}:`, error);
        res.status(500).json({ message: "Error retrieving order" });
    }
});
exports.getOrderById = getOrderById;
/**
 * Update an order
 */
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const orderId = parseInt(id);
        if (isNaN(orderId)) {
            res.status(400).json({ message: "Invalid order ID" });
            return;
        }
        const { status, adminNote, customerNote, paymentMethod, paymentId, shippingAddress, billingAddress, } = req.body;
        // Check if order exists
        const order = yield prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        // Prepare update data
        const updateData = {};
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
        if (adminNote !== undefined)
            updateData.adminNote = adminNote;
        if (customerNote !== undefined)
            updateData.customerNote = customerNote;
        if (paymentMethod !== undefined)
            updateData.paymentMethod = paymentMethod;
        if (paymentId !== undefined)
            updateData.paymentId = paymentId;
        if (shippingAddress !== undefined)
            updateData.shippingAddress = shippingAddress;
        if (billingAddress !== undefined)
            updateData.billingAddress = billingAddress;
        // Update the order
        const updatedOrder = yield prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                orderItems: true,
            },
        });
        // Format decimals to numbers in the response
        const formattedOrder = Object.assign(Object.assign({}, updatedOrder), { total: Number(updatedOrder.total), subtotal: Number(updatedOrder.subtotal), tax: Number(updatedOrder.tax), shipping: Number(updatedOrder.shipping), discount: updatedOrder.discount ? Number(updatedOrder.discount) : null, orderItems: updatedOrder.orderItems.map((item) => (Object.assign(Object.assign({}, item), { price: Number(item.price) }))) });
        res.json(formattedOrder);
    }
    catch (error) {
        console.error(`Error updating order with ID ${req.params.id}:`, error);
        res.status(500).json({ message: "Error updating order" });
    }
});
exports.updateOrder = updateOrder;
/**
 * Delete an order
 */
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const orderId = parseInt(id);
        if (isNaN(orderId)) {
            res.status(400).json({ message: "Invalid order ID" });
            return;
        }
        // Check if order exists
        const order = yield prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        // Delete order and all related items using a transaction
        yield prisma.$transaction([
            prisma.orderItem.deleteMany({
                where: { orderId },
            }),
            prisma.order.delete({
                where: { id: orderId },
            }),
        ]);
        res.json({ message: "Order deleted successfully" });
    }
    catch (error) {
        console.error(`Error deleting order with ID ${req.params.id}:`, error);
        res.status(500).json({ message: "Error deleting order" });
    }
});
exports.deleteOrder = deleteOrder;
/**
 * Get order statistics for admin dashboard
 */
const getOrderStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get total number of orders
        const totalOrders = yield prisma.order.count();
        // Get total revenue
        const totalRevenueResult = yield prisma.order.aggregate({
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
        const pendingOrders = yield prisma.order.count({
            where: {
                status: "PENDING",
            },
        });
        // Count completed orders
        const completedOrders = yield prisma.order.count({
            where: {
                status: "COMPLETED",
            },
        });
        // Get recent orders
        const recentOrders = yield prisma.order.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                orderItems: true,
            },
        });
        // Format the recent orders
        const formattedRecentOrders = recentOrders.map((order) => (Object.assign(Object.assign({}, order), { total: Number(order.total), subtotal: Number(order.subtotal), tax: Number(order.tax), shipping: Number(order.shipping), discount: order.discount ? Number(order.discount) : null, orderItems: order.orderItems.map((item) => (Object.assign(Object.assign({}, item), { price: Number(item.price) }))) })));
        res.json({
            totalOrders,
            totalRevenue,
            averageOrderValue,
            pendingOrders,
            completedOrders,
            recentOrders: formattedRecentOrders,
        });
    }
    catch (error) {
        console.error("Error retrieving order statistics:", error);
        res.status(500).json({ message: "Error retrieving order statistics" });
    }
});
exports.getOrderStatistics = getOrderStatistics;
/**
 * Create a new order (typically for checkout)
 */
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items, customerEmail, customerName, customerPhone, shippingAddress, billingAddress, customerNote, paymentMethod, userId, } = req.body;
        console.log("Creating order with userId:", userId);
        // Basic validation
        if (!items ||
            !items.length ||
            !customerEmail ||
            !customerName ||
            !shippingAddress) {
            res.status(400).json({ message: "Missing required order information" });
            return;
        }
        // Generate a unique order number
        const orderNumber = `WB-${Date.now().toString().slice(-8)}`;
        // Start a transaction to ensure all operations succeed or fail together
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Validate products and calculate totals
            let subtotal = 0;
            const orderItems = [];
            for (const item of items) {
                const product = yield tx.product.findUnique({
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
                yield tx.product.update({
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
                const user = yield tx.user.findUnique({
                    where: { id: userId },
                    select: { id: true },
                });
                if (user) {
                    validatedUserId = user.id;
                    console.log(`Verified user ID ${validatedUserId} exists, connecting to order`);
                }
                else {
                    console.warn(`User ID ${userId} not found, order will be created without user connection`);
                }
            }
            // Create the order
            const order = yield tx.order.create({
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
        }));
        // Format the response
        const formattedOrder = Object.assign(Object.assign({}, result), { total: Number(result.total), subtotal: Number(result.subtotal), tax: Number(result.tax), shipping: Number(result.shipping), orderItems: result.orderItems.map((item) => (Object.assign(Object.assign({}, item), { price: Number(item.price) }))) });
        res.status(201).json({
            success: true,
            order: formattedOrder,
        });
    }
    catch (error) {
        console.error("Error creating order:", error);
        // Send more specific error message if available
        const errorMessage = error instanceof Error
            ? error.message
            : "An error occurred while creating the order";
        res.status(400).json({ error: errorMessage });
    }
});
exports.createOrder = createOrder;
