// server/src/controllers/public/authController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { 
	signJWT, 
	verifyJWT, 
	getCookieSettings, 
	getClearCookieSettings,
	signRefreshToken, 
	verifyRefreshToken, 
	getRefreshCookieSettings,
	getClearRefreshCookieSettings
} from "../../lib/jwt";

const prisma = new PrismaClient();

export const loginUser = async (req: Request, res: Response): Promise<void> => {
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

		// Create JWT token and refresh token
		const token = signJWT({
			userId: user.id,
			email: user.email,
			roles: user.roles || [],
		});

		const refreshToken = signRefreshToken({
			userId: user.id,
			email: user.email,
			roles: user.roles || [],
		});

		// Set httpOnly cookies
		const cookieSettings = getCookieSettings();
		const refreshCookieSettings = getRefreshCookieSettings();
		
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
	} catch (error) {
		console.error("🔴 Login failed:", error);
		res.status(500).json({ message: "Login failed" });
	}
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
	console.log("🔵 Logout attempt");
	console.log("🔵 Request cookies:", req.cookies);
	
	try {
		const clearCookieSettings = getClearCookieSettings();
		const clearRefreshCookieSettings = getClearRefreshCookieSettings();
		
		console.log("🔵 Clear cookie settings:", clearCookieSettings);
		
		// Clear both cookies
		res.clearCookie("auth-token", clearCookieSettings);
		res.clearCookie("refresh-token", clearRefreshCookieSettings);
		
		console.log("🟢 Logout successful");
		res.status(200).json({ message: "Logout successful" });
	} catch (error) {
		console.error("🔴 Logout failed:", error);
		res.status(500).json({ message: "Logout failed" });
	}
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
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
			const decoded = verifyRefreshToken(refreshToken);
			console.log("🟢 Refresh token valid for user:", decoded.userId);

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
				console.log("🔴 User no longer exists:", decoded.userId);
				// User no longer exists
				const clearCookieSettings = getClearCookieSettings();
				const clearRefreshCookieSettings = getClearRefreshCookieSettings();
				res.clearCookie("auth-token", clearCookieSettings);
				res.clearCookie("refresh-token", clearRefreshCookieSettings);
				res.status(401).json({ message: "User not found" });
				return;
			}

			// Generate new tokens
			const newToken = signJWT({
				userId: user.id,
				email: user.email,
				roles: user.roles || [],
			});

			const newRefreshToken = signRefreshToken({
				userId: user.id,
				email: user.email,
				roles: user.roles || [],
			});

			// Set new cookies
			const cookieSettings = getCookieSettings();
			const refreshCookieSettings = getRefreshCookieSettings();
			
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
		} catch (jwtError) {
			console.log("🔴 Invalid or expired refresh token:", jwtError);
			// Invalid or expired refresh token
			const clearCookieSettings = getClearCookieSettings();
			const clearRefreshCookieSettings = getClearRefreshCookieSettings();
			res.clearCookie("auth-token", clearCookieSettings);
			res.clearCookie("refresh-token", clearRefreshCookieSettings);
			res.status(401).json({ message: "Invalid refresh token" });
		}
	} catch (error) {
		console.error("🔴 Token refresh failed:", error);
		res.status(500).json({ message: "Token refresh failed" });
	}
};

export const getSession = async (
	req: Request,
	res: Response
): Promise<void> => {
	console.log("🔵 Session check request");
	console.log("🔵 Request origin:", req.headers.origin);
	console.log("🔵 Request cookies:", req.cookies);
	console.log("🔵 Authorization header:", req.headers.authorization ? "Present" : "Not present");
	
	try {
		// Accept token from EITHER cookie OR Authorization header
		const token =
			req.cookies["auth-token"] ||
			req.headers.authorization?.replace("Bearer ", "");

		if (!token) {
			console.log("🔴 No token found in cookies or headers");
			res.status(200).json({ isLoggedIn: false });
			return;
		}

		console.log("🟢 Token found, length:", token.length);

		try {
			const decoded = verifyJWT(token);
			console.log("🟢 Access token valid for user:", decoded.userId);

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
				console.log("🔴 User no longer exists:", decoded.userId);
				// User no longer exists
				const clearCookieSettings = getClearCookieSettings();
				const clearRefreshCookieSettings = getClearRefreshCookieSettings();
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
		} catch (jwtError) {
			console.log("🔴 Access token expired or invalid:", jwtError);
			// Token is expired, try to refresh
			const refreshToken = req.cookies["refresh-token"];
			
			if (refreshToken) {
				console.log("🟡 Attempting token refresh");
				try {
					const decoded = verifyRefreshToken(refreshToken);
					console.log("🟢 Refresh token valid for user:", decoded.userId);
					
					// Get fresh user data
					const user = await prisma.user.findUnique({
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
						const newToken = signJWT({
							userId: user.id,
							email: user.email,
							roles: user.roles || [],
						});

						const newRefreshToken = signRefreshToken({
							userId: user.id,
							email: user.email,
							roles: user.roles || [],
						});

						// Set new cookies
						const cookieSettings = getCookieSettings();
						const refreshCookieSettings = getRefreshCookieSettings();
						
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
				} catch (refreshError) {
					console.log("🔴 Refresh token invalid during session check:", refreshError);
					// Refresh token is also invalid
				}
			} else {
				console.log("🔴 No refresh token available");
			}

			// Both tokens are invalid, clear cookies
			console.log("🔴 Clearing invalid cookies");
			const clearCookieSettings = getClearCookieSettings();
			const clearRefreshCookieSettings = getClearRefreshCookieSettings();
			res.clearCookie("auth-token", clearCookieSettings);
			res.clearCookie("refresh-token", clearRefreshCookieSettings);
			res.status(200).json({ isLoggedIn: false });
		}
	} catch (error) {
		console.error("🔴 Session verification failed:", error);
		res.status(200).json({ isLoggedIn: false });
	}
};
