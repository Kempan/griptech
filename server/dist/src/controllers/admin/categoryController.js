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
exports.getCategoryById = exports.deleteCategory = exports.updateCategory = exports.createCategory = void 0;
const client_1 = require("@prisma/client");
const slugify_1 = __importDefault(require("slugify")); // ✅ Import slugify library
const prisma = new client_1.PrismaClient();
/** 🔹 Utility function to generate a unique slug */
const generateUniqueSlug = (name) => __awaiter(void 0, void 0, void 0, function* () {
    let baseSlug = (0, slugify_1.default)(name, { lower: true, strict: true }); // Convert name to slug
    let slug = baseSlug;
    let count = 1;
    // Check if the slug already exists in the database
    while (yield prisma.productCategory.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${count++}`; // Append a number if it already exists
    }
    return slug;
});
/** 🔹 CREATE CATEGORY */
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name, slug, parentId } = req.body;
        if (!name) {
            res.status(400).json({ message: "Name is required" });
            return;
        }
        // Generate slug if not provided
        if (!slug) {
            slug = yield generateUniqueSlug(name);
        }
        const category = yield prisma.productCategory.create({
            data: {
                name,
                slug,
                parentId: parentId || null, // Assign parent if provided
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
        // Update category
        const updatedCategory = yield prisma.productCategory.update({
            where: { id: Number(id) },
            data: {
                name,
                slug,
                parentId: parentId || null,
                description,
                metaTitle,
                metaDescription,
                metaKeywords,
            },
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
