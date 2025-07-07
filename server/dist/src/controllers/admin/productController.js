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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.updateProductCategories = exports.createProduct = exports.getAdminProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAdminProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 5;
        const sortBy = req.query.sortBy || "name";
        const sortOrder = req.query.sortOrder || "asc";
        // console.log({ search, page, pageSize, sortBy, sortOrder });
        // ✅ Ensure page & pageSize are positive numbers
        const pageNumber = Math.max(1, page);
        const perPage = Math.max(1, pageSize);
        const validSortBy = [
            "id",
            "name",
            "price",
            "stockQuantity",
            "createdAt",
        ].includes(sortBy)
            ? sortBy
            : "name";
        const totalCount = yield prisma.product.count({
            where: search ? { name: { contains: search, mode: "insensitive" } } : {},
        });
        const products = yield prisma.product.findMany({
            where: search ? { name: { contains: search, mode: "insensitive" } } : {},
            orderBy: {
                [validSortBy]: sortOrder,
            },
            skip: (pageNumber - 1) * perPage,
            take: perPage,
            include: {
                productCategories: {
                    include: { category: true },
                },
            },
        });
        const formattedProducts = products.map((_a) => {
            var { productCategories } = _a, product = __rest(_a, ["productCategories"]);
            return (Object.assign(Object.assign({}, product), { price: Number(product.price), createdAt: product.createdAt.toISOString(), updatedAt: product.updatedAt.toISOString(), categories: productCategories.map((rel) => ({
                    id: rel.category.id,
                    name: rel.category.name,
                    slug: rel.category.slug,
                })) }));
        });
        res.json({ products: formattedProducts, totalCount });
    }
    catch (error) {
        console.error("❌ Error fetching admin products:", error);
        res.status(500).json({ message: "Error retrieving admin products" });
    }
});
exports.getAdminProducts = getAdminProducts;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug, name, price, rating, stockQuantity } = req.body;
        const product = yield prisma.product.create({
            data: {
                slug,
                name,
                price,
                rating,
                stockQuantity,
            },
        });
        res.status(201).json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating product" });
    }
});
exports.createProduct = createProduct;
const updateProductCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { categoryIds } = req.body;
        // Validate input
        if (!Array.isArray(categoryIds)) {
            res.status(400).json({ message: "categoryIds must be an array" });
            return;
        }
        // Check if product exists
        const product = yield prisma.product.findUnique({
            where: { id: Number(id) },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // ✅ Step 1: Remove all existing category relations for this product
        yield prisma.productCategoryRelation.deleteMany({
            where: { productId: Number(id) },
        });
        // ✅ Step 2: Insert new category relations
        if (categoryIds.length > 0) {
            yield prisma.productCategoryRelation.createMany({
                data: categoryIds.map((categoryId) => ({
                    productId: Number(id),
                    categoryId,
                })),
            });
        }
        res.json({ message: "Product categories updated successfully" });
    }
    catch (error) {
        console.error("Error updating product categories:", error);
        res.status(500).json({ message: "Error updating categories" });
    }
});
exports.updateProductCategories = updateProductCategories;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, slug, price, stockQuantity, categoryIds, 
        // SEO fields
        description, shortDescription, metaTitle, metaDescription, metaKeywords, } = req.body;
        // Check if product exists
        const product = yield prisma.product.findUnique({
            where: { id: Number(id) },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Transaction to update product and categories atomically
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update product details
            yield tx.product.update({
                where: { id: Number(id) },
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name !== undefined && { name })), (slug !== undefined && { slug })), (price !== undefined && { price })), (stockQuantity !== undefined && { stockQuantity })), (description !== undefined && { description })), (shortDescription !== undefined && { shortDescription })), (metaTitle !== undefined && { metaTitle })), (metaDescription !== undefined && { metaDescription })), (metaKeywords !== undefined && { metaKeywords })),
            });
            // Update categories if provided
            if (Array.isArray(categoryIds)) {
                // Remove existing category relations
                yield tx.productCategoryRelation.deleteMany({
                    where: { productId: Number(id) },
                });
                // Insert new category relations
                if (categoryIds.length > 0) {
                    yield tx.productCategoryRelation.createMany({
                        data: categoryIds.map((categoryId) => ({
                            productId: Number(id),
                            categoryId: Number(categoryId),
                        })),
                    });
                }
            }
        }));
        res.json({ message: "Product updated successfully" });
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Error updating product" });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const productId = Number(id);
        // Check if product exists
        const product = yield prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Transaction to delete product and related data atomically
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // First, delete all category relations for this product
            yield tx.productCategoryRelation.deleteMany({
                where: { productId },
            });
            // Then delete the product itself
            yield tx.product.delete({
                where: { id: productId },
            });
        }));
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Error deleting product" });
    }
});
exports.deleteProduct = deleteProduct;
