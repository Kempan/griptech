// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../lib/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: number;
				email: string;
				roles: string[];
			};
		}
	}
}

export const requireAuth =
	(roles: string[] = []) =>
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			// Try to get token from cookie or Authorization header
			const token =
				req.cookies["auth-token"] ||
				req.headers.authorization?.replace("Bearer ", "");

			if (!token) {
				res.status(401).json({ message: "No token provided" });
				return;
			}

			const decoded = verifyJWT(token);

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
			await prisma.user.update({
				where: { id: decoded.userId },
				data: { lastLogin: new Date() },
			});

			next();
		} catch (error) {
			console.error("Auth middleware error:", error);
			res.status(401).json({ message: "Invalid or expired token" });
		}
	};
