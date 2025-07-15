"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.getSession = exports.loginUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../../lib/jwt");
const prisma = new client_1.PrismaClient();
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔵 Login attempt for:", req.body.email);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("🔴 Missing email or password");
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log("🔴 User not found:", email);
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        if (!user.password) {
            console.log("🔴 User has no password:", email);
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const passwordMatches = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatches) {
            console.log("🔴 Password mismatch for:", email);
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        // Create JWT token
        const token = (0, jwt_1.signJWT)({
            userId: user.id,
            email: user.email,
            roles: user.roles || [],
        });
        // Set httpOnly cookie
        const cookieSettings = (0, jwt_1.getCookieSettings)();
        res.cookie("auth-token", token, cookieSettings);
        console.log("🟢 Login successful for:", user.email);
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles || [],
            },
        });
    }
    catch (error) {
        console.error("🔴 Login failed:", error);
        res.status(500).json({ message: "Login failed" });
    }
});
exports.loginUser = loginUser;
const getSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Accept token from EITHER cookie OR Authorization header
        const token = req.cookies["auth-token"] ||
            ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", ""));
        if (!token) {
            res.status(200).json({ isLoggedIn: false });
            return;
        }
        try {
            const decoded = (0, jwt_1.verifyJWT)(token);
            // Get fresh user data from database
            const user = yield prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    roles: true,
                },
            });
            if (!user) {
                // User no longer exists
                const cookieSettings = (0, jwt_1.getCookieSettings)();
                res.clearCookie("auth-token", cookieSettings);
                res.status(200).json({ isLoggedIn: false });
                return;
            }
            res.status(200).json({
                isLoggedIn: true,
                userId: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles || [],
            });
        }
        catch (jwtError) {
            // Invalid or expired token
            const cookieSettings = (0, jwt_1.getCookieSettings)();
            res.clearCookie("auth-token", cookieSettings);
            res.status(200).json({ isLoggedIn: false });
        }
    }
    catch (error) {
        console.error("Session verification failed:", error);
        res.status(200).json({ isLoggedIn: false });
    }
});
exports.getSession = getSession;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookieSettings = (0, jwt_1.getCookieSettings)();
        res.clearCookie("auth-token", cookieSettings);
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout failed:", error);
        res.status(500).json({ message: "Logout failed" });
    }
});
exports.logoutUser = logoutUser;
