import { Router } from "express";
import {
	getCategories,
	getCategoryBySlug,
	getCategoryTopLevelBySlug,
} from "../../controllers/public/categoryController";

const router = Router();

router.get("/", getCategories);

router.get("/:slug", getCategoryBySlug);

router.get("/category-top-level/:slug", getCategoryTopLevelBySlug);

export default router;
