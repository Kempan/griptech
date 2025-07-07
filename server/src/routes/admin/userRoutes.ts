// server/src/routes/admin/userRoutes.ts
import { Router } from "express";
import {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	searchUsers,
	getUserOrders,
	importUsers, // Add the new import function
} from "../../controllers/admin/userController";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Admin user routes
router.get("/search", requireAuth(["admin"]), searchUsers);

// Get all users
router.get("/", requireAuth(["admin"]), getUsers);

// Get a user by ID
router.get("/:id", requireAuth(["admin"]), getUserById);

// Get orders for a specific user
router.get("/:id/orders", requireAuth(["admin"]), getUserOrders);

// Create a new user
router.post("/", requireAuth(["admin"]), createUser);

// Import users (new endpoint)
router.post("/import", requireAuth(["admin"]), importUsers);

// Update a user
router.put("/:id", requireAuth(["admin"]), updateUser);

// Delete a user
router.delete("/:id", requireAuth(["admin"]), deleteUser);

export default router;
