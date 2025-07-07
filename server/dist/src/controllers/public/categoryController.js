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
exports.getCategoryTopLevelBySlug = exports.getCategoryBySlug = exports.getCategories = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma.productCategory.findMany({
            where: {
                parentId: null, // Fetch only top-level categories
            },
            include: {
                children: {
                    include: {
                        children: true, // Fetch nested child categories
                    },
                },
            },
        });
        res.json(categories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving categories" });
    }
});
exports.getCategories = getCategories;
const getCategoryBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        // ✅ Fetch category and its hierarchical parents (up to 3 levels)
        const category = yield prisma.productCategory.findUnique({
            where: { slug },
            include: {
                parent: {
                    include: {
                        parent: {
                            include: {
                                parent: true, // ✅ Include up to three levels of parents
                            },
                        },
                    },
                },
                children: true, // ✅ Include direct child categories
            },
        });
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        // ✅ Format the response to exclude `productCategories`
        const formattedCategory = {
            id: category.id,
            slug: category.slug,
            name: category.name,
            description: category.description,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            parent: category.parent, // ✅ Include parent hierarchy
            children: category.children, // ✅ Include child categories
        };
        res.json(formattedCategory);
    }
    catch (error) {
        console.error("Error retrieving category:", error);
        res.status(500).json({ message: "Error retrieving category" });
    }
});
exports.getCategoryBySlug = getCategoryBySlug;
const getCategoryTopLevelBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        // Fetch the current category with only parentId
        const currentCategory = yield prisma.productCategory.findUnique({
            where: { slug },
            select: { id: true, parentId: true }, // Only fetch necessary fields
        });
        if (!currentCategory) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        // Find the top-level category by traversing the parentId
        let topCategory = currentCategory;
        while (topCategory.parentId) {
            const parentCategory = yield prisma.productCategory.findUnique({
                where: { id: topCategory.parentId },
                select: { id: true, parentId: true }, // Only fetch necessary fields
            });
            if (!parentCategory)
                break; // If parent is not found, stop
            topCategory = parentCategory;
        }
        // Fetch the top category again, now including its children
        const fullCategoryData = yield prisma.productCategory.findUnique({
            where: { id: topCategory.id },
            include: {
                children: {
                    include: {
                        children: true, // Fetch second and third-level children
                    },
                },
            },
        });
        if (!fullCategoryData) {
            res.status(404).json({ message: "No categories found" });
            return;
        }
        res.json(fullCategoryData);
    }
    catch (error) {
        console.error("Error fetching top-level category:", error);
        res.status(500).json({ message: "Error retrieving category" });
    }
});
exports.getCategoryTopLevelBySlug = getCategoryTopLevelBySlug;
