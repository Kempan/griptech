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
exports.generateSlug = generateSlug;
exports.generateUniqueProductSlug = generateUniqueProductSlug;
exports.generateUniqueCategorySlug = generateUniqueCategorySlug;
const slugify_1 = __importDefault(require("slugify"));
/**
 * Configure slugify for consistent behavior across the app
 */
const slugifyOptions = {
    lower: true, // Convert to lowercase
    strict: true, // Strip special characters except replacement
    remove: undefined, // Don't remove any characters before slugifying
    locale: "en", // Use English locale for transliteration
};
/**
 * Generate a slug using the slugify library
 */
function generateSlug(text) {
    return (0, slugify_1.default)(text, slugifyOptions);
}
/**
 * Generate a unique slug for a product
 * If the slug already exists, append a number to make it unique
 */
function generateUniqueProductSlug(prisma, name, providedSlug) {
    return __awaiter(this, void 0, void 0, function* () {
        // If a slug is provided, use it as the base
        let baseSlug = (providedSlug === null || providedSlug === void 0 ? void 0 : providedSlug.trim())
            ? generateSlug(providedSlug)
            : generateSlug(name);
        let slug = baseSlug;
        let count = 1;
        // Check if slug exists and increment counter until we find a unique one
        while (yield prisma.product.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${count++}`;
        }
        return slug;
    });
}
/**
 * Generate a unique slug for a category
 * If the slug already exists, append a number to make it unique
 */
function generateUniqueCategorySlug(prisma, name, providedSlug, excludeId) {
    return __awaiter(this, void 0, void 0, function* () {
        // If a slug is provided, use it as the base
        let baseSlug = (providedSlug === null || providedSlug === void 0 ? void 0 : providedSlug.trim())
            ? generateSlug(providedSlug)
            : generateSlug(name);
        let slug = baseSlug;
        let count = 1;
        // Check if slug exists and increment counter until we find a unique one
        while (true) {
            const existing = yield prisma.productCategory.findFirst({
                where: Object.assign({ slug }, (excludeId && { NOT: { id: excludeId } })),
            });
            if (!existing)
                break;
            slug = `${baseSlug}-${count++}`;
        }
        return slug;
    });
}
