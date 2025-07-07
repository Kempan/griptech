// app/lib/auth-utils.ts
import { getAuthStatus } from "@/app/actions/authActions";
import { cache } from "react";

// Type definition for auth context
export type AuthContextData = {
	isLoggedIn: boolean;
	user: {
		id: string;
		name: string;
		email: string;
		roles: string[];
	} | null;
};

// Use React's cache to deduplicate requests within a render cycle
export const getAuthContext = cache(async (): Promise<AuthContextData> => {
	// Fetch auth status
	const authStatus = await getAuthStatus();

	// Convert to the format we want to use
	return {
		isLoggedIn: authStatus.isLoggedIn,
		user: authStatus.isLoggedIn
			? {
					id: authStatus.userId?.toString() || "",
					name: authStatus.name || "",
					email: authStatus.email || "",
					roles: authStatus.roles || [],
			  }
			: null,
	};
});

// Helper function to check roles
export function hasRole(
	roles: string[] | undefined,
	requiredRole: string
): boolean {
	return !!roles && roles.includes(requiredRole);
}

// Helper function to check any of multiple roles
export function hasAnyRole(
	roles: string[] | undefined,
	requiredRoles: string[]
): boolean {
	return !!roles && requiredRoles.some((role) => roles.includes(role));
}
