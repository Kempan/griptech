// server/src/routes/public/userRoutes.ts
import { Router } from "express";
import {
	getUsers,
	getUserProfile,
	updateUserProfile,
	updateUserAddresses,
} from "../../controllers/public/userController";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Public routes - no authentication required
router.get("/", getUsers);

// Protected routes - require authentication
router.get("/profile", requireAuth(), getUserProfile);
router.put("/profile", requireAuth(), updateUserProfile);
router.put("/addresses", requireAuth(), updateUserAddresses);

export default router;