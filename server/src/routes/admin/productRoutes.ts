import { Router } from "express";
import { createProduct, updateProductCategories, getAdminProducts, updateProduct, deleteProduct } from "../../controllers/admin/productController";
import { requireAuth } from "../../middleware/auth";
const router = Router();

router.post("/", requireAuth(["admin"]), createProduct);

router.put('/:id', requireAuth(["admin"]), updateProduct);
router.put("/:id/categories", requireAuth(["admin"]), updateProductCategories);

router.get("/", requireAuth(["admin"]), getAdminProducts);

router.delete("/:id", requireAuth(["admin"]), deleteProduct);

export default router;
