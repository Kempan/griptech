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
exports.deleteBundle = exports.removeProductFromBundle = exports.addProductToBundle = exports.updateBundleItems = exports.updateBundle = exports.createBundle = exports.getBundleById = exports.getUserBundles = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Get all bundles for the current user
 */
const getUserBundles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use JWT auth from middleware
        if (!req.user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = req.user.id;
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        // Get total count
        const totalCount = yield prisma.productBundle.count({
            where: { userId, isActive: true },
        });
        // Get bundles
        const bundles = yield prisma.productBundle.findMany({
            where: { userId, isActive: true },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        // Extract all product IDs from all bundles
        const allProductIds = new Set();
        bundles.forEach((bundle) => {
            const items = bundle.items;
            items.forEach((item) => allProductIds.add(item.productId));
        });
        // Fetch all products in one query
        const products = yield prisma.product.findMany({
            where: {
                id: { in: Array.from(allProductIds) },
            },
            include: {
                productCategories: {
                    include: { category: true },
                },
            },
        });
        // Create a map for quick product lookup
        const productMap = new Map(products.map((p) => [p.id, p]));
        // Format bundles with products
        const formattedBundles = bundles.map((bundle) => {
            const items = bundle.items
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                const product = productMap.get(item.productId);
                return product
                    ? Object.assign(Object.assign({}, item), { product: Object.assign(Object.assign({}, product), { price: Number(product.price), categories: product.productCategories.map((rel) => ({
                                id: rel.category.id,
                                name: rel.category.name,
                                slug: rel.category.slug,
                            })) }) }) : null;
            })
                .filter(Boolean); // Remove any null items (deleted products)
            return Object.assign(Object.assign({}, bundle), { items });
        });
        res.json({
            bundles: formattedBundles,
            totalCount,
            pageCount: Math.ceil(totalCount / pageSize),
            currentPage: page,
        });
    }
    catch (error) {
        console.error("Error retrieving bundles:", error);
        res.status(500).json({ message: "Error retrieving bundles" });
    }
});
exports.getUserBundles = getUserBundles;
/**
 * Get a single bundle by ID
 */
const getBundleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = req.user.id;
        const bundleId = parseInt(req.params.id);
        // Get bundle
        const bundle = yield prisma.productBundle.findFirst({
            where: { id: bundleId, userId, isActive: true },
        });
        if (!bundle) {
            res.status(404).json({ message: "Bundle not found" });
            return;
        }
        // Get product IDs from bundle
        const items = bundle.items;
        const productIds = items.map((item) => item.productId);
        // Fetch all products
        const products = yield prisma.product.findMany({
            where: {
                id: { in: productIds },
            },
            include: {
                productCategories: {
                    include: { category: true },
                },
            },
        });
        // Create product map
        const productMap = new Map(products.map((p) => [p.id, p]));
        // Format bundle with products
        const formattedBundle = Object.assign(Object.assign({}, bundle), { items: items
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                const product = productMap.get(item.productId);
                return product
                    ? Object.assign(Object.assign({}, item), { product: Object.assign(Object.assign({}, product), { price: Number(product.price), categories: product.productCategories.map((rel) => ({
                                id: rel.category.id,
                                name: rel.category.name,
                                slug: rel.category.slug,
                            })) }) }) : null;
            })
                .filter(Boolean) });
        res.json(formattedBundle);
    }
    catch (error) {
        console.error("Error retrieving bundle:", error);
        res.status(500).json({ message: "Error retrieving bundle" });
    }
});
exports.getBundleById = getBundleById;
/**
 * Create a new product bundle
 */
const createBundle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = req.user.id;
        const { name, description } = req.body;
        // Validate input
        if (!name || name.trim() === "") {
            res.status(400).json({ message: "Bundle name is required" });
            return;
        }
        // Create bundle with empty items array
        const bundle = yield prisma.productBundle.create({
            data: {
                userId,
                name: name.trim(),
                description: description === null || description === void 0 ? void 0 : description.trim(),
                items: [],
            },
        });
        res.status(201).json({
            message: "Bundle created successfully",
            bundle,
        });
    }
    catch (error) {
        console.error("Error creating bundle:", error);
        res.status(500).json({ message: "Error creating bundle" });
    }
});
exports.createBundle = createBundle;
/**
 * Update a bundle (name, description)
 */
const updateBundle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = req.user.id;
        const bundleId = parseInt(req.params.id);
        const { name, description } = req.body;
        // Check if bundle exists and belongs to user
        const bundle = yield prisma.productBundle.findFirst({
            where: { id: bundleId, userId, isActive: true },
        });
        if (!bundle) {
            res.status(404).json({ message: "Bundle not found" });
            return;
        }
        // Update bundle
        const updatedBundle = yield prisma.productBundle.update({
            where: { id: bundleId },
            data: {
                name: name === null || name === void 0 ? void 0 : name.trim(),
                description: description === null || description === void 0 ? void 0 : description.trim(),
            },
        });
        res.json({
            message: "Bundle updated successfully",
            bundle: updatedBundle,
        });
    }
    catch (error) {
        console.error("Error updating bundle:", error);
        res.status(500).json({ message: "Error updating bundle" });
    }
});
exports.updateBundle = updateBundle;
/**
 * Update bundle items (add, remove, update quantity, reorder)
 */
const updateBundleItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = req.user.id;
        const bundleId = parseInt(req.params.id);
        const { items } = req.body;
        // Validate input
        if (!Array.isArray(items)) {
            res.status(400).json({ message: "Items must be an array" });
            return;
        }
        // Check if bundle exists and belongs to user
        const bundle = yield prisma.productBundle.findFirst({
            where: { id: bundleId, userId, isActive: true },
        });
        if (!bundle) {
            res.status(404).json({ message: "Bundle not found" });
            return;
        }
        // Validate and format items
        const formattedItems = items.map((item, index) => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity) || 1,
            order: item.order !== undefined ? parseInt(item.order) : index,
        }));
        // Update bundle items
        const updatedBundle = yield prisma.productBundle.update({
            where: { id: bundleId },
            data: { items: JSON.parse(JSON.stringify(formattedItems)) },
        });
        res.json({
            message: "Bundle items updated successfully",
            bundle: updatedBundle,
        });
    }
    catch (error) {
        console.error("Error updating bundle items:", error);
        res.status(500).json({ message: "Error updating bundle items" });
    }
});
exports.updateBundleItems = updateBundleItems;
/**
 * Add a single product to bundle
 */
const addProductToBundle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = req.user.id;
        const bundleId = parseInt(req.params.id);
        const { productId, quantity = 1 } = req.body;
        // Validate input
        if (!productId) {
            res.status(400).json({ message: "Product ID is required" });
            return;
        }
        // Check if bundle exists and belongs to user
        const bundle = yield prisma.productBundle.findFirst({
            where: { id: bundleId, userId, isActive: true },
        });
        if (!bundle) {
            res.status(404).json({ message: "Bundle not found" });
            return;
        }
        // Check if product exists
        const product = yield prisma.product.findUnique({
            where: { id: parseInt(productId.toString()) },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Get current items
        const currentItems = bundle.items;
        // Check if product already exists
        const existingItemIndex = currentItems.findIndex((item) => item.productId === parseInt(productId.toString()));
        if (existingItemIndex !== -1) {
            // Update quantity
            currentItems[existingItemIndex].quantity += quantity;
        }
        else {
            // Add new item
            const maxOrder = currentItems.reduce((max, item) => (item.order > max ? item.order : max), -1);
            currentItems.push({
                productId: parseInt(productId.toString()),
                quantity,
                order: maxOrder + 1,
            });
        }
        // Update bundle
        const updatedBundle = yield prisma.productBundle.update({
            where: { id: bundleId },
            data: { items: JSON.parse(JSON.stringify(currentItems)) },
        });
        res.json({
            message: "Product added to bundle successfully",
            bundle: updatedBundle,
        });
    }
    catch (error) {
        console.error("Error adding product to bundle:", error);
        res.status(500).json({ message: "Error adding product to bundle" });
    }
});
exports.addProductToBundle = addProductToBundle;
/**
 * Remove a product from bundle
 */
const removeProductFromBundle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = req.user.id;
        const bundleId = parseInt(req.params.id);
        const productId = parseInt(req.params.productId);
        // Check if bundle exists and belongs to user
        const bundle = yield prisma.productBundle.findFirst({
            where: { id: bundleId, userId, isActive: true },
        });
        if (!bundle) {
            res.status(404).json({ message: "Bundle not found" });
            return;
        }
        // Get current items and filter out the product
        const currentItems = bundle.items;
        const updatedItems = currentItems.filter((item) => item.productId !== productId);
        // Update bundle
        const updatedBundle = yield prisma.productBundle.update({
            where: { id: bundleId },
            data: { items: JSON.parse(JSON.stringify(updatedItems)) },
        });
        res.json({
            message: "Product removed from bundle successfully",
            bundle: updatedBundle,
        });
    }
    catch (error) {
        console.error("Error removing product from bundle:", error);
        res.status(500).json({ message: "Error removing product from bundle" });
    }
});
exports.removeProductFromBundle = removeProductFromBundle;
/**
 * Delete a bundle (soft delete)
 */
const deleteBundle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const userId = req.user.id;
        const bundleId = parseInt(req.params.id);
        // Check if bundle exists and belongs to user
        const bundle = yield prisma.productBundle.findFirst({
            where: { id: bundleId, userId },
        });
        if (!bundle) {
            res.status(404).json({ message: "Bundle not found" });
            return;
        }
        // Soft delete by marking as inactive
        yield prisma.productBundle.update({
            where: { id: bundleId },
            data: { isActive: false },
        });
        res.json({ message: "Bundle deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting bundle:", error);
        res.status(500).json({ message: "Error deleting bundle" });
    }
});
exports.deleteBundle = deleteBundle;
