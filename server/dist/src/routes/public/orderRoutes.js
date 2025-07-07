"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/public/orderRoutes.ts
const express_1 = require("express");
const orderController_1 = require("../../controllers/public/orderController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post("/", orderController_1.createOrder);
router.get("/user", (0, auth_1.requireAuth)(), orderController_1.getUserOrders);
router.get("/user/:orderNumber", (0, auth_1.requireAuth)(), orderController_1.getUserOrderByNumber);
router.get("/:id", (0, auth_1.requireAuth)(), orderController_1.getUserOrderById);
exports.default = router;
