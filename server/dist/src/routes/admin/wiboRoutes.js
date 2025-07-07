"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/admin/wiboRoutes.ts
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
// Import all controllers
const wiboController_1 = require("../../controllers/admin/wiboController");
const router = (0, express_1.Router)();
// User import route
router.post("/import-users", (0, auth_1.requireAuth)(["admin"]), wiboController_1.importWiboUsers);
// Category import route
router.post("/import-categories", (0, auth_1.requireAuth)(["admin"]), wiboController_1.importWiboCategories);
// Add the new product import route
router.post("/import-products", (0, auth_1.requireAuth)(["admin"]), wiboController_1.importWiboProducts);
exports.default = router;
