"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../../controllers/admin/categoryController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post("/", (0, auth_1.requireAuth)(["admin"]), categoryController_1.createCategory);
router.put("/:id", (0, auth_1.requireAuth)(["admin"]), categoryController_1.updateCategory);
router.delete("/:id", (0, auth_1.requireAuth)(["admin"]), categoryController_1.deleteCategory);
router.get("/:id", (0, auth_1.requireAuth)(["admin"]), categoryController_1.getCategoryById);
exports.default = router;
