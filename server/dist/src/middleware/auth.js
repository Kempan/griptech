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
const session_1 = require("../lib/session"); // Same decrypt used in client
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Utility: Check session validity and attach to req.user
const requireAuth = (roles = []) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies.session;
        if (!cookie) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }
        const session = yield (0, session_1.decrypt)(cookie);
        if (!(session === null || session === void 0 ? void 0 : session.userId)) {
            res.status(401).json({ message: "Invalid session" });
            return;
        }
        if (session.expiresAt &&
            typeof session.expiresAt === 'string' &&
            new Date(session.expiresAt).getTime() < Date.now()) {
            res.status(401).json({ message: "Session expired" });
            return;
        }
        // Attach user info to request
        req.user = {
            id: Number(session.userId),
            roles: Array.isArray(session.roles) ? session.roles : ["customer"],
            expiresAt: typeof session.expiresAt === 'string' ? session.expiresAt : undefined,
        };
        // Role check
        if (roles.length > 0 && req.user && !req.user.roles.some((r) => roles.includes(r))) {
            res
                .status(403)
                .json({ message: "Forbidden - insufficient role" });
            return;
        }
        // Optional: Update last login
        yield prisma.user.update({
            where: { id: Number(session.userId) },
            data: { lastLogin: new Date() },
        });
        next();
    }
    catch (err) {
        console.error("Auth middleware error:", err);
        res.status(401).json({ message: "Authentication failed" });
    }
});
exports.requireAuth = requireAuth;
