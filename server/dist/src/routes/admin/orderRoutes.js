"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/admin/orderRoutes.ts
const express_1 = require("express");
const orderController_1 = require("../../controllers/admin/orderController");
const userController_1 = require("../../controllers/admin/userController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Admin routes
router.get("/", (0, auth_1.requireAuth)(["admin"]), orderController_1.getOrders);
router.get("/statistics", (0, auth_1.requireAuth)(["admin"]), orderController_1.getOrderStatistics);
router.get("/:id", (0, auth_1.requireAuth)(["admin"]), orderController_1.getOrderById);
router.put("/:id", (0, auth_1.requireAuth)(["admin"]), orderController_1.updateOrder);
router.delete("/:id", (0, auth_1.requireAuth)(["admin"]), orderController_1.deleteOrder);
// User connection route
router.put("/:id/connect-user", (0, auth_1.requireAuth)(["admin"]), userController_1.connectUserToOrder);
exports.default = router;
