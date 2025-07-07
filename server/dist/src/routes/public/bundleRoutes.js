"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/public/bundleRoutes.ts
const express_1 = require("express");
const bundleController_1 = require("../../controllers/public/bundleController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// All bundle routes require authentication
router.get("/", (0, auth_1.requireAuth)(), bundleController_1.getUserBundles);
router.get("/:id", (0, auth_1.requireAuth)(), bundleController_1.getBundleById);
router.post("/", (0, auth_1.requireAuth)(), bundleController_1.createBundle);
router.put("/:id", (0, auth_1.requireAuth)(), bundleController_1.updateBundle);
router.put("/:id/items", (0, auth_1.requireAuth)(), bundleController_1.updateBundleItems);
router.post("/:id/products", (0, auth_1.requireAuth)(), bundleController_1.addProductToBundle);
router.delete("/:id/products/:productId", (0, auth_1.requireAuth)(), bundleController_1.removeProductFromBundle);
router.delete("/:id", (0, auth_1.requireAuth)(), bundleController_1.deleteBundle);
exports.default = router;
