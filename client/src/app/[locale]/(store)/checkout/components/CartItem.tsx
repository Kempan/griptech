// client/src/app/[locale]/(store)/checkout/components/CartItem.tsx
import Image from "next/image";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/shadcn/lib/utils";

interface CartItemProps {
	item: {
		productId: string;
		cartItemId: string;
		name: string;
		price: number;
		slug: string;
		quantity: number;
		size: string;
		stockQuantity?: number; // Add this to know the stock limit
	};
	handleQuantityChange: (itemId: string, quantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, handleQuantityChange }) => {
	const t = useTranslations();
	const [quantity, setQuantity] = useState(item.quantity);

	// Use cartItemId if available, otherwise fallback to productId-size
	const itemId = item.cartItemId || `${item.productId}-${item.size}`;

	// Calculate max quantity based on stock
	const maxQuantity =
		item.stockQuantity && item.stockQuantity < 10 ? item.stockQuantity : 10;

	const handleQuantityInputChange = (value: string) => {
		const num = parseInt(value);
		if (!isNaN(num) && num >= 1 && num <= maxQuantity) {
			setQuantity(num);
			handleQuantityChange(itemId, num);
		}
	};

	const incrementQuantity = () => {
		if (quantity < maxQuantity) {
			const newQuantity = quantity + 1;
			setQuantity(newQuantity);
			handleQuantityChange(itemId, newQuantity);
		}
	};

	const decrementQuantity = () => {
		if (quantity > 1) {
			const newQuantity = quantity - 1;
			setQuantity(newQuantity);
			handleQuantityChange(itemId, newQuantity);
		}
	};

	return (
		<tr className="border-b dark:border-gray-700 px-4">
			<td className="px-4 py-3 pl-1 flex items-center gap-3">
				<Link
					href={{ pathname: "/product/[slug]", params: { slug: item.slug } }}
					passHref
					className="flex items-center gap-2"
				>
					<Image
						src="/images/grip3.jpg"
						alt={item.name}
						width={60}
						height={60}
						className="rounded-md"
					/>
					<span className="font-medium">{item.name}</span>
				</Link>
			</td>
			<td className="px-4 py-3 font-medium">${item.price}</td>
			<td className="px-4 py-3 font-medium">{item.size}</td>
			<td className="px-4 py-3 pr-1">
				<div className="flex items-center gap-1 justify-end">
					<Button
						size="icon"
						variant="outline"
						className="h-8 w-8"
						onClick={decrementQuantity}
						disabled={quantity <= 1}
					>
						<Minus className="h-3 w-3" />
					</Button>

					<Input
						type="number"
						min={1}
						max={maxQuantity}
						value={quantity}
						onChange={(e) => handleQuantityInputChange(e.target.value)}
						className="w-16 h-8 text-center"
					/>

					<Button
						size="icon"
						variant="outline"
						className="h-8 w-8"
						onClick={incrementQuantity}
						disabled={quantity >= maxQuantity}
					>
						<Plus className="h-3 w-3" />
					</Button>
				</div>
			</td>
		</tr>
	);
};

export default CartItem;
