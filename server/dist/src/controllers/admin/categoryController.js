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
exports.getCategoryById = exports.deleteCategory = exports.updateCategory = exports.createCategory = void 0;
const client_1 = require("@prisma/client");
const slugify_1 = require("../../lib/slugify");
const prisma = new client_1.PrismaClient();
/** 🔹 CREATE CATEGORY */
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name, slug, parentId } = req.body;
        if (!name) {
            res.status(400).json({ message: "Name is required" });
            return;
        }
        // Generate unique slug using the shared helper
        slug = yield (0, slugify_1.generateUniqueCategorySlug)(prisma, name, slug);
        const category = yield prisma.productCategory.create({
            data: {
                name,
                slug,
                parentId: parentId || null,
            },
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Error creating category" });
    }
});
exports.createCategory = createCategory;
/** 🔹 UPDATE CATEGORY */
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, slug, parentId, description, metaTitle, metaDescription, metaKeywords, } = req.body;
        // Check if category exists
        const category = yield prisma.productCategory.findUnique({
            where: { id: Number(id) },
        });
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        // Only regenerate slug if explicitly provided
        let finalSlug = category.slug;
        if (slug !== undefined) {
            finalSlug = yield (0, slugify_1.generateUniqueCategorySlug)(prisma, name || category.name, slug, Number(id) // Exclude current category when checking uniqueness
            );
        }
        // Update category
        const updatedCategory = yield prisma.productCategory.update({
            where: { id: Number(id) },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name !== undefined && { name })), { slug: finalSlug }), (parentId !== undefined && { parentId: parentId || null })), (description !== undefined && { description })), (metaTitle !== undefined && { metaTitle })), (metaDescription !== undefined && { metaDescription })), (metaKeywords !== undefined && { metaKeywords })),
        });
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Error updating category" });
    }
});
exports.updateCategory = updateCategory;
/** 🔹 DELETE CATEGORY */
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if category exists
        const category = yield prisma.productCategory.findUnique({
            where: { id: Number(id) },
        });
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        // Delete the category
        yield prisma.productCategory.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Error deleting category" });
    }
});
exports.deleteCategory = deleteCategory;
/** 🔹 GET CATEGORY BY ID */
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield prisma.productCategory.findUnique({
        where: { id: Number(id) },
    });
    if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
    }
    res.status(200).json(category);
});
exports.getCategoryById = getCategoryById;
