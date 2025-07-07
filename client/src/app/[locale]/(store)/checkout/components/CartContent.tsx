// src/app/[locale]/(store)/checkout/components/CartContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/app/state/cartHooks";
import CartTable from "./CartTable";
import CartSummary from "./CartSummary";
import Header from "@/app/[locale]/(components)/Header/ClientHeader";
import EmptyCart from "./EmptyCart";
import { useTranslations } from "next-intl";
import CheckoutForm from "./CheckoutForm";
import { Loader2 } from "lucide-react";

export default function CartContent() {
	const { cart } = useCart();
	const t = useTranslations();
	const [isClient, setIsClient] = useState(false);
	const [isProcessingOrder, setIsProcessingOrder] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Show loading state while client-side hydration is happening
	if (!isClient) {
		return (
			<div className="animate-pulse h-40 w-full bg-gray-100 rounded-lg"></div>
		);
	}

	// Show loading overlay when processing order (even if cart is empty)
	if (isProcessingOrder) {
		return (
			<div className="min-h-[400px] flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-gray-800" />
					<p className="text-lg font-medium">{t("ProcessingYourOrder")}</p>
				</div>
			</div>
		);
	}

	// Show empty cart UI when no items and not processing
	if (cart.items.length === 0) {
		return <EmptyCart />;
	}

	// Show full cart content when items exist - full width, vertical layout
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-4 w-full">
				<Header translationKey="ShoppingCart" />
				<CartTable />
			</div>

			<div className="w-full mt-4">
				<CartSummary />
			</div>
			<div className="mt-4">
				<CheckoutForm onOrderComplete={() => setIsProcessingOrder(true)} />
			</div>
		</div>
	);
}
