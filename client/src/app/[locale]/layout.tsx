// app/[locale]/layout.tsx
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Locale, routing } from "@/i18n/routing";
import { Titillium_Web } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/shadcn/components/theme-provider";
import StoreProvider from "@/app/redux";
import { AuthProvider } from "@/app/context/AuthContext";
import { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
	title: "griptech",
	description: "Din lokala grönsakshandel",
	icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
};

const titilliumWeb = Titillium_Web({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
	display: "swap",
});

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { locale: string };
}) {
	const { locale } = await Promise.resolve(params);

	// Validate locale
	if (!routing.locales.includes(locale as Locale)) notFound();

	// Fetch messages
	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={titilliumWeb.className}>
				<NextIntlClientProvider messages={messages}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						// disableTransitionOnChange
					>
						<Toaster expand={false} richColors closeButton />
						<StoreProvider>
							{/* Client-side auth context for React hooks */}
							<AuthProvider>
								{/* Server-side auth context for RSC */}
								<Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
							</AuthProvider>
						</StoreProvider>
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
