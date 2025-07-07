import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "../../lib/session";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

/**
 * Handle user login
 * Validates credentials and creates a session
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;

		// Validate inputs
		if (!email || !password) {
			res.status(400).json({ message: "Email and password are required" });
			return;
		}

		// Find user by email
		const user = await prisma.user.findUnique({
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
		const passwordMatches = await bcrypt.compare(password, user.password);

		if (!passwordMatches) {
			res.status(401).json({ message: "Invalid email or password" });
			return;
		}

		// Create session token with user id and roles
		const session = await encrypt({
			userId: user.id.toString(),
			roles: user.roles || [],
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});

		// Set HTTP-only session cookie
		res.cookie("session", session, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

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
	} catch (error) {
		console.error("Login failed:", error);
		res.status(500).json({ message: "Login failed" });
	}
};

/**
 * Get current session information
 */
export const getSession = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const sessionCookie = req.cookies.session;

		if (!sessionCookie) {
			res.status(200).json({ isLoggedIn: false });
			return;
		}

		const session = await decrypt(sessionCookie);

		if (!session || !session.userId) {
			res.status(200).json({ isLoggedIn: false });
			return;
		}

		// Check if session is expired
		if (session.expiresAt && typeof session.expiresAt === 'string' && new Date(session.expiresAt) < new Date()) {
			res.clearCookie("session");
			res.status(200).json({ isLoggedIn: false });
			return;
		}

		// Get updated user information from database
		const user = await prisma.user.findUnique({
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
			res.clearCookie("session");
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
	} catch (error) {
		console.error("Session verification failed:", error);
		res.status(200).json({ isLoggedIn: false });
	}
};

/**
 * Log out user by clearing session cookie
 */
export const logoutUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		res.clearCookie("session", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
		});
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Logout failed:", error);
		res.status(500).json({ message: "Logout failed" });
	}
};