import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
	locales: ["sv", "en"], // Supported locales
	defaultLocale: "sv", // Default is Swedish
	localePrefix: "as-needed",
	pathnames: {
		"/": "/",
		"/admin": "/admin",
		"/faq": "/faq",
		"/policy": "/policy",
		"/login": "/login",
		"/profile": {
			en: "/profile",
			sv: "/profil",
		},
		"/favorite-bundles": {
			en: "/favorite-bundles",
			sv: "/produktpaket",
		},
		"/favorites": {
			en: "/favorites",
			sv: "/favoriter",
		},
		"/products": {
			en: "/products",
			sv: "/produkter",
		},
		"/orders": {
			en: "/orders",
			sv: "/beställningar",
		},
		"/order/[id]": {
			en: "/order/[id]",
			sv: "/beställning/[id]",
		},
		"/terms": {
			en: "/terms",
			sv: "/villkor",
		},
		"/contact": {
			en: "/contact-us",
			sv: "/kontakta-oss",
		},
		"/product-category/[slug]": {
			en: "/product-category/[slug]",
			sv: "/produktkategori/[slug]",
		},
		"/product/[slug]": {
			en: "/product/[slug]",
			sv: "/produkt/[slug]",
		},
		"/checkout": {
			en: "/checkout",
			sv: "/kassa",
		},
		"/account": {
			en: "/account",
			sv: "/konto",
		},
	},
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
	createNavigation(routing);
