"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/admin/userRoutes.ts
const express_1 = require("express");
const userController_1 = require("../../controllers/admin/userController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Admin user routes
router.get("/search", (0, auth_1.requireAuth)(["admin"]), userController_1.searchUsers);
// Get all users
router.get("/", (0, auth_1.requireAuth)(["admin"]), userController_1.getUsers);
// Get a user by ID
router.get("/:id", (0, auth_1.requireAuth)(["admin"]), userController_1.getUserById);
// Get orders for a specific user
router.get("/:id/orders", (0, auth_1.requireAuth)(["admin"]), userController_1.getUserOrders);
// Create a new user
router.post("/", (0, auth_1.requireAuth)(["admin"]), userController_1.createUser);
// Import users (new endpoint)
router.post("/import", (0, auth_1.requireAuth)(["admin"]), userController_1.importUsers);
// Update a user
router.put("/:id", (0, auth_1.requireAuth)(["admin"]), userController_1.updateUser);
// Delete a user
router.delete("/:id", (0, auth_1.requireAuth)(["admin"]), userController_1.deleteUser);
exports.default = router;
