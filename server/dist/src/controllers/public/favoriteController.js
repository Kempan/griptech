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
exports.getProductFavoriteCount = exports.toggleFavorite = exports.checkFavorites = exports.removeFromFavorites = exports.addToFavorites = exports.getUserFavorites = void 0;
const client_1 = require("@prisma/client");
const session_1 = require("../../lib/session");
const prisma = new client_1.PrismaClient();
/**
 * Get all favorites for the current user
 */
const getUserFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get current user from session
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const session = yield (0, session_1.decrypt)(sessionCookie);
        if (!(session === null || session === void 0 ? void 0 : session.userId)) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = parseInt(session.userId.toString());
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 12;
        // Get total count
        const totalCount = yield prisma.favorite.count({
            where: { userId },
        });
        // Get favorites with product details
        const favorites = yield prisma.favorite.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        productCategories: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        // Format the response
        const formattedFavorites = favorites.map((favorite) => ({
            id: favorite.id,
            productId: favorite.productId,
            createdAt: favorite.createdAt,
            product: Object.assign(Object.assign({}, favorite.product), { price: Number(favorite.product.price), categories: favorite.product.productCategories.map((rel) => ({
                    id: rel.category.id,
                    name: rel.category.name,
                    slug: rel.category.slug,
                })) }),
        }));
        res.json({
            favorites: formattedFavorites,
            totalCount,
            pageCount: Math.ceil(totalCount / pageSize),
            currentPage: page,
        });
    }
    catch (error) {
        console.error("Error retrieving favorites:", error);
        res.status(500).json({ message: "Error retrieving favorites" });
    }
});
exports.getUserFavorites = getUserFavorites;
/**
 * Add a product to favorites
 */
const addToFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get current user from session
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const session = yield (0, session_1.decrypt)(sessionCookie);
        if (!(session === null || session === void 0 ? void 0 : session.userId)) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = parseInt(session.userId.toString());
        const { productId } = req.body;
        // Validate productId
        if (!productId) {
            res.status(400).json({ message: "Product ID is required" });
            return;
        }
        // Check if product exists
        const product = yield prisma.product.findUnique({
            where: { id: parseInt(productId) },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Check if already favorited
        const existingFavorite = yield prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: parseInt(productId),
                },
            },
        });
        if (existingFavorite) {
            res.status(400).json({ message: "Product already in favorites" });
            return;
        }
        // Create favorite
        const favorite = yield prisma.favorite.create({
            data: {
                userId,
                productId: parseInt(productId),
            },
            include: {
                product: true,
            },
        });
        res.status(201).json({
            message: "Product added to favorites",
            favorite: {
                id: favorite.id,
                productId: favorite.productId,
                createdAt: favorite.createdAt,
                product: Object.assign(Object.assign({}, favorite.product), { price: Number(favorite.product.price) }),
            },
        });
    }
    catch (error) {
        console.error("Error adding to favorites:", error);
        res.status(500).json({ message: "Error adding to favorites" });
    }
});
exports.addToFavorites = addToFavorites;
/**
 * Remove a product from favorites
 */
const removeFromFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get current user from session
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const session = yield (0, session_1.decrypt)(sessionCookie);
        if (!(session === null || session === void 0 ? void 0 : session.userId)) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = parseInt(session.userId.toString());
        const { productId } = req.params;
        if (!productId) {
            res.status(400).json({ message: "Product ID is required" });
            return;
        }
        // Check if favorite exists
        const favorite = yield prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: parseInt(productId),
                },
            },
        });
        if (!favorite) {
            res.status(404).json({ message: "Favorite not found" });
            return;
        }
        // Delete favorite
        yield prisma.favorite.delete({
            where: {
                userId_productId: {
                    userId,
                    productId: parseInt(productId),
                },
            },
        });
        res.json({ message: "Product removed from favorites" });
    }
    catch (error) {
        console.error("Error removing from favorites:", error);
        res.status(500).json({ message: "Error removing from favorites" });
    }
});
exports.removeFromFavorites = removeFromFavorites;
/**
 * Check if products are favorited by the current user
 */
const checkFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get current user from session
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const session = yield (0, session_1.decrypt)(sessionCookie);
        if (!(session === null || session === void 0 ? void 0 : session.userId)) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = parseInt(session.userId.toString());
        const { productIds } = req.body;
        // Validate productIds
        if (!Array.isArray(productIds) || productIds.length === 0) {
            res.status(400).json({ message: "Product IDs array is required" });
            return;
        }
        // Convert to numbers and validate
        const validProductIds = productIds
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id));
        if (validProductIds.length === 0) {
            res.status(400).json({ message: "Invalid product IDs" });
            return;
        }
        // Get favorites for these products
        const favorites = yield prisma.favorite.findMany({
            where: {
                userId,
                productId: {
                    in: validProductIds,
                },
            },
            select: {
                productId: true,
            },
        });
        // Create a map of favorited product IDs
        const favoritedIds = favorites.map((f) => f.productId);
        // Create response object
        const favoriteStatus = validProductIds.reduce((acc, productId) => {
            acc[productId] = favoritedIds.includes(productId);
            return acc;
        }, {});
        res.json(favoriteStatus);
    }
    catch (error) {
        console.error("Error checking favorites:", error);
        res.status(500).json({ message: "Error checking favorites" });
    }
});
exports.checkFavorites = checkFavorites;
/**
 * Toggle favorite status for a product
 */
const toggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get current user from session
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const session = yield (0, session_1.decrypt)(sessionCookie);
        if (!(session === null || session === void 0 ? void 0 : session.userId)) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = parseInt(session.userId.toString());
        const { productId } = req.body;
        // Validate productId
        if (!productId) {
            res.status(400).json({ message: "Product ID is required" });
            return;
        }
        const productIdNum = parseInt(productId);
        // Check if product exists
        const product = yield prisma.product.findUnique({
            where: { id: productIdNum },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Check if already favorited
        const existingFavorite = yield prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: productIdNum,
                },
            },
        });
        if (existingFavorite) {
            // Remove from favorites
            yield prisma.favorite.delete({
                where: {
                    userId_productId: {
                        userId,
                        productId: productIdNum,
                    },
                },
            });
            res.json({
                message: "Product removed from favorites",
                isFavorited: false,
                productId: productIdNum,
            });
        }
        else {
            // Add to favorites
            yield prisma.favorite.create({
                data: {
                    userId,
                    productId: productIdNum,
                },
            });
            res.json({
                message: "Product added to favorites",
                isFavorited: true,
                productId: productIdNum,
            });
        }
    }
    catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(500).json({ message: "Error toggling favorite" });
    }
});
exports.toggleFavorite = toggleFavorite;
/**
 * Get favorite count for a specific product
 */
const getProductFavoriteCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        if (!productId) {
            res.status(400).json({ message: "Product ID is required" });
            return;
        }
        const count = yield prisma.favorite.count({
            where: {
                productId: parseInt(productId),
            },
        });
        res.json({ productId: parseInt(productId), favoriteCount: count });
    }
    catch (error) {
        console.error("Error getting favorite count:", error);
        res.status(500).json({ message: "Error getting favorite count" });
    }
});
exports.getProductFavoriteCount = getProductFavoriteCount;
