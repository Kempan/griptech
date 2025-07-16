// server/src/index.ts
import express, { Request, Response, NextFunction } from "express";
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

// Enhanced CORS configuration for cross-domain authentication
const allowedOrigins = [
	"https://main.d3rzdlhtikzd4k.amplifyapp.com",
	"https://griptech.se", // Add your main domain
	"https://www.griptech.se", // Add www subdomain
	"http://localhost:3000",
	"https://localhost:3000",
];

console.log("🔵 CORS allowed origins:", allowedOrigins);

app.use(
	cors({
		credentials: true,
		origin: function (origin, callback) {
			console.log("🔵 CORS request from origin:", origin);
			
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) {
				console.log("🟢 Allowing request with no origin");
				return callback(null, true);
			}
			
			if (allowedOrigins.indexOf(origin) !== -1) {
				console.log("🟢 CORS allowed for origin:", origin);
				callback(null, true);
			} else {
				console.log("🔴 CORS blocked origin:", origin);
				callback(new Error("Not allowed by CORS"));
			}
		},
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type", 
			"Authorization", 
			"Cookie", 
			"X-Requested-With",
			"X-CSRF-Token"
		],
		exposedHeaders: ["Set-Cookie"],
		preflightContinue: false,
		optionsSuccessStatus: 204,
	})
);

app.use(cookieParser());

// Add request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
	console.log(`🔵 ${req.method} ${req.path} - Origin: ${req.headers.origin} - Cookies: ${Object.keys(req.cookies || {}).length}`);
	next();
});

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
	console.log(`🟢 Server running on port ${port}`);
	console.log(`🔵 CORS allowed origins: ${allowedOrigins.join(', ')}`);
	console.log(`🔵 Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`🔵 JWT expires in: ${process.env.JWT_EXPIRES_IN || '15m'}`);
});
