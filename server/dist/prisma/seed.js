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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const slugify_1 = __importDefault(require("slugify"));
const prisma = new client_1.PrismaClient();
const saltRounds = 10;
// Function to fetch category ID by slug
function getCategoryIdBySlug(slug) {
    return __awaiter(this, void 0, void 0, function* () {
        const category = yield prisma.productCategory.findUnique({
            where: { slug },
            select: { id: true },
        });
        return category ? category.id : null;
    });
}
// Function to fetch product ID by slug
function getProductIdBySlug(slug) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield prisma.product.findUnique({
            where: { slug },
            select: { id: true },
        });
        return product ? product.id : null;
    });
}
// Function to fetch expense summary ID by date (since there is no slug)
function getExpenseSummaryIdByDate(date) {
    return __awaiter(this, void 0, void 0, function* () {
        const summary = yield prisma.expenseSummary.findFirst({
            where: { date: new Date(date) },
            select: { id: true },
        });
        return summary ? summary.id : null;
    });
}
// Function to clear data in reverse order
function deleteAllData(fileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const fileName of fileNames) {
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const model = prisma[modelName];
            if (model) {
                try {
                    yield prisma.$transaction([model.deleteMany({})]);
                    console.log(`Cleared data from ${modelName}`);
                }
                catch (error) {
                    console.error(`Failed to clear ${modelName}: ${error.message}`);
                }
            }
        }
    });
}
// Function to seed data
function seedData(fileNames, dataDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const fileName of fileNames) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const model = prisma[modelName];
            if (!model) {
                console.error(`No Prisma model matches ${fileName}`);
                continue;
            }
            for (const data of jsonData) {
                try {
                    // Hash passwords for users
                    if (modelName === "user") {
                        data.password = yield bcrypt_1.default.hash(data.password || "defaultpassword", saltRounds);
                        data.roles = data.roles || [];
                    }
                    // Ensure slug is unique for new products and categories
                    if (modelName === "product" || modelName === "productCategory") {
                        if (!data.slug) {
                            data.slug = (0, slugify_1.default)(data.name, { lower: true, strict: true });
                        }
                    }
                    // Convert `parentId` from slug to integer before inserting product categories
                    if (modelName === "productCategory" && data.parentId) {
                        data.parentId = yield getCategoryIdBySlug(data.parentId);
                    }
                    // Convert `categoryIds` from slugs to integers for products
                    if (modelName === "product") {
                        const { categoryIds } = data, productData = __rest(data, ["categoryIds"]);
                        const createdProduct = yield model.create({
                            data: productData,
                        });
                        if (categoryIds && categoryIds.length > 0) {
                            for (const categorySlug of categoryIds) {
                                const categoryId = yield getCategoryIdBySlug(categorySlug);
                                if (categoryId) {
                                    yield prisma.productCategoryRelation.create({
                                        data: {
                                            productId: createdProduct.id,
                                            categoryId: categoryId,
                                        },
                                    });
                                }
                            }
                        }
                        continue;
                    }
                    // Convert `productId` from slug to integer in sales and purchases
                    if (modelName === "sale" || modelName === "purchase") {
                        if (typeof data.productId === "string") {
                            data.productId = yield getProductIdBySlug(data.productId);
                        }
                        // If productId is already a number, keep it as is
                    }
                    // Convert `expenseSummaryId` from date to integer in `expenseByCategory`
                    if (modelName === "expenseByCategory") {
                        data.expenseSummaryId = yield getExpenseSummaryIdByDate(data.date);
                    }
                    yield model.create({ data });
                }
                catch (error) {
                    console.error(`Error seeding ${modelName}:`, error);
                }
            }
            console.log(`Seeded ${modelName} from ${fileName}`);
        }
    });
}
// Main function
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "seedData");
        const orderedFileNames = [
            "productCategory.json",
            "expenseSummary.json",
            "expenseByCategory.json",
            "product.json",
            "sale.json",
            "salesSummary.json",
            "purchase.json",
            "purchaseSummary.json",
            "user.json",
            "expense.json",
        ];
        const reversedFileNames = [...orderedFileNames].reverse();
        console.log("🗑 Clearing data...");
        yield deleteAllData(reversedFileNames);
        console.log("🌱 Seeding data...");
        yield seedData(orderedFileNames, dataDirectory);
    });
}
main()
    .catch((e) => console.error("❌ Error during seeding:", e))
    .finally(() => __awaiter(void 0, void 0, void 0, function* () { return yield prisma.$disconnect(); }));
