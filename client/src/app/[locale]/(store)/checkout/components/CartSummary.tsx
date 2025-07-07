// src/app/[locale]/(store)/checkout/components/CartSummary.tsx
"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/shadcn/components/ui/card";
import { Separator } from "@/shadcn/components/ui/separator";
import { Button } from "@/shadcn/components/ui/button";
import { useCart } from "@/app/state/cartHooks";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";

// Simplified version that always hides the pay button
const CartSummary = () => {
	const { cart, clearCartItems } = useCart();
	const t = useTranslations();
	const [isClient, setIsClient] = useState(false);

	// Ensure the component only renders after hydration
	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) return <p>Loading cart summary...</p>; // Prevents hydration errors

	// Hide summary if cart is empty
	if (cart.items.length === 0) {
		return null;
	}

	const handleClearCart = () => {
		toast(t("ClearConfirm"), {
			duration: Infinity,
			position: "top-center",
			action: {
				label: t("ClearCart"),
				onClick: () => clearCartItems(),
			},
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">{t("OrderSummary")}</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4">
				<div className="flex items-center justify-between">
					<span>{t("SubTotal")}</span>
					<span className="font-medium">
						{formatCurrency(cart.totalAmount)}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span>{t("Shipping")}</span>
					<span className="font-medium">{formatCurrency(0)}</span>
				</div>
				<Separator />
				<div className="flex items-center justify-between font-medium text-lg">
					<span>{t("Total")}</span>
					<span>{formatCurrency(cart.totalAmount)}</span>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					variant="error"
					size="lg"
					onClick={handleClearCart}
				>
					{t("ClearCart")}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default CartSummary;
