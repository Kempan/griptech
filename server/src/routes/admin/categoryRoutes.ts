import { Router } from "express";
import { createCategory, deleteCategory, getCategoryById, updateCategory } from "../../controllers/admin/categoryController";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.post("/", requireAuth(["admin"]), createCategory);
router.put("/:id", requireAuth(["admin"]), updateCategory);
router.delete("/:id", requireAuth(["admin"]), deleteCategory);
router.get("/:id", requireAuth(["admin"]), getCategoryById);

export default router;
