// server/src/routes/public/bundleRoutes.ts
import { Router } from "express";
import {
	getUserBundles,
	getBundleById,
	createBundle,
	updateBundle,
	updateBundleItems,
	addProductToBundle,
	removeProductFromBundle,
	deleteBundle,
} from "../../controllers/public/bundleController";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// All bundle routes require authentication
router.get("/", requireAuth(), getUserBundles);
router.get("/:id", requireAuth(), getBundleById);
router.post("/", requireAuth(), createBundle);
router.put("/:id", requireAuth(), updateBundle);
router.put("/:id/items", requireAuth(), updateBundleItems);
router.post("/:id/products", requireAuth(), addProductToBundle);
router.delete(
	"/:id/products/:productId",
	requireAuth(),
	removeProductFromBundle
);
router.delete("/:id", requireAuth(), deleteBundle);

export default router;
