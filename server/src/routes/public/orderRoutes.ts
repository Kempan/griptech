// server/src/routes/public/orderRoutes.ts
import { Router } from "express";
import {
	createOrder,
	getUserOrders,
	getUserOrderByNumber,
	getUserOrderById,
} from "../../controllers/public/orderController";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Public routes
router.post("/", createOrder);
router.get("/user", requireAuth(), getUserOrders);
router.get("/user/:orderNumber", requireAuth(), getUserOrderByNumber);
router.get("/:id", requireAuth(), getUserOrderById);


export default router;