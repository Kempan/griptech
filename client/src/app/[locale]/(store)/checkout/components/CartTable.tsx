// src/app/[locale]/(store)/checkout/components/CartTable.tsx
"use client";

import CartItem from "./CartItem";
import { useCart } from "@/app/state/cartHooks";
import { useTranslations } from "next-intl";

const CartTable = () => {
	const { cart, updateItemQuantity } = useCart();
	const t = useTranslations();

	const handleQuantityChange = (itemId: string, quantity: number) => {
		if (quantity < 1) return;
		updateItemQuantity(itemId, quantity);
	};

	return (
		<table className="w-full border rounded-lg overflow-hidden">
			<thead className="bg-gray-100 dark:bg-gray-800">
				<tr className="border-b dark:border-gray-700">
					<th className="px-4 py-3 text-left">{t("Product")}</th>
					<th className="px-4 py-3 text-left">{t("Price")}</th>
					<th className="px-4 py-3 text-left">{t("Size")}</th>
					<th className="px-4 py-3 text-right">{t("Quantity")}</th>
				</tr>
			</thead>
			<tbody>
				{cart.items.map((item) => (
					<CartItem
						key={item.cartItemId || `${item.productId}-${item.size}`}
						item={item}
						handleQuantityChange={handleQuantityChange}
					/>
				))}
			</tbody>
		</table>
	);
};

export default CartTable;
