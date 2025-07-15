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
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../lib/jwt");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const requireAuth = (roles = []) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Try to get token from cookie or Authorization header
        const token = req.cookies["auth-token"] ||
            ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", ""));
        if (!token) {
            res.status(401).json({ message: "No token provided" });
            return;
        }
        const decoded = (0, jwt_1.verifyJWT)(token);
        // Attach user info to request
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            roles: decoded.roles || [],
        };
        // Role check
        if (roles.length > 0 && !req.user.roles.some((r) => roles.includes(r))) {
            res.status(403).json({ message: "Insufficient permissions" });
            return;
        }
        // Optional: Update last login
        yield prisma.user.update({
            where: { id: decoded.userId },
            data: { lastLogin: new Date() },
        });
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
});
exports.requireAuth = requireAuth;
