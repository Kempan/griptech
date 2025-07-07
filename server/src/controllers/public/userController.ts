// server/src/controllers/public/userController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/**
 * Get all users (public view with limited fields)
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				// Only return non-sensitive information
			},
		});
		res.json(users);
	} catch (error) {
		console.error("Error retrieving users:", error);
		res.status(500).json({ message: "Error retrieving users" });
	}
};

/**
 * Get profile for the currently authenticated user
 */
export const getUserProfile = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Get user ID from the authenticated request
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const user = await prisma.user.findUnique({
			where: {
				id: Number(userId),
			},
			select: {
				id: true,
				name: true,
				email: true,
				roles: true,
				phone: true,
				shippingAddress: true,
				billingAddress: true,
				lastLogin: true,
				createdAt: true,
				updatedAt: true,
				// Exclude password
			},
		});

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		res.json(user);
	} catch (error) {
		console.error("Error fetching user profile:", error);
		res.status(500).json({ message: "Error fetching user profile" });
	}
};

/**
 * Update profile for the currently authenticated user
 */
export const updateUserProfile = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Get user ID from the authenticated request
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const {
			name,
			email,
			phone,
			shippingAddress,
			billingAddress,
			currentPassword,
			newPassword,
		} = req.body;

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: {
				id: Number(userId),
			},
		});

		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}

		// If email is being updated, check if it's already in use
		if (email && email !== user.email) {
			const existingUser = await prisma.user.findUnique({
				where: {
					email,
				},
			});

			if (existingUser) {
				res.status(400).json({ message: "Email already in use" });
				return;
			}
		}

		// Prepare the data object for the update
		const updateData: any = {
			...(name !== undefined && { name }),
			...(email !== undefined && { email }),
			...(phone !== undefined && { phone }),
			...(shippingAddress !== undefined && { shippingAddress }),
			...(billingAddress !== undefined && { billingAddress }),
		};

		// If password is being changed, verify current password first
		if (newPassword) {
			if (!currentPassword) {
				res
					.status(400)
					.json({
						message: "Current password is required to set a new password",
					});
				return;
			}

			// Verify current password
			if (!user.password) {
				res.status(400).json({ message: "Cannot update password" });
				return;
			}

			const passwordMatches = await bcrypt.compare(
				currentPassword,
				user.password
			);
			if (!passwordMatches) {
				res.status(400).json({ message: "Current password is incorrect" });
				return;
			}

			// Hash the new password
			const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
			updateData.password = hashedPassword;
		}

		// Update the user
		const updatedUser = await prisma.user.update({
			where: {
				id: Number(userId),
			},
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				shippingAddress: true,
				billingAddress: true,
				createdAt: true,
				updatedAt: true,
				// Exclude password and sensitive data
			},
		});

		res.json({
			message: "Profile updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user profile:", error);
		res.status(500).json({ message: "Error updating user profile" });
	}
};

/**
 * Update addresses for the currently authenticated user
 */
export const updateUserAddresses = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		// Get user ID from the authenticated request
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const { shippingAddress, billingAddress, useSameAddress } = req.body;

		// Validate shipping address
		if (
			!shippingAddress ||
			!shippingAddress.firstName ||
			!shippingAddress.lastName ||
			!shippingAddress.address1 ||
			!shippingAddress.city ||
			!shippingAddress.postalCode ||
			!shippingAddress.country
		) {
			res.status(400).json({ message: "Shipping address is incomplete" });
			return;
		}

		// If billing address is not the same as shipping, validate it
		if (!useSameAddress && billingAddress) {
			if (
				!billingAddress.firstName ||
				!billingAddress.lastName ||
				!billingAddress.address1 ||
				!billingAddress.city ||
				!billingAddress.postalCode ||
				!billingAddress.country
			) {
				res.status(400).json({ message: "Billing address is incomplete" });
				return;
			}
		}

		// Update user addresses
		const updatedUser = await prisma.user.update({
			where: {
				id: Number(userId),
			},
			data: {
				shippingAddress,
				billingAddress: useSameAddress ? null : billingAddress,
			},
			select: {
				id: true,
				name: true,
				email: true,
				shippingAddress: true,
				billingAddress: true,
			},
		});

		res.json({
			message: "Addresses updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user addresses:", error);
		res.status(500).json({ message: "Error updating user addresses" });
	}
};
