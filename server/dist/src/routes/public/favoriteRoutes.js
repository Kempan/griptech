"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/public/favoriteRoutes.ts
const express_1 = require("express");
const favoriteController_1 = require("../../controllers/public/favoriteController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// All favorite routes require authentication except getting favorite count
router.get("/", (0, auth_1.requireAuth)(), favoriteController_1.getUserFavorites);
router.post("/", (0, auth_1.requireAuth)(), favoriteController_1.addToFavorites);
router.delete("/:productId", (0, auth_1.requireAuth)(), favoriteController_1.removeFromFavorites);
router.post("/check", (0, auth_1.requireAuth)(), favoriteController_1.checkFavorites);
router.post("/toggle", (0, auth_1.requireAuth)(), favoriteController_1.toggleFavorite);
// Public route - no authentication required
router.get("/count/:productId", favoriteController_1.getProductFavoriteCount);
exports.default = router;
