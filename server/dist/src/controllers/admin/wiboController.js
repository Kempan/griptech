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
exports.importWiboProducts = exports.importWiboCategories = exports.importWiboUsers = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const slugify_1 = __importDefault(require("slugify"));
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
const importWiboUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("Importing Wibo users");
        const { customers } = req.body;
        if (!Array.isArray(customers)) {
            res.status(400).json({
                success: false,
                message: "Invalid customer data format",
            });
            return;
        }
        // Track import results
        let imported = 0;
        let updated = 0;
        let errors = 0;
        for (const customer of customers) {
            try {
                // Skip customers without required fields
                if (!customer.EMail || !customer.Name) {
                    errors++;
                    continue;
                }
                // Prepare user data from Wibo customer
                const userData = {
                    email: customer.EMail,
                    name: customer.Name,
                    phone: "", // Will try to find from contacts
                    shippingAddress: {
                        address1: customer.Address1 || "",
                        address2: customer.Address2 || "",
                        postalCode: customer.ZipCode || "",
                        city: customer.City || "",
                        country: "Sweden", // Default country
                        company: customer.Name,
                    },
                    billingAddress: {
                        address1: customer.Address1 || "",
                        address2: customer.Address2 || "",
                        postalCode: customer.ZipCode || "",
                        city: customer.City || "",
                        country: "Sweden", // Default country
                        company: customer.Name,
                    },
                    wiboData: {
                        customerId: customer.ID,
                        customerNo: customer.No,
                        noDelKolliCost: customer.NoDelKolliCost,
                        deliveries: customer.Deliveries,
                        locations: customer.Locations,
                    },
                };
                // Try to get phone from contacts if available
                if ((_a = customer.Contacts) === null || _a === void 0 ? void 0 : _a.length) {
                    const primaryContact = customer.Contacts[0];
                    userData.name = primaryContact.Name || customer.Name;
                    userData.email = primaryContact.EMail || customer.EMail;
                    // You might extract phone from contact name if it contains it
                }
                // Check if user exists
                const existingUser = yield prisma.user.findUnique({
                    where: { email: userData.email },
                });
                if (existingUser) {
                    // Update existing user
                    yield prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            name: userData.name,
                            phone: userData.phone,
                            shippingAddress: userData.shippingAddress,
                            billingAddress: userData.billingAddress,
                            wiboData: userData.wiboData,
                        },
                    });
                    updated++;
                }
                else {
                    // Create new user with random password
                    const tempPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = yield bcrypt_1.default.hash(tempPassword, SALT_ROUNDS);
                    yield prisma.user.create({
                        data: {
                            email: userData.email,
                            name: userData.name,
                            password: hashedPassword,
                            phone: userData.phone,
                            roles: ["customer"],
                            shippingAddress: userData.shippingAddress,
                            billingAddress: userData.billingAddress,
                            wiboData: userData.wiboData,
                        },
                    });
                    imported++;
                }
            }
            catch (error) {
                console.error(`Error processing customer ${customer.ID}:`, error);
                errors++;
            }
        }
        res.status(200).json({
            success: true,
            message: `Imported ${imported} new customers, updated ${updated} existing customers. ${errors} errors occurred.`,
            imported,
            updated,
            errors,
        });
    }
    catch (error) {
        console.error("Error importing Wibo customers:", error);
        res.status(500).json({
            success: false,
            message: "Error importing customers",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.importWiboUsers = importWiboUsers;
/**
 * Import categories from Wibo API
 * This function processes category data from the Wibo API and creates/updates categories in the database
 */
const importWiboCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Importing Wibo categories");
        const { categories } = req.body;
        if (!Array.isArray(categories)) {
            res.status(400).json({
                success: false,
                message: "Invalid category data format",
            });
            return;
        }
        // Track import results
        const results = {
            created: 0,
            updated: 0,
            errors: 0,
            errorDetails: [],
        };
        // Process main category groups first
        for (const categoryGroup of categories) {
            try {
                // Skip invalid category data
                if (!categoryGroup.Name) {
                    results.errors++;
                    results.errorDetails.push({
                        category: "Unknown",
                        error: "Missing Name field in category group",
                    });
                    continue;
                }
                // Generate a slug for the main category - simple slugify of the name
                const mainCategorySlug = (0, slugify_1.default)(categoryGroup.Name, {
                    lower: true,
                    strict: true,
                });
                // Check if this main category already exists
                const existingMainCategory = yield prisma.productCategory.findFirst({
                    where: {
                        name: categoryGroup.Name,
                    },
                });
                const mainCategoryId = existingMainCategory
                    ? existingMainCategory.id
                    : null;
                let mainCategory;
                if (mainCategoryId) {
                    // Update existing main category
                    mainCategory = yield prisma.productCategory.update({
                        where: { id: mainCategoryId },
                        data: {
                            name: categoryGroup.Name,
                            description: categoryGroup.Description || categoryGroup.Name,
                            slug: mainCategorySlug,
                            wiboCategoryId: categoryGroup.ID,
                        },
                    });
                    results.updated++;
                }
                else {
                    // Create new main category
                    mainCategory = yield prisma.productCategory.create({
                        data: {
                            name: categoryGroup.Name,
                            description: categoryGroup.Description || categoryGroup.Name,
                            slug: mainCategorySlug,
                            wiboCategoryId: categoryGroup.ID,
                        },
                    });
                    results.created++;
                }
                // Now process all subcategories
                if (categoryGroup.Categories &&
                    Array.isArray(categoryGroup.Categories)) {
                    for (const subCategory of categoryGroup.Categories) {
                        try {
                            // Skip invalid subcategory data
                            if (!subCategory.Description) {
                                results.errors++;
                                results.errorDetails.push({
                                    category: categoryGroup.Name,
                                    error: `Missing Description field in subcategory ID: ${subCategory.ID}`,
                                });
                                continue;
                            }
                            // Just slugify the subcategory name directly
                            const subCategorySlug = (0, slugify_1.default)(subCategory.Description, {
                                lower: true,
                                strict: true,
                            });
                            // Check if this subcategory already exists
                            const existingSubCategory = yield prisma.productCategory.findFirst({
                                where: {
                                    name: subCategory.Description,
                                },
                            });
                            const subCategoryId = existingSubCategory
                                ? existingSubCategory.id
                                : null;
                            if (subCategoryId) {
                                // Update existing subcategory
                                yield prisma.productCategory.update({
                                    where: { id: subCategoryId },
                                    data: {
                                        name: subCategory.Description,
                                        slug: subCategorySlug,
                                        parentId: mainCategory.id,
                                        wiboCategoryId: subCategory.ID,
                                    },
                                });
                                results.updated++;
                            }
                            else {
                                // Create new subcategory
                                yield prisma.productCategory.create({
                                    data: {
                                        name: subCategory.Description,
                                        slug: subCategorySlug,
                                        parentId: mainCategory.id,
                                        wiboCategoryId: subCategory.ID,
                                    },
                                });
                                results.created++;
                            }
                        }
                        catch (subCategoryError) {
                            console.error("Error processing subcategory:", subCategoryError);
                            results.errors++;
                            results.errorDetails.push({
                                category: subCategory.Description || "Unknown subcategory",
                                error: subCategoryError instanceof Error
                                    ? subCategoryError.message
                                    : "Unknown error",
                            });
                        }
                    }
                }
            }
            catch (mainCategoryError) {
                console.error("Error processing main category:", mainCategoryError);
                results.errors++;
                results.errorDetails.push({
                    category: categoryGroup.Name || "Unknown category",
                    error: mainCategoryError instanceof Error
                        ? mainCategoryError.message
                        : "Unknown error",
                });
            }
        }
        res.status(200).json({
            success: true,
            message: `Categories import complete: ${results.created} created, ${results.updated} updated, ${results.errors} errors`,
            created: results.created,
            updated: results.updated,
            errors: results.errors,
            errorDetails: results.errorDetails,
        });
    }
    catch (error) {
        console.error("Error importing Wibo categories:", error);
        res.status(500).json({
            success: false,
            message: "Error importing categories",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.importWiboCategories = importWiboCategories;
/**
 * Import products from Wibo API
 * This function processes product data from the Wibo API and creates/updates products in the database
 */
const importWiboProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Importing Wibo products");
        const { products } = req.body;
        if (!Array.isArray(products)) {
            res.status(400).json({
                success: false,
                message: "Invalid product data format",
            });
            return;
        }
        // Track import results
        const results = {
            created: 0,
            updated: 0,
            errors: 0,
            errorDetails: [],
        };
        // Process products one by one
        for (const product of products) {
            try {
                // Skip invalid product data
                if (!product.Description || !product.ArticleNo) {
                    results.errors++;
                    results.errorDetails.push({
                        product: product.ID ? `ID: ${product.ID}` : "Unknown product",
                        error: "Missing Description or ArticleNo field",
                    });
                    continue;
                }
                // Generate slug from product description
                const productSlug = (0, slugify_1.default)(product.Description, {
                    lower: true,
                    strict: true,
                });
                // Find categories by Wibo CategoryID
                let mainCategory = null;
                let subCategory = null;
                // First, try to find the direct category (which might be a subcategory)
                if (product.CategoryID) {
                    subCategory = yield prisma.productCategory.findFirst({
                        where: {
                            wiboCategoryId: product.CategoryID,
                        },
                        include: {
                            parent: true,
                        },
                    });
                    // If we found a subcategory, its parent is the main category
                    if (subCategory && subCategory.parent) {
                        mainCategory = subCategory.parent;
                    }
                    // If we found a category with no parent, it's a main category
                    else if (subCategory) {
                        mainCategory = subCategory;
                        subCategory = null;
                    }
                }
                // Check if this product already exists by ArticleNo in wiboProductData
                const existingProduct = yield prisma.product.findFirst({
                    where: {
                        wiboProductData: {
                            path: ["ArticleNo"],
                            equals: product.ArticleNo,
                        },
                    },
                });
                // If not found by ArticleNo, try by slug
                const existingProductBySlug = !existingProduct
                    ? yield prisma.product.findUnique({
                        where: { slug: productSlug },
                    })
                    : null;
                const productId = (existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.id) || (existingProductBySlug === null || existingProductBySlug === void 0 ? void 0 : existingProductBySlug.id) || null;
                // Prepare the category connections
                const categoryConnections = [];
                // Add connections to both main category and subcategory if found
                if (mainCategory) {
                    categoryConnections.push({
                        categoryId: mainCategory.id,
                    });
                }
                if (subCategory) {
                    categoryConnections.push({
                        categoryId: subCategory.id,
                    });
                }
                // Set default price and stock
                // You might want to extract these from the Wibo data if available
                const defaultPrice = 0; // Set an appropriate default or extract from Wibo data
                const defaultStock = 10; // Set an appropriate default or extract from Wibo data
                if (productId) {
                    // Update existing product
                    yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                        var _a;
                        // Update the product
                        yield tx.product.update({
                            where: { id: productId },
                            data: Object.assign(Object.assign({ name: product.Description, slug: productSlug, wiboProductData: product }, (((_a = existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.price) === null || _a === void 0 ? void 0 : _a.equals(0))
                                ? { price: defaultPrice }
                                : {})), ((existingProduct === null || existingProduct === void 0 ? void 0 : existingProduct.stockQuantity) === 0
                                ? { stockQuantity: defaultStock }
                                : {})),
                        });
                        // Clear existing category relationships and create new ones
                        yield tx.productCategoryRelation.deleteMany({
                            where: { productId },
                        });
                        // Create new category relationships
                        if (categoryConnections.length > 0) {
                            yield tx.productCategoryRelation.createMany({
                                data: categoryConnections.map((conn) => ({
                                    productId,
                                    categoryId: conn.categoryId,
                                })),
                            });
                        }
                    }));
                    results.updated++;
                }
                else {
                    // Create new product
                    yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                        // Create the product
                        const newProduct = yield tx.product.create({
                            data: {
                                name: product.Description,
                                slug: productSlug,
                                price: defaultPrice,
                                stockQuantity: defaultStock,
                                wiboProductData: product,
                            },
                        });
                        // Create category relationships
                        if (categoryConnections.length > 0) {
                            yield tx.productCategoryRelation.createMany({
                                data: categoryConnections.map((conn) => ({
                                    productId: newProduct.id,
                                    categoryId: conn.categoryId,
                                })),
                            });
                        }
                    }));
                    results.created++;
                }
            }
            catch (productError) {
                console.error("Error processing product:", productError);
                results.errors++;
                results.errorDetails.push({
                    product: product.Description || `ID: ${product.ID}` || "Unknown product",
                    error: productError instanceof Error
                        ? productError.message
                        : "Unknown error",
                });
            }
        }
        res.status(200).json({
            success: true,
            message: `Products import complete: ${results.created} created, ${results.updated} updated, ${results.errors} errors`,
            created: results.created,
            updated: results.updated,
            errors: results.errors,
            errorDetails: results.errorDetails,
        });
    }
    catch (error) {
        console.error("Error importing Wibo products:", error);
        res.status(500).json({
            success: false,
            message: "Error importing products",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.importWiboProducts = importWiboProducts;
