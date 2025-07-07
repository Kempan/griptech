// client/src/app/[locale]/(store)/product/components/ProductDetailsClient.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { ShoppingBag, Heart, CheckCircle, Minus, Plus } from "lucide-react";
import SizePicker from "@/app/[locale]/(components)/RadioButtons/SizePicker";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { useTranslations } from "next-intl";
import ClientHeader from "@/app/[locale]/(components)/Header/ClientHeader";
import { useCart } from "@/app/state/cartHooks";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { toggleFavorite, checkFavorites } from "@/app/actions/favoriteActions";
import { cn } from "@/shadcn/lib/utils";
import { useRouter } from "next/navigation";

interface ProductDetailsClientProps {
	id: string;
	name: string;
	price: number;
	currency?: string;
	slug: string;
	sizes?: string[];
	stockQuantity?: number;
}

const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({
	id,
	name,
	price,
	currency = "SEK",
	slug,
	sizes: propSizes,
	stockQuantity,
}) => {
	const t = useTranslations();
	const router = useRouter();
	const { addItemToCart } = useCart();
	const [isPending, startTransition] = useTransition();
	const [quantity, setQuantity] = useState<number>(1);
	const sizes = propSizes ?? ["30x40", "50x70", "100x150"];

	const [selectedSize, setSelectedSize] = useState<string>(sizes[0]);
	const [addedToCart, setAddedToCart] = useState(false);
	const [isFavorited, setIsFavorited] = useState(false);
	const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

	// Check if product is favorited on mount
	useEffect(() => {
		const checkFavoriteStatus = async () => {
			const numericId = parseInt(id, 10);
			const favoriteStatus = await checkFavorites([numericId]);
			setIsFavorited(favoriteStatus[numericId] || false);
		};

		checkFavoriteStatus();
	}, [id]);

	// Determine if product is out of stock
	const isOutOfStock = stockQuantity !== undefined && stockQuantity <= 0;

	// Calculate max quantity based on stock
	const maxQuantity = stockQuantity && stockQuantity < 10 ? stockQuantity : 10;

	const handleQuantityChange = (value: string) => {
		const num = parseInt(value);
		if (!isNaN(num) && num >= 1 && num <= maxQuantity) {
			setQuantity(num);
		}
	};

	const incrementQuantity = () => {
		if (quantity < maxQuantity) {
			setQuantity((q) => q + 1);
		}
	};

	const decrementQuantity = () => {
		if (quantity > 1) {
			setQuantity((q) => q - 1);
		}
	};

	// Handle add to cart with animation
	const handleAddToCart = () => {
		// Create a unique cart item ID for the product+size combination
		const cartItemId = `${id}-${selectedSize}`;

		// Create the cart item
		const cartItem = {
			productId: id,
			cartItemId,
			name,
			price,
			quantity,
			size: selectedSize,
			slug,
		};

		// Use the cart hook to add the item
		addItemToCart(cartItem);

		// Show success animation
		setAddedToCart(true);

		// Reset button after animation
		setTimeout(() => {
			setAddedToCart(false);
			setQuantity(1); // Reset quantity after adding
		}, 2000);
	};

	// Handle favorite toggle
	const handleToggleFavorite = async () => {
		setIsLoadingFavorite(true);

		startTransition(async () => {
			const result = await toggleFavorite(id);

			if (result.success) {
				setIsFavorited(result.isFavorited);
			} else if (result.message === "Not authenticated") {
				// Redirect to login with return URL
				router.push(`/login?returnUrl=/product/${slug}`);
			}

			setIsLoadingFavorite(false);
		});
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Price display with formatting */}
			<div className="text-xl font-semibold">
				{formatCurrency(price, currency)}
			</div>

			{/* Size Picker with more visual prominence */}
			<div className="bg-gray-50 rounded-lg">
				<ClientHeader translationKey="SelectSize" className="mb-3" as="h4" />
				<SizePicker
					sizes={sizes}
					defaultValue={selectedSize}
					onChange={(size) => setSelectedSize(size)}
				/>
			</div>

			{/* Quantity Controls */}
			<div className="flex flex-col gap-2">
				<ClientHeader translationKey="Quantity" className="mb-1" as="h4" />
				<div className="flex items-center gap-2 w-fit">
					<Button
						size="icon"
						variant="outline"
						className="h-10 w-10"
						onClick={decrementQuantity}
						disabled={quantity <= 1 || isOutOfStock}
					>
						<Minus className="h-4 w-4" />
					</Button>

					<Input
						type="number"
						min={1}
						max={maxQuantity}
						value={quantity}
						onChange={(e) => handleQuantityChange(e.target.value)}
						className="w-20 h-10 text-center"
						disabled={isOutOfStock}
					/>

					<Button
						size="icon"
						variant="outline"
						className="h-10 w-10"
						onClick={incrementQuantity}
						disabled={quantity >= maxQuantity || isOutOfStock}
					>
						<Plus className="h-4 w-4" />
					</Button>

					{stockQuantity && stockQuantity <= 5 && stockQuantity > 0 && (
						<span className="text-sm text-orange-600 ml-2">
							{t("OnlyXLeft", { count: stockQuantity })}
						</span>
					)}
				</div>
			</div>

			{/* Call-to-action Buttons */}
			<div className="flex flex-col gap-3 sm:flex-row mt-2">
				<Button
					className={cn(
						"h-12 w-full text-base font-medium transition-all duration-300",
						addedToCart
							? "bg-gray-800 hover:bg-gray-900"
							: "bg-primary hover:bg-primary/90",
						isOutOfStock && "opacity-50 cursor-not-allowed"
					)}
					onClick={handleAddToCart}
					disabled={isOutOfStock || addedToCart}
				>
					{addedToCart ? (
						<>
							<CheckCircle className="w-5 h-5 mr-2" />
							{t("AddedToCart")}
						</>
					) : (
						<>
							<ShoppingBag className="w-5 h-5 mr-2" />
							{isOutOfStock ? t("OutOfStock") : t("AddToCart")}
						</>
					)}
				</Button>

				<Button
					variant="outline"
					className={cn(
						"h-12 text-base transition-all duration-200 sm:w-auto w-full",
						isFavorited && "border-red-500 bg-red-50 hover:bg-red-100"
					)}
					onClick={handleToggleFavorite}
					disabled={isLoadingFavorite || isPending}
				>
					<Heart
						className={cn(
							"w-5 h-5 mr-2 transition-all duration-200",
							isFavorited ? "fill-red-500 text-red-500" : "",
							isLoadingFavorite && "animate-pulse"
						)}
					/>
					{isFavorited ? t("RemoveFromWishlist") : t("AddToWishlist")}
				</Button>
			</div>
		</div>
	);
};

export default ProductDetailsClient;
