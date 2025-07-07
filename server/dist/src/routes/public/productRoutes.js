"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --- Begin server/src/routes/store/productRoutes.ts --- */
const express_1 = require("express");
const productController_1 = require("../../controllers/public/productController");
const router = (0, express_1.Router)();
router.get("/by-slug/:slug", productController_1.getProductBySlug);
router.get("/by-category/:slug", productController_1.getProductsByCategorySlug);
router.get("/:id", productController_1.getProductById);
router.get("/", productController_1.getProducts);
exports.default = router;
/* --- End server/src/routes/store/productRoutes.ts --- */
