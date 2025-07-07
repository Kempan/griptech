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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importUsers = exports.updateUserAddresses = exports.connectUserToOrder = exports.getUserProfile = exports.searchUsers = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = exports.getUserOrders = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
/**
 * Get orders for a specific user
 */
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        if (isNaN(userId)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        // Check if user exists
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        // Get total count of orders for this user
        const totalCount = yield prisma.order.count({
            where: { userId },
        });
        // Get orders with pagination
        const orders = yield prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
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
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        // Format orders for response
        const formattedOrders = orders.map((order) => (Object.assign(Object.assign({}, order), { total: Number(order.total), subtotal: Number(order.subtotal), tax: Number(order.tax), shipping: Number(order.shipping), discount: order.discount ? Number(order.discount) : null, orderItems: order.orderItems.map((item) => (Object.assign(Object.assign({}, item), { price: Number(item.price), product: item.product
                    ? Object.assign(Object.assign({}, item.product), { price: Number(item.product.price) }) : null }))) })));
        res.json({
            orders: formattedOrders,
            totalCount,
            pageCount: Math.ceil(totalCount / pageSize),
            currentPage: page,
        });
    }
    catch (error) {
        console.error(`Error fetching orders for user ${req.params.id}:`, error);
        res.status(500).json({ message: "Error retrieving user orders" });
    }
});
exports.getUserOrders = getUserOrders;
/**
 * Get all users (admin view)
 */
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                roles: true,
                phone: true,
                shippingAddress: true,
                billingAddress: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                // Excluding password for security
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error("Error retrieving users:", error);
        res.status(500).json({ message: "Error retrieving users" });
    }
});
exports.getUsers = getUsers;
/**
 * Get a single user by ID
 */
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: {
                id: Number(id),
            },
            select: {
                id: true,
                name: true,
                email: true,
                roles: true,
                phone: true,
                shippingAddress: true,
                billingAddress: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                // Excluding password for security
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error);
        res.status(500).json({ message: "Error retrieving user" });
    }
});
exports.getUserById = getUserById;
/**
 * Create a new user
 */
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, roles, phone, shippingAddress, billingAddress, } = req.body;
    // Basic validation
    if (!name || !email || !password) {
        res.status(400).json({ message: "Name, email, and password are required" });
        return;
    }
    try {
        // Check if email already exists
        const existingUser = yield prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        // Validate roles or use default
        const userRoles = Array.isArray(roles) && roles.length > 0 ? roles : ["customer"]; // Default role is customer
        // Ensure only valid roles are assigned
        const validRoles = userRoles.filter((role) => ["admin", "customer"].includes(role));
        // If no valid roles, assign default role
        const finalRoles = validRoles.length > 0 ? validRoles : ["customer"];
        const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        const newUser = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                roles: finalRoles,
                phone: phone || null,
                shippingAddress: shippingAddress || null,
                billingAddress: billingAddress || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                roles: true,
                phone: true,
                shippingAddress: true,
                billingAddress: true,
                createdAt: true,
                updatedAt: true,
                // Excluding password in response
            },
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user" });
    }
});
exports.createUser = createUser;
/**
 * Update an existing user
 */
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, roles, password, phone, shippingAddress, billingAddress, } = req.body;
    try {
        // Check if user exists
        const user = yield prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // If email is being updated, check if it's already in use
        if (email && email !== user.email) {
            const existingUser = yield prisma.user.findUnique({
                where: {
                    email,
                },
            });
            if (existingUser) {
                res.status(400).json({ message: "Email already in use" });
                return;
            }
        }
        // Process roles if provided
        let updatedRoles;
        if (Array.isArray(roles)) {
            // Filter to ensure only valid roles are included
            const validRoles = roles.filter((role) => ["admin", "customer"].includes(role));
            // Only update if there's at least one valid role
            if (validRoles.length > 0) {
                updatedRoles = validRoles;
            }
        }
        // Prepare the data object for the update
        const updateData = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (email && { email })), (updatedRoles && { roles: updatedRoles })), (phone !== undefined && { phone })), (shippingAddress !== undefined && { shippingAddress })), (billingAddress !== undefined && { billingAddress }));
        // If password is provided, hash it before updating
        if (password) {
            const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
            updateData.password = hashedPassword;
        }
        const updatedUser = yield prisma.user.update({
            where: {
                id: Number(id),
            },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                roles: true,
                phone: true,
                shippingAddress: true,
                billingAddress: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                // Excluding password in response
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error(`Error updating user with ID ${id}:`, error);
        res.status(500).json({ message: "Error updating user" });
    }
});
exports.updateUser = updateUser;
/**
 * Delete a user
 */
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Check if user exists
        const user = yield prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        yield prisma.user.delete({
            where: {
                id: Number(id),
            },
        });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error(`Error deleting user with ID ${id}:`, error);
        res.status(500).json({ message: "Error deleting user" });
    }
});
exports.deleteUser = deleteUser;
/**
 * Search users by name or email
 */
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.query;
        if (!query || query.length < 2) {
            res.status(400).json({ message: "Query must be at least 2 characters" });
            return;
        }
        const users = yield prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
            },
            take: 10, // Limit to 10 results
        });
        res.json(users);
    }
    catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Error searching users" });
    }
});
exports.searchUsers = searchUsers;
/**
 * Get user profile for current user
 */
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get the user ID from the session (you'll need to implement auth middleware)
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: {
                id: Number(userId),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                shippingAddress: true,
                billingAddress: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error fetching user profile" });
    }
});
exports.getUserProfile = getUserProfile;
/**
 * Connect or disconnect a user from an order
 */
const connectUserToOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId } = req.body;
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
        // If userId is provided, validate it exists
        if (userId !== null) {
            const userIdNum = parseInt(userId);
            if (isNaN(userIdNum)) {
                res.status(400).json({ message: "Invalid user ID" });
                return;
            }
            const user = yield prisma.user.findUnique({
                where: { id: userIdNum },
            });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
        }
        // Update the order with userId (or null to disconnect)
        const updatedOrder = yield prisma.order.update({
            where: { id: orderId },
            data: { userId: userId ? parseInt(userId) : null },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.json({
            message: userId
                ? "User connected to order"
                : "User disconnected from order",
            order: updatedOrder,
        });
    }
    catch (error) {
        console.error(`Error connecting user to order ${req.params.id}:`, error);
        res.status(500).json({ message: "Error connecting user to order" });
    }
});
exports.connectUserToOrder = connectUserToOrder;
/**
 * Update user's default addresses
 */
const updateUserAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get user ID from session/request (adjust based on your auth system)
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { shippingAddress, billingAddress, useSameAddress } = req.body;
        // Validate required fields
        if (!shippingAddress ||
            !shippingAddress.firstName ||
            !shippingAddress.lastName ||
            !shippingAddress.address1 ||
            !shippingAddress.city ||
            !shippingAddress.postalCode ||
            !shippingAddress.country) {
            res.status(400).json({ message: "Shipping address is incomplete" });
            return;
        }
        // If billing address is separate, validate it too
        if (!useSameAddress && billingAddress) {
            if (!billingAddress.firstName ||
                !billingAddress.lastName ||
                !billingAddress.address1 ||
                !billingAddress.city ||
                !billingAddress.postalCode ||
                !billingAddress.country) {
                res.status(400).json({ message: "Billing address is incomplete" });
                return;
            }
        }
        // Update user addresses
        const updatedUser = yield prisma.user.update({
            where: { id: Number(userId) },
            data: {
                shippingAddress,
                billingAddress: useSameAddress ? null : billingAddress,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                shippingAddress: true,
                billingAddress: true,
            },
        });
        res.json({
            message: "Addresses updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating user addresses:", error);
        res.status(500).json({ message: "Error updating user addresses" });
    }
});
exports.updateUserAddresses = updateUserAddresses;
/**
 * Import users from external source (like Wibo API)
 * This endpoint handles bulk user creation/update
 */
const importUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { users } = req.body;
        if (!Array.isArray(users) || users.length === 0) {
            res.status(400).json({
                success: false,
                message: "No valid users provided for import",
            });
            return;
        }
        console.log(`Processing import of ${users.length} users`);
        // Track statistics
        let imported = 0;
        let updated = 0;
        let errors = 0;
        // Process users one by one to handle errors gracefully
        for (const userData of users) {
            try {
                // Skip users without required fields
                if (!userData.email || !userData.name) {
                    console.warn("Skipping user with missing email or name");
                    errors++;
                    continue;
                }
                // Check if user already exists (by email)
                const existingUser = yield prisma.user.findUnique({
                    where: { email: userData.email },
                });
                if (existingUser) {
                    // Update existing user
                    yield prisma.user.update({
                        where: { id: existingUser.id },
                        data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (userData.name && { name: userData.name })), (userData.phone && { phone: userData.phone })), (userData.roles && { roles: userData.roles })), (userData.shippingAddress && {
                            shippingAddress: userData.shippingAddress,
                        })), (userData.billingAddress && {
                            billingAddress: userData.billingAddress,
                        })), { updatedAt: new Date() }),
                    });
                    updated++;
                }
                else {
                    // Create new user with random password (they'll need to reset it)
                    const tempPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = yield bcrypt_1.default.hash(tempPassword, SALT_ROUNDS);
                    yield prisma.user.create({
                        data: {
                            email: userData.email,
                            name: userData.name,
                            password: hashedPassword,
                            phone: userData.phone || null,
                            roles: userData.roles || ["customer"],
                            shippingAddress: userData.shippingAddress || null,
                            billingAddress: userData.billingAddress || null,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    });
                    imported++;
                }
            }
            catch (error) {
                console.error(`Error processing user ${userData.email}:`, error);
                errors++;
            }
        }
        res.status(200).json({
            success: true,
            imported,
            updated,
            errors,
            message: `Successfully imported ${imported} new users and updated ${updated} existing users. ${errors} errors occurred.`,
        });
    }
    catch (error) {
        console.error("Error during user import:", error);
        res.status(500).json({
            success: false,
            message: "Error processing user import",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.importUsers = importUsers;
