// app/[locale]/(store)/product/components/ProductDetailsAuth.tsx
import { Suspense } from "react";
import {
	AuthOnly,
	GuestOnly,
} from "@/app/[locale]/(components)/auth/ServerAuth";
import ProductDetailsClient from "./ProductDetailsClient";
import { Button } from "@/shadcn/components/ui/button";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface ProductDetailsAuthProps {
	product: {
		id: string;
		name: string;
		price: number;
		currency?: string;
		slug: string;
		sizes?: string[];
		stockQuantity?: number;
		enableStockManagement?: boolean;
	};
}

export default async function ProductDetailsAuth({
	product,
}: ProductDetailsAuthProps) {
	const t = await getTranslations();

	return (
		<>
			{/* Show product details for authenticated users */}
			<AuthOnly>
				<Suspense
					fallback={
						<div className="h-32 animate-pulse bg-gray-100 rounded-lg" />
					}
				>
					<ProductDetailsClient
						id={product.id}
						name={product.name}
						price={product.price}
						currency={product.currency}
						slug={product.slug}
						sizes={product.sizes}
						stockQuantity={product.stockQuantity}
						enableStockManagement={product.enableStockManagement}
					/>
				</Suspense>
			</AuthOnly>

			{/* Show login prompt for guests */}
			<GuestOnly>
				<div className="bg-gray-50 rounded-lg flex flex-col gap-3">
					<p className="text-orange-500 font-bold">
						{t("LoginToViewPrices")}
					</p>
					<Link
						href={`/login?returnUrl=/product/${product.slug}`}
						className="self-start"
					>
						<Button variant="default">{t("Login")}</Button>
					</Link>
				</div>
			</GuestOnly>
		</>
	);
}
