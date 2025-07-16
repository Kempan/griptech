// client/src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const publicRoutes = ["/login", "/register", "/", "/products", "/contact", "/test-auth", "/test-admin"];

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

	// Debug logging
	console.log(`🔵 Middleware: ${req.method} ${path}`);
	console.log(`🔵 Is admin route: ${isAdminRoute}`);
	console.log(`🔵 Has auth token: ${hasAuthToken}`);
	console.log(`🔵 Origin: ${req.headers.get('origin')}`);

	// For admin routes, check if user has token
	// The actual role validation happens server-side
	if (isAdminRoute && !hasAuthToken) {
		console.log(`🔴 Redirecting to login: ${path}`);
		return NextResponse.redirect(new URL(`/${locale}/login?returnUrl=${normalizedPath}`, req.nextUrl));
	}

	// Redirect logged-in users away from login/register pages
	if ((path.includes("/login") || path.includes("/register")) && hasAuthToken) {
		console.log(`🟢 Redirecting logged-in user from auth page: ${path}`);
		
		// Check if there's a returnUrl parameter
		const url = new URL(req.url);
		const returnUrl = url.searchParams.get('returnUrl');
		
		if (returnUrl && returnUrl.startsWith('/admin')) {
			// Redirect to the admin page they were trying to access
			console.log(`🟢 Redirecting to admin returnUrl: ${returnUrl}`);
			return NextResponse.redirect(new URL(`/${locale}${returnUrl}`, req.nextUrl));
		} else {
			// Default redirect to home page
			return NextResponse.redirect(new URL(`/${locale}/`, req.nextUrl));
		}
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
