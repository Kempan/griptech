// client/src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const publicRoutes = ["/login", "/register", "/", "/products", "/contact"];

const intlMiddleware = createMiddleware({
	...routing,
	defaultLocale: "sv",
	localePrefix: "as-needed",
});

export default async function middleware(req: NextRequest) {
	const intlResponse = intlMiddleware(req);
	const path = req.nextUrl.pathname;

	const localeMatch = path.match(/^\/([a-z]{2})\//);
	const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

	const normalizedPath = localeMatch ? path.substring(locale.length + 1) : path;
	const isAdminRoute = normalizedPath.startsWith("/admin");
	const isPublicRoute = publicRoutes.some(
		(route) =>
			normalizedPath === route ||
			path === route ||
			path === `/${locale}${route}`
	);

	// Check if user has auth token (but don't try to decrypt it)
	const authToken = req.cookies.get("auth-token")?.value;
	const hasAuthToken = !!authToken;

	// For admin routes, check if user has token
	// The actual role validation happens server-side
	if (isAdminRoute && !hasAuthToken) {
		return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl));
	}

	// Redirect logged-in users away from login page
	if (path.includes("/login") && hasAuthToken) {
		// We can't check roles here, so redirect to home
		// The home page can then redirect admins to /admin if needed
		return NextResponse.redirect(new URL(`/${locale}/`, req.nextUrl));
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
