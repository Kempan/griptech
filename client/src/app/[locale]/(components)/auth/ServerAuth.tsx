// app/[locale]/components/auth/ServerAuth.tsx
import { ReactNode } from "react";
import { getAuthContext, hasAnyRole } from "@/app/lib/utils/auth-utils";

// Base component for server-side auth checks
export async function ServerAuth({
	children,
	fallback,
	requireAuth,
	requireRoles = [],
}: {
	children: ReactNode;
	fallback?: ReactNode;
	requireAuth: boolean;
	requireRoles?: string[];
}) {
	// Fetch auth data
	const auth = await getAuthContext();
	const isLoggedIn = auth.isLoggedIn;

	// Check roles if needed
	const hasRequiredRoles =
		requireRoles.length === 0 ||
		(auth.user?.roles && hasAnyRole(auth.user.roles, requireRoles));

	// Show children if requirements are met
	if (
		(requireAuth && isLoggedIn && hasRequiredRoles) ||
		(!requireAuth && !isLoggedIn)
	) {
		return <>{children}</>;
	}

	// Otherwise show fallback
	return <>{fallback}</>;
}

// Only renders content for authenticated users
export async function AuthOnly({
	children,
	fallback,
	requireRoles = [],
}: {
	children: ReactNode;
	fallback?: ReactNode;
	requireRoles?: string[];
}) {
	return (
		<ServerAuth
			requireAuth={true}
			fallback={fallback}
			requireRoles={requireRoles}
		>
			{children}
		</ServerAuth>
	);
}

// Only renders content for admin users
export async function AdminOnly({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<ServerAuth requireAuth={true} fallback={fallback} requireRoles={["admin"]}>
			{children}
		</ServerAuth>
	);
}

// Only renders content for non-authenticated users
export async function GuestOnly({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<ServerAuth requireAuth={false} fallback={fallback}>
			{children}
		</ServerAuth>
	);
}
