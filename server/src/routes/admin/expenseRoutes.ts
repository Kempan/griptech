import { Router } from "express";
import { getExpensesByCategory } from "../../controllers/admin/expenseController";

const router = Router();

router.get("/", getExpensesByCategory);

export default router;
