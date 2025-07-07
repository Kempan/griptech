// server/src/routes/admin/orderRoutes.ts
import { Router } from "express";
import {
	getOrders,
	getOrderById,
	updateOrder,
	deleteOrder,
	getOrderStatistics,
} from "../../controllers/admin/orderController";
import { connectUserToOrder } from "../../controllers/admin/userController";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Admin routes
router.get("/", requireAuth(["admin"]), getOrders);
router.get("/statistics", requireAuth(["admin"]), getOrderStatistics);
router.get("/:id", requireAuth(["admin"]), getOrderById);
router.put("/:id", requireAuth(["admin"]), updateOrder);
router.delete("/:id", requireAuth(["admin"]), deleteOrder);

// User connection route
router.put("/:id/connect-user", requireAuth(["admin"]), connectUserToOrder);

export default router;
