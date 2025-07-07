// client/src/app/actions/userActions.ts
"use server";

import { cookies } from "next/headers";

interface UpdateUserProfileData {
	name?: string;
	email?: string;
	phone?: string | null;
	shippingAddress?: any;
	billingAddress?: any;
	currentPassword?: string;
	newPassword?: string;
}

/**
 * Fetch the user's profile information
 */
export async function fetchUserProfile(): Promise<{
	success: boolean;
	message?: string;
	user?: {
		id: number;
		name?: string;
		email?: string;
		phone?: string;
		shippingAddress?: any;
		billingAddress?: any;
		createdAt?: string;
		updatedAt?: string;
	};
}> {
	try {
		// Get the session cookie from the request
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get("session")?.value;
		
		if (!sessionCookie) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Make a server-to-server request to get user profile
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session=${sessionCookie}`,
				},
				cache: "no-store",
			}
		);

		if (!response.ok) {
			console.warn("Failed to fetch user profile:", response);
			return {
				success: false,
				message: "Failed to fetch profile",
			};
		}

		const data = await response.json();
		return {
			success: true,
			user: data,
		};
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return {
			success: false,
			message: "Error fetching profile",
		};
	}
}

/**
 * Update the user's profile information
 */
export async function updateUserProfile(
	updateData: UpdateUserProfileData
): Promise<{
	success: boolean;
	message?: string;
	user?: any;
}> {
	try {
		// Get the session cookie from the request
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get("session")?.value;

		if (!sessionCookie) {
			return {
				success: false,
				message: "Not authenticated",
			};
		}

		// Make a server-to-server request to update user profile
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Cookie: `session=${sessionCookie}`,
				},
				body: JSON.stringify(updateData),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			return {
				success: false,
				message: errorData.message || "Failed to update profile",
			};
		}

		const data = await response.json();
		return {
			success: true,
			message: data.message || "Profile updated successfully",
			user: data.user,
		};
	} catch (error) {
		console.error("Error updating user profile:", error);
		return {
			success: false,
			message: "Error updating profile",
		};
	}
}
