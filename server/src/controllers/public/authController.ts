// server/src/controllers/public/authController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { signJWT, verifyJWT, getCookieSettings } from "../../lib/jwt";

const prisma = new PrismaClient();

export const loginUser = async (req: Request, res: Response): Promise<void> => {
	console.log("🔵 Login attempt for:", req.body.email);

	try {
		const { email, password } = req.body;

		if (!email || !password) {
			console.log("🔴 Missing email or password");
			res.status(400).json({ message: "Email and password are required" });
			return;
		}

		const user = await prisma.user.findUnique({ where: { email } });

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

		const passwordMatches = await bcrypt.compare(password, user.password);

		if (!passwordMatches) {
			console.log("🔴 Password mismatch for:", email);
			res.status(401).json({ message: "Invalid email or password" });
			return;
		}

		// Create JWT token
		const token = signJWT({
			userId: user.id,
			email: user.email,
			roles: user.roles || [],
		});

		// Set httpOnly cookie
		const cookieSettings = getCookieSettings();
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
	} catch (error) {
		console.error("🔴 Login failed:", error);
		res.status(500).json({ message: "Login failed" });
	}
};

export const getSession = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Accept token from EITHER cookie OR Authorization header
		const token =
			req.cookies["auth-token"] ||
			req.headers.authorization?.replace("Bearer ", "");

		if (!token) {
			res.status(200).json({ isLoggedIn: false });
			return;
		}

		try {
			const decoded = verifyJWT(token);

			// Get fresh user data from database
			const user = await prisma.user.findUnique({
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
				const cookieSettings = getCookieSettings();
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
		} catch (jwtError) {
			// Invalid or expired token
			const cookieSettings = getCookieSettings();
			res.clearCookie("auth-token", cookieSettings);
			res.status(200).json({ isLoggedIn: false });
		}
	} catch (error) {
		console.error("Session verification failed:", error);
		res.status(200).json({ isLoggedIn: false });
	}
};

export const logoutUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const cookieSettings = getCookieSettings();
		res.clearCookie("auth-token", cookieSettings);
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Logout failed:", error);
		res.status(500).json({ message: "Logout failed" });
	}
};
