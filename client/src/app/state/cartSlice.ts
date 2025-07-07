import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
	productId: string;
	name: string;
	price: number;
	quantity: number;
	size: string;
	slug: string;
	cartItemId: string;
}

export interface CartState {
	items: CartItem[];
	totalAmount: number;
}

const initialState: CartState = {
	items: [],
	totalAmount: 0,
};

export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addToCart: (state, action: PayloadAction<CartItem>) => {
			// Use cartItemId if available, otherwise use a combination of productId and size
			const itemId =
				action.payload.cartItemId ||
				`${action.payload.productId}-${action.payload.size}`;

			const existingItem = state.items.find((item) => {
				// Check for cartItemId first if it exists
				if (item.cartItemId && action.payload.cartItemId) {
					return item.cartItemId === action.payload.cartItemId;
				}
				// Otherwise, check using a combination of productId and size
				return (
					item.productId === action.payload.productId &&
					item.size === action.payload.size
				);
			});

			if (existingItem) {
				existingItem.quantity += action.payload.quantity;
			} else {
				// Store the cartItemId if provided, or create one
				const newItem = {
					...action.payload,
					cartItemId: itemId,
				};
				state.items.push(newItem);
			}

			// Ensure totalAmount is always rounded to 2 decimal places
			state.totalAmount = parseFloat(
				(
					state.totalAmount +
					action.payload.price * action.payload.quantity
				).toFixed(2)
			);
		},

		removeFromCart: (state, action: PayloadAction<string>) => {
			// The payload might now be a cartItemId or a productId
			const itemIndex = state.items.findIndex((item) => {
				if (item.cartItemId) {
					return item.cartItemId === action.payload;
				}
				return item.productId === action.payload;
			});

			if (itemIndex > -1) {
				const item = state.items[itemIndex];
				state.totalAmount -= item.price * item.quantity;
				state.items.splice(itemIndex, 1);
			}
		},

		updateCartQuantity: (
			state,
			action: PayloadAction<{ productId: string; quantity: number }>
		) => {
			// The productId param might now be a cartItemId or a regular productId
			const item = state.items.find((item) => {
				if (item.cartItemId) {
					return item.cartItemId === action.payload.productId;
				}
				return item.productId === action.payload.productId;
			});

			if (item) {
				state.totalAmount = parseFloat(
					(
						state.totalAmount +
						item.price * (action.payload.quantity - item.quantity)
					).toFixed(2)
				); // Always round to 2 decimal places

				item.quantity = action.payload.quantity;
			}
		},

		clearCart: (state) => {
			state.items = [];
			state.totalAmount = 0;
		},
	},
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } =
	cartSlice.actions;
export default cartSlice.reducer;
