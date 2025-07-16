"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
/* ADMIN ROUTE IMPORTS */
const dashboardRoutes_1 = __importDefault(require("./routes/admin/dashboardRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/admin/expenseRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/admin/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/admin/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/admin/userRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/admin/orderRoutes"));
/* PUBLIC ROUTE IMPORTS */
const userRoutes_2 = __importDefault(require("./routes/public/userRoutes"));
const productRoutes_2 = __importDefault(require("./routes/public/productRoutes"));
const categoryRoutes_2 = __importDefault(require("./routes/public/categoryRoutes"));
const authRoutes_1 = __importDefault(require("./routes/public/authRoutes"));
const orderRoutes_2 = __importDefault(require("./routes/public/orderRoutes"));
const favoriteRoutes_1 = __importDefault(require("./routes/public/favoriteRoutes"));
const bundleRoutes_1 = __importDefault(require("./routes/public/bundleRoutes"));
/* CONFIGURATIONS */
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// Enhanced CORS configuration for cross-domain authentication
const allowedOrigins = [
    "https://main.d3rzdlhtikzd4k.amplifyapp.com",
    "https://griptech.se", // Add your main domain
    "https://www.griptech.se", // Add www subdomain
    "http://localhost:3000",
    "https://localhost:3000",
];
app.use((0, cors_1.default)({
    credentials: true,
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            console.log("CORS blocked origin:", origin);
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
}));
app.use((0, cookie_parser_1.default)());
/* ADMIN ROUTES */
app.use("/admin/dashboard", dashboardRoutes_1.default);
app.use("/admin/expenses", expenseRoutes_1.default);
app.use("/admin/categories", categoryRoutes_1.default);
app.use("/admin/products", productRoutes_1.default);
app.use("/admin/users", userRoutes_1.default);
app.use("/admin/orders", orderRoutes_1.default);
/* PUBLIC ROUTES */
app.use("/users", userRoutes_2.default);
app.use("/products", productRoutes_2.default);
app.use("/categories", categoryRoutes_2.default);
app.use("/api", authRoutes_1.default);
app.use("/orders", orderRoutes_2.default);
app.use("/favorites", favoriteRoutes_1.default);
app.use("/bundles", bundleRoutes_1.default);
/* SERVER */
const port = Number(process.env.PORT) || 3001;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
