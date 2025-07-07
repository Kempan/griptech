/* --- Begin server/src/routes/store/productRoutes.ts --- */
import { Router } from "express";
import {
	getProducts,
	getProductsByCategorySlug,
	getProductBySlug,
	getProductById,
} from "../../controllers/public/productController";

const router = Router();

router.get("/by-slug/:slug", getProductBySlug);
router.get("/by-category/:slug", getProductsByCategorySlug);
router.get("/:id", getProductById);
router.get("/", getProducts);

export default router;
/* --- End server/src/routes/store/productRoutes.ts --- */
