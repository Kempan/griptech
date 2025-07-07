import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { cookies } from "next/headers";
import { decrypt } from "./app/lib/session";
import { routing } from "@/i18n/routing";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/", "/products", "/contact"];

// Interface for session data - define this in a shared location
interface SessionData {
	userId?: string;
	roles?: string[];
	expiresAt?: Date;
}

// Initialize next-intl middleware
const intlMiddleware = createMiddleware({
	...routing,
	defaultLocale: "sv",
	localePrefix: "as-needed",
});

export default async function middleware(req: NextRequest) {
	const intlResponse = intlMiddleware(req);
	const path = req.nextUrl.pathname;

	// Extract current locale
	const localeMatch = path.match(/^\/([a-z]{2})\//);
	const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

	// Normalize paths for checking
	const normalizedPath = localeMatch ? path.substring(locale.length + 1) : path;
	const isAdminRoute = normalizedPath.startsWith("/admin");
	const isPublicRoute = publicRoutes.some(
		(route) =>
			normalizedPath === route ||
			path === route ||
			path === `/${locale}${route}`
	);

	// Authentication check
	let session: SessionData | null = null;
	try {
		const cookie = (await cookies()).get("session")?.value;
		if (cookie) {
			session = (await decrypt(cookie)) as SessionData;

			// Check if session is expired
			if (session?.expiresAt && new Date(session.expiresAt) < new Date()) {
				session = null;
			}
		}
	} catch (error) {
		console.error("Session validation error:", error);
		session = null;
	}

	const isAuthenticated = !!session?.userId;
	const isAdmin = session?.roles?.includes("admin") ?? false;

	// Handle various routing scenarios
	if (isAdminRoute) {
		// Admin routes require authentication and admin role
		if (!isAuthenticated) {
			return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl));
		}

		if (!isAdmin) {
			// Redirect non-admin users away from admin pages
			return NextResponse.redirect(new URL(`/${locale}/`, req.nextUrl));
		}
	} else if (isPublicRoute && path.includes("/login") && isAuthenticated) {
		// Redirect authenticated users away from login page
		const redirectPath = isAdmin ? "/admin" : "/";
		return NextResponse.redirect(
			new URL(`/${locale}${redirectPath}`, req.nextUrl)
		);
	}

	return intlResponse;
}

export const config = {
	matcher: [
		"/((?!api|_next|.*\\..*).*)",
		"/admin/:path*",
		"/:locale/admin/:path*",
	],
};
