// src/app/[locale]/(store)/checkout/components/EmptyCart.tsx
"use client";

import { Button } from "@/shadcn/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function EmptyCart() {
	const t = useTranslations();

	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="rounded-full bg-gray-100 p-6 mb-4">
				<svg
					className="w-12 h-12 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
			</div>
			<h3 className="text-xl font-medium mb-2">{t("CartEmpty")}</h3>
			<p className="text-gray-500 mb-6 max-w-md">{t("YourCartIsEmpty")}</p>
			<Link href="/" passHref>
				<Button size="lg">{t("ContinueShopping")}</Button>
			</Link>
		</div>
	);
}
