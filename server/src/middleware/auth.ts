// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { decrypt } from "../lib/session"; // Same decrypt used in client
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add typings for session to Express
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: number;
				roles: string[];
				expiresAt?: string; // ISO timestamp
			};
		}
	}
}

// Utility: Check session validity and attach to req.user
export const requireAuth =
	(roles: string[] = []) =>
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const cookie = req.cookies.session;

			if (!cookie) {
				res.status(401).json({ message: "Not authenticated" });
				return;
			}

			const session = await decrypt(cookie);

			if (!session?.userId) {
				res.status(401).json({ message: "Invalid session" });
				return;
			}

			if (
				session.expiresAt &&
				typeof session.expiresAt === 'string' &&
				new Date(session.expiresAt).getTime() < Date.now()
			) {
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
			await prisma.user.update({
				where: { id: Number(session.userId) },
				data: { lastLogin: new Date() },
			});

			next();
		} catch (err) {
			console.error("Auth middleware error:", err);
			res.status(401).json({ message: "Authentication failed" });
		}
	};
