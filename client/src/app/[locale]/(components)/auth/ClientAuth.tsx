"use client";
// app/[locale]/components/auth/ClientAuth.tsx
import { ReactNode } from "react";
import { useAuth } from "@/app/context/AuthContext";

// Base component for client-side auth checks
export function ClientAuth({
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
	// Use the existing client-side auth context
	const { isLoggedIn, roles = [] } = useAuth();

	// Check roles if needed
	const hasRequiredRoles =
		requireRoles.length === 0 ||
		requireRoles.some((role) => roles.includes(role));

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
export function ClientAuthOnly({
	children,
	fallback,
	requireRoles = [],
}: {
	children: ReactNode;
	fallback?: ReactNode;
	requireRoles?: string[];
}) {
	return (
		<ClientAuth
			requireAuth={true}
			fallback={fallback}
			requireRoles={requireRoles}
		>
			{children}
		</ClientAuth>
	);
}

// Only renders content for admin users
export function ClientAdminOnly({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<ClientAuth requireAuth={true} fallback={fallback} requireRoles={["admin"]}>
			{children}
		</ClientAuth>
	);
}

// Only renders content for non-authenticated users
export function ClientGuestOnly({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<ClientAuth requireAuth={false} fallback={fallback}>
			{children}
		</ClientAuth>
	);
}
