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
exports.updateUserAddresses = exports.updateUserProfile = exports.getUserProfile = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
/**
 * Get all users (public view with limited fields)
 */
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                // Only return non-sensitive information
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
 * Get profile for the currently authenticated user
 */
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get user ID from the authenticated request
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
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
                roles: true,
                phone: true,
                shippingAddress: true,
                billingAddress: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password
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
 * Update profile for the currently authenticated user
 */
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get user ID from the authenticated request
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const { name, email, phone, shippingAddress, billingAddress, currentPassword, newPassword, } = req.body;
        // Check if user exists
        const user = yield prisma.user.findUnique({
            where: {
                id: Number(userId),
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
        // Prepare the data object for the update
        const updateData = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name !== undefined && { name })), (email !== undefined && { email })), (phone !== undefined && { phone })), (shippingAddress !== undefined && { shippingAddress })), (billingAddress !== undefined && { billingAddress }));
        // If password is being changed, verify current password first
        if (newPassword) {
            if (!currentPassword) {
                res
                    .status(400)
                    .json({
                    message: "Current password is required to set a new password",
                });
                return;
            }
            // Verify current password
            if (!user.password) {
                res.status(400).json({ message: "Cannot update password" });
                return;
            }
            const passwordMatches = yield bcrypt_1.default.compare(currentPassword, user.password);
            if (!passwordMatches) {
                res.status(400).json({ message: "Current password is incorrect" });
                return;
            }
            // Hash the new password
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
            updateData.password = hashedPassword;
        }
        // Update the user
        const updatedUser = yield prisma.user.update({
            where: {
                id: Number(userId),
            },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                shippingAddress: true,
                billingAddress: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password and sensitive data
            },
        });
        res.json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Error updating user profile" });
    }
});
exports.updateUserProfile = updateUserProfile;
/**
 * Update addresses for the currently authenticated user
 */
const updateUserAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get user ID from the authenticated request
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const { shippingAddress, billingAddress, useSameAddress } = req.body;
        // Validate shipping address
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
        // If billing address is not the same as shipping, validate it
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
            where: {
                id: Number(userId),
            },
            data: {
                shippingAddress,
                billingAddress: useSameAddress ? null : billingAddress,
            },
            select: {
                id: true,
                name: true,
                email: true,
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
