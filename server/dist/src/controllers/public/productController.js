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
exports.getProductsByCategorySlug = exports.getProductBySlug = exports.getProducts = exports.getProductById = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                productCategories: {
                    include: { category: true }, // ✅ Fetch multiple categories
                },
            },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // ✅ Transform data for better readability
        const formattedProduct = Object.assign(Object.assign({}, product), { categories: product.productCategories.map((rel) => rel.category) });
        res.json(formattedProduct);
    }
    catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Error retrieving product details" });
    }
});
exports.getProductById = getProductById;
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const search = (_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString();
        const limit = parseInt(req.query.limit) || 999;
        console.log("getProducts", limit);
        const products = yield prisma.product.findMany({
            where: search
                ? {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                }
                : undefined,
            take: limit,
            include: {
                productCategories: {
                    include: { category: true },
                },
            },
        });
        // ✅ Remove `productCategories` & attach `categories` directly
        const formattedProducts = products.map((_a) => {
            var { productCategories } = _a, product = __rest(_a, ["productCategories"]);
            return (Object.assign(Object.assign({}, product), { price: Number(product.price), createdAt: product.createdAt.toISOString(), updatedAt: product.updatedAt.toISOString(), categories: productCategories.map((rel) => ({
                    id: rel.category.id,
                    name: rel.category.name,
                    slug: rel.category.slug,
                })) }));
        });
        res.json(formattedProducts);
    }
    catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({ message: "Error retrieving products" });
    }
});
exports.getProducts = getProducts;
const getProductBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    try {
        const product = yield prisma.product.findUnique({
            where: { slug },
            include: {
                productCategories: {
                    include: { category: true }, // ✅ Fetch multiple categories
                },
            },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // ✅ Transform data to include category details
        const formattedProduct = Object.assign(Object.assign({}, product), { categories: product.productCategories.map((rel) => rel.category) });
        res.json(formattedProduct);
    }
    catch (error) {
        console.error("Error retrieving product by slug:", error);
        res.status(500).json({ message: "Error retrieving product by slug" });
    }
});
exports.getProductBySlug = getProductBySlug;
const getProductsByCategorySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        if (!slug) {
            res.status(400).json({ message: "Category slug is required" });
            return;
        }
        // ✅ Find category by slug
        const category = yield prisma.productCategory.findUnique({
            where: { slug: slug },
        });
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        // ✅ Fetch products linked to this category
        const products = yield prisma.product.findMany({
            where: {
                productCategories: {
                    some: {
                        categoryId: category.id, // ✅ Find products in this category
                    },
                },
            },
            include: {
                productCategories: {
                    include: { category: true }, // ✅ Fetch category details
                },
            },
        });
        // ✅ Transform data to only include `categories`
        const formattedProducts = products.map((_a) => {
            var { productCategories } = _a, product = __rest(_a, ["productCategories"]);
            return (Object.assign(Object.assign({}, product), { categories: productCategories.map((rel) => rel.category) }));
        });
        res.json(formattedProducts);
    }
    catch (error) {
        console.error("Error retrieving products by category slug:", error);
        res
            .status(500)
            .json({ message: "Error retrieving products by category slug" });
    }
});
exports.getProductsByCategorySlug = getProductsByCategorySlug;
