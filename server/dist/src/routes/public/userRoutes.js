"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/public/userRoutes.ts
const express_1 = require("express");
const userController_1 = require("../../controllers/public/userController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Public routes - no authentication required
router.get("/", userController_1.getUsers);
// Protected routes - require authentication
router.get("/profile", (0, auth_1.requireAuth)(), userController_1.getUserProfile);
router.put("/profile", (0, auth_1.requireAuth)(), userController_1.updateUserProfile);
router.put("/addresses", (0, auth_1.requireAuth)(), userController_1.updateUserAddresses);
exports.default = router;
