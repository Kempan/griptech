import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../redux";
import {
	addToCart,
	removeFromCart,
	updateCartQuantity,
	clearCart,
} from "./cartSlice";
import { CartItem } from "./cartSlice";

export const useCart = () => {
	const dispatch = useAppDispatch();
	const cart = useAppSelector((state) => state.cart);

	const addItemToCart = (item: CartItem) => {
		dispatch(addToCart(item));
		const sizeInfo = item.size ? ` (${item.size})` : "";
		toast.success(`${item.name}${sizeInfo} added to cart!`);
	};

	const removeItemFromCart = (itemId: string) => {
		// Find item by cartItemId first, then fallback to productId
		const item = cart.items.find(
			(item) => item.cartItemId === itemId || item.productId === itemId
		);

		if (item) {
			dispatch(removeFromCart(item.cartItemId || item.productId));
			const sizeInfo = item.size ? ` (${item.size})` : "";
			toast.info(`${item.name}${sizeInfo} removed from cart!`);
		}
	};

	const updateItemQuantity = (itemId: string, quantity: number) => {
		// Find item by cartItemId first, then fallback to productId
		const item = cart.items.find(
			(item) => item.cartItemId === itemId || item.productId === itemId
		);

		if (item) {
			dispatch(
				updateCartQuantity({
					productId: item.cartItemId || item.productId,
					quantity,
				})
			);
			const sizeInfo = item.size ? ` (${item.size})` : "";
			toast.info(`${item.name}${sizeInfo} quantity updated to ${quantity}!`);
		}
	};

	const clearCartItems = () => {
		dispatch(clearCart());
		toast.info("Cart cleared!");
	};

	return {
		cart,
		addItemToCart,
		removeItemFromCart,
		updateItemQuantity,
		clearCartItems,
	};
};
