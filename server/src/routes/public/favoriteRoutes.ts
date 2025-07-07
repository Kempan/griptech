// server/src/routes/public/favoriteRoutes.ts
import { Router } from "express";
import {
	getUserFavorites,
	addToFavorites,
	removeFromFavorites,
	checkFavorites,
	toggleFavorite,
	getProductFavoriteCount,
} from "../../controllers/public/favoriteController";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// All favorite routes require authentication except getting favorite count
router.get("/", requireAuth(), getUserFavorites);
router.post("/", requireAuth(), addToFavorites);
router.delete("/:productId", requireAuth(), removeFromFavorites);
router.post("/check", requireAuth(), checkFavorites);
router.post("/toggle", requireAuth(), toggleFavorite);

// Public route - no authentication required
router.get("/count/:productId", getProductFavoriteCount);

export default router;
