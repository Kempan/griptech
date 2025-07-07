"use client";

import { ShoppingBasket } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useCart } from "@/app/state/cartHooks";

const CartCounterClient = () => {
	const { cart } = useCart();
	const [cartCount, setCartCount] = useState<number | null>(null);

	// ✅ Simplified: removed isClient state, using useEffect for hydration
	useEffect(() => {
		setCartCount(cart.items.reduce((count, item) => count + item.quantity, 0));
	}, [cart.items]);

	return (
		<>
			<Link href="/checkout">
				<ShoppingBasket
					className="cursor-pointer"
					strokeWidth={1.2}
					size={30}
				/>

				{/* Badge with fallback */}
				<span className="absolute -top-2 right-1.5 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
					{cartCount ?? "0"}
				</span>
			</Link>
		</>
	);
};

export default CartCounterClient;
