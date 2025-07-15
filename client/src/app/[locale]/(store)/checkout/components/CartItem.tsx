// client/src/app/[locale]/(store)/checkout/components/CartItem.tsx
import Image from "next/image";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { cn } from "@/shadcn/lib/utils";
import { getMaxQuantity } from "@/app/lib/utils/stock-utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shadcn/components/ui/alert-dialog";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";

interface CartItemProps {
	item: {
		productId: string;
		cartItemId: string;
		name: string;
		price: number;
		slug: string;
		quantity: number;
		size: string;
		stockQuantity?: number;
		enableStockManagement?: boolean;
	};
	handleQuantityChange: (itemId: string, quantity: number) => void;
	onRemove?: (itemId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, handleQuantityChange, onRemove }) => {
	const t = useTranslations();
	const [quantity, setQuantity] = useState(item.quantity);
	const [showRemoveDialog, setShowRemoveDialog] = useState(false);

	// Use cartItemId if available, otherwise fallback to productId-size
	const itemId = item.cartItemId || `${item.productId}-${item.size}`;

	// Create a product object for stock utilities
	const productForStock = {
		id: parseInt(item.productId),
		stockQuantity: item.stockQuantity || 0,
		enableStockManagement: item.enableStockManagement || false,
	} as any;

	// Calculate max quantity based on stock management
	const maxQuantity = getMaxQuantity(productForStock, 10);

	const handleQuantityInputChange = (value: string) => {
		const num = parseInt(value);
		if (!isNaN(num)) {
			if (num >= 1 && num <= maxQuantity) {
				setQuantity(num);
				handleQuantityChange(itemId, num);
			} else if (num < 1) {
				// Show confirmation dialog for removal
				setShowRemoveDialog(true);
			}
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
		} else if (quantity === 1) {
			// Show confirmation dialog for removal
			setShowRemoveDialog(true);
		}
	};

	const handleRemoveConfirm = () => {
		if (onRemove) {
			onRemove(itemId);
		}
		setShowRemoveDialog(false);
	};

	return (
		<>
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
				<td className="px-4 py-3 font-medium">{formatCurrency(item.price)}</td>
				<td className="px-4 py-3 font-medium">{item.size}</td>
				<td className="px-4 py-3 pr-1">
					<div className="flex items-center gap-1 justify-end">
						<Button
							size="icon"
							variant="outline"
							className="h-8 w-8"
							onClick={decrementQuantity}
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

			{/* Remove Confirmation Dialog */}
			<AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("RemoveFromCart")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("AreYouSureRemoveFromCart")} &quot;{item.name}&quot;?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRemoveConfirm}
							className="bg-red-600 hover:bg-red-700"
						>
							{t("Remove")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default CartItem;
