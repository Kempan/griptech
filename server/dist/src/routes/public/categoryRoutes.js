"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../../controllers/public/categoryController");
const router = (0, express_1.Router)();
router.get("/", categoryController_1.getCategories);
router.get("/:slug", categoryController_1.getCategoryBySlug);
router.get("/category-top-level/:slug", categoryController_1.getCategoryTopLevelBySlug);
exports.default = router;
