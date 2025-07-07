// server/src/index.ts
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

/* ADMIN ROUTE IMPORTS */
import adminDashboardRoutes from "./routes/admin/dashboardRoutes";
import adminExpenseRoutes from "./routes/admin/expenseRoutes";
import adminCategoryRoutes from "./routes/admin/categoryRoutes";
import adminProductRoutes from "./routes/admin/productRoutes";
import adminUserRoutes from "./routes/admin/userRoutes";
import adminOrderRoutes from "./routes/admin/orderRoutes";

/* PUBLIC ROUTE IMPORTS */
import userRoutes from "./routes/public/userRoutes";
import productRoutes from "./routes/public/productRoutes";
import categoryRoutes from "./routes/public/categoryRoutes";
import authRoutes from "./routes/public/authRoutes";
import orderRoutes from "./routes/public/orderRoutes";
import favoriteRoutes from "./routes/public/favoriteRoutes";
import bundleRoutes from "./routes/public/bundleRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use(cookieParser());

/* ADMIN ROUTES */
app.use("/admin/dashboard", adminDashboardRoutes);
app.use("/admin/expenses", adminExpenseRoutes);
app.use("/admin/categories", adminCategoryRoutes);
app.use("/admin/products", adminProductRoutes);
app.use("/admin/users", adminUserRoutes);
app.use("/admin/orders", adminOrderRoutes);

/* PUBLIC ROUTES */
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/api", authRoutes);
app.use("/orders", orderRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/bundles", bundleRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3001;
app.listen(port, "0.0.0.0", () => {
	console.log(`Server running on port ${port}`);
});
