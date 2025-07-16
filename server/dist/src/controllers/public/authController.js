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
exports.getSession = exports.refreshToken = exports.logoutUser = exports.loginUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../../lib/jwt");
const prisma = new client_1.PrismaClient();
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔵 Login attempt for:", req.body.email);
    console.log("🔵 Request origin:", req.headers.origin);
    console.log("🔵 Request cookies:", req.cookies);
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
        // Create JWT token and refresh token
        const token = (0, jwt_1.signJWT)({
            userId: user.id,
            email: user.email,
            roles: user.roles || [],
        });
        const refreshToken = (0, jwt_1.signRefreshToken)({
            userId: user.id,
            email: user.email,
            roles: user.roles || [],
        });
        // Set httpOnly cookies
        const cookieSettings = (0, jwt_1.getCookieSettings)();
        const refreshCookieSettings = (0, jwt_1.getRefreshCookieSettings)();
        console.log("🔵 Cookie settings:", cookieSettings);
        console.log("🔵 Refresh cookie settings:", refreshCookieSettings);
        res.cookie("auth-token", token, cookieSettings);
        res.cookie("refresh-token", refreshToken, refreshCookieSettings);
        console.log("🟢 Login successful for:", user.email);
        console.log("🟢 Tokens generated - Access token length:", token.length);
        console.log("🟢 Tokens generated - Refresh token length:", refreshToken.length);
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
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔵 Logout attempt");
    console.log("🔵 Request cookies:", req.cookies);
    try {
        const clearCookieSettings = (0, jwt_1.getClearCookieSettings)();
        const clearRefreshCookieSettings = (0, jwt_1.getClearRefreshCookieSettings)();
        console.log("🔵 Clear cookie settings:", clearCookieSettings);
        // Clear both cookies
        res.clearCookie("auth-token", clearCookieSettings);
        res.clearCookie("refresh-token", clearRefreshCookieSettings);
        console.log("🟢 Logout successful");
        res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        console.error("🔴 Logout failed:", error);
        res.status(500).json({ message: "Logout failed" });
    }
});
exports.logoutUser = logoutUser;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔵 Token refresh attempt");
    console.log("🔵 Request cookies:", req.cookies);
    try {
        const refreshToken = req.cookies["refresh-token"];
        if (!refreshToken) {
            console.log("🔴 No refresh token provided");
            res.status(401).json({ message: "No refresh token provided" });
            return;
        }
        try {
            const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
            console.log("🟢 Refresh token valid for user:", decoded.userId);
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
                console.log("🔴 User no longer exists:", decoded.userId);
                // User no longer exists
                const clearCookieSettings = (0, jwt_1.getClearCookieSettings)();
                const clearRefreshCookieSettings = (0, jwt_1.getClearRefreshCookieSettings)();
                res.clearCookie("auth-token", clearCookieSettings);
                res.clearCookie("refresh-token", clearRefreshCookieSettings);
                res.status(401).json({ message: "User not found" });
                return;
            }
            // Generate new tokens
            const newToken = (0, jwt_1.signJWT)({
                userId: user.id,
                email: user.email,
                roles: user.roles || [],
            });
            const newRefreshToken = (0, jwt_1.signRefreshToken)({
                userId: user.id,
                email: user.email,
                roles: user.roles || [],
            });
            // Set new cookies
            const cookieSettings = (0, jwt_1.getCookieSettings)();
            const refreshCookieSettings = (0, jwt_1.getRefreshCookieSettings)();
            res.cookie("auth-token", newToken, cookieSettings);
            res.cookie("refresh-token", newRefreshToken, refreshCookieSettings);
            console.log("🟢 Token refresh successful for:", user.email);
            res.status(200).json({
                message: "Token refreshed successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roles: user.roles || [],
                },
            });
        }
        catch (jwtError) {
            console.log("🔴 Invalid or expired refresh token:", jwtError);
            // Invalid or expired refresh token
            const clearCookieSettings = (0, jwt_1.getClearCookieSettings)();
            const clearRefreshCookieSettings = (0, jwt_1.getClearRefreshCookieSettings)();
            res.clearCookie("auth-token", clearCookieSettings);
            res.clearCookie("refresh-token", clearRefreshCookieSettings);
            res.status(401).json({ message: "Invalid refresh token" });
        }
    }
    catch (error) {
        console.error("🔴 Token refresh failed:", error);
        res.status(500).json({ message: "Token refresh failed" });
    }
});
exports.refreshToken = refreshToken;
const getSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("🔵 Session check request");
    console.log("🔵 Request origin:", req.headers.origin);
    console.log("🔵 Request cookies:", req.cookies);
    console.log("🔵 Authorization header:", req.headers.authorization ? "Present" : "Not present");
    try {
        // Accept token from EITHER cookie OR Authorization header
        const token = req.cookies["auth-token"] ||
            ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", ""));
        if (!token) {
            console.log("🔴 No token found in cookies or headers");
            res.status(200).json({ isLoggedIn: false });
            return;
        }
        console.log("🟢 Token found, length:", token.length);
        try {
            const decoded = (0, jwt_1.verifyJWT)(token);
            console.log("🟢 Access token valid for user:", decoded.userId);
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
                console.log("🔴 User no longer exists:", decoded.userId);
                // User no longer exists
                const clearCookieSettings = (0, jwt_1.getClearCookieSettings)();
                const clearRefreshCookieSettings = (0, jwt_1.getClearRefreshCookieSettings)();
                res.clearCookie("auth-token", clearCookieSettings);
                res.clearCookie("refresh-token", clearRefreshCookieSettings);
                res.status(200).json({ isLoggedIn: false });
                return;
            }
            console.log("🟢 Session valid for user:", user.email);
            res.status(200).json({
                isLoggedIn: true,
                userId: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles || [],
            });
        }
        catch (jwtError) {
            console.log("🔴 Access token expired or invalid:", jwtError);
            // Token is expired, try to refresh
            const refreshToken = req.cookies["refresh-token"];
            if (refreshToken) {
                console.log("🟡 Attempting token refresh");
                try {
                    const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
                    console.log("🟢 Refresh token valid for user:", decoded.userId);
                    // Get fresh user data
                    const user = yield prisma.user.findUnique({
                        where: { id: decoded.userId },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            roles: true,
                        },
                    });
                    if (user) {
                        // Generate new tokens
                        const newToken = (0, jwt_1.signJWT)({
                            userId: user.id,
                            email: user.email,
                            roles: user.roles || [],
                        });
                        const newRefreshToken = (0, jwt_1.signRefreshToken)({
                            userId: user.id,
                            email: user.email,
                            roles: user.roles || [],
                        });
                        // Set new cookies
                        const cookieSettings = (0, jwt_1.getCookieSettings)();
                        const refreshCookieSettings = (0, jwt_1.getRefreshCookieSettings)();
                        res.cookie("auth-token", newToken, cookieSettings);
                        res.cookie("refresh-token", newRefreshToken, refreshCookieSettings);
                        console.log("🟢 Token refresh successful during session check for:", user.email);
                        res.status(200).json({
                            isLoggedIn: true,
                            userId: user.id,
                            name: user.name,
                            email: user.email,
                            roles: user.roles || [],
                        });
                        return;
                    }
                }
                catch (refreshError) {
                    console.log("🔴 Refresh token invalid during session check:", refreshError);
                    // Refresh token is also invalid
                }
            }
            else {
                console.log("🔴 No refresh token available");
            }
            // Both tokens are invalid, clear cookies
            console.log("🔴 Clearing invalid cookies");
            const clearCookieSettings = (0, jwt_1.getClearCookieSettings)();
            const clearRefreshCookieSettings = (0, jwt_1.getClearRefreshCookieSettings)();
            res.clearCookie("auth-token", clearCookieSettings);
            res.clearCookie("refresh-token", clearRefreshCookieSettings);
            res.status(200).json({ isLoggedIn: false });
        }
    }
    catch (error) {
        console.error("🔴 Session verification failed:", error);
        res.status(200).json({ isLoggedIn: false });
    }
});
exports.getSession = getSession;
