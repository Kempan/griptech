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
const session_1 = require("../../lib/session");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
// Helper function to get cookie settings based on environment
const getCookieSettings = () => {
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
        // Production settings (for API Gateway/AWS)
        return {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        };
    }
    else {
        // Development settings (for localhost)
        return {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        };
    }
};
/**
 * Handle user login
 * Validates credentials and creates a session
 */
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate inputs
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        // Find user by email
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        // User not found or password mismatch
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        // For development with plaintext passwords (replace with bcrypt in production)
        // const passwordMatches = user.password === password;
        // Uncomment this for production with bcrypt hashed passwords
        if (!user.password) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const passwordMatches = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatches) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        // Create session token with user id and roles
        const session = yield (0, session_1.encrypt)({
            userId: user.id.toString(),
            roles: user.roles || [],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        // Environment-aware cookie settings
        const cookieSettings = getCookieSettings();
        res.cookie("session", session, cookieSettings);
        // Send successful response with user info (excluding password)
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
        console.error("Login failed:", error);
        res.status(500).json({ message: "Login failed" });
    }
});
exports.loginUser = loginUser;
/**
 * Get current session information
 */
const getSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            res.status(200).json({ isLoggedIn: false });
            return;
        }
        const session = yield (0, session_1.decrypt)(sessionCookie);
        if (!session || !session.userId) {
            res.status(200).json({ isLoggedIn: false });
            return;
        }
        // Check if session is expired
        if (session.expiresAt &&
            typeof session.expiresAt === "string" &&
            new Date(session.expiresAt) < new Date()) {
            const cookieSettings = getCookieSettings();
            res.clearCookie("session", cookieSettings);
            res.status(200).json({ isLoggedIn: false });
            return;
        }
        // Get updated user information from database
        const user = yield prisma.user.findUnique({
            where: { id: parseInt(session.userId.toString()) },
            select: {
                id: true,
                name: true,
                email: true,
                roles: true,
            },
        });
        if (!user) {
            // User no longer exists in database
            const cookieSettings = getCookieSettings();
            res.clearCookie("session", cookieSettings);
            res.status(200).json({ isLoggedIn: false });
            return;
        }
        // Return session information including user roles
        res.status(200).json({
            isLoggedIn: true,
            userId: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles || [],
        });
    }
    catch (error) {
        console.error("Session verification failed:", error);
        res.status(200).json({ isLoggedIn: false });
    }
});
exports.getSession = getSession;
/**
 * Log out user by clearing session cookie
 */
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookieSettings = getCookieSettings();
        res.clearCookie("session", cookieSettings);
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout failed:", error);
        res.status(500).json({ message: "Logout failed" });
    }
});
exports.logoutUser = logoutUser;
