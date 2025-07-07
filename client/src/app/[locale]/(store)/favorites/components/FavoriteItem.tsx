// client/src/app/[locale]/(store)/favorites/components/FavoriteItem.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, GripVertical, Minus, Plus } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Badge } from "@/shadcn/components/ui/badge";
import { Input } from "@/shadcn/components/ui/input";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { useTranslations } from "next-intl";
import { removeFromFavorites } from "@/app/actions/favoriteActions";
import { useCart } from "@/app/state/cartHooks";
import { Favorite } from "@/app/actions/favoriteActions";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/shadcn/lib/utils";
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

interface FavoriteItemProps {
	favorite: Favorite;
	onRemove: (favoriteId: number) => void;
}

export default function FavoriteItem({
	favorite,
	onRemove,
}: FavoriteItemProps) {
	const t = useTranslations();
	const { addItemToCart } = useCart();
	const [isRemoving, setIsRemoving] = useState(false);
	const [showRemoveDialog, setShowRemoveDialog] = useState(false);
	const [addedToCart, setAddedToCart] = useState(false);
	const [quantity, setQuantity] = useState(1);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: favorite.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	// Calculate max quantity based on stock
	const maxQuantity =
		favorite.product?.stockQuantity && favorite.product.stockQuantity < 10
			? favorite.product.stockQuantity
			: 10;

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

	const handleRemove = async () => {
		setIsRemoving(true);
		try {
			const result = await removeFromFavorites(favorite.productId);
			if (result.success) {
				onRemove(favorite.id);
			}
		} catch (error) {
			console.error("Error removing favorite:", error);
		} finally {
			setIsRemoving(false);
			setShowRemoveDialog(false);
		}
	};

	const handleAddToCart = () => {
		if (!favorite.product) return;

		const cartItem = {
			productId: favorite.product.id.toString(),
			cartItemId: `${favorite.product.id}-default`,
			name: favorite.product.name,
			price: favorite.product.price,
			quantity: quantity, // Use the selected quantity
			size: "30x40", // Default size
			slug: favorite.product.slug,
		};

		addItemToCart(cartItem);
		setAddedToCart(true);
		setTimeout(() => {
			setAddedToCart(false);
			setQuantity(1); // Reset quantity after adding
		}, 2000);
	};

	if (!favorite.product) return null;

	const isOutOfStock = favorite.product.stockQuantity === 0;

	return (
		<>
			<Card
				ref={setNodeRef}
				style={style}
				className={cn(
					"transition-all duration-200",
					isDragging && "opacity-50 shadow-xl z-50"
				)}
			>
				<CardContent className="p-4">
					<div className="flex gap-4 items-center">
						{/* Drag handle */}
						<div
							{...attributes}
							{...listeners}
							className="flex items-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
						>
							<GripVertical className="w-5 h-5" />
						</div>

						{/* Product image */}
						<Link
							href={`/product/${favorite.product.slug}`}
							className="flex-shrink-0"
						>
							<Image
								src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/apelsin.jpg`}
								alt={favorite.product.name}
								width={100}
								height={100}
								className="rounded-md object-cover"
							/>
						</Link>

						{/* Product details */}
						<div className="flex-1 min-w-0">
							<Link
								href={`/product/${favorite.product.slug}`}
								className="block"
							>
								<h3 className="font-semibold text-lg truncate hover:text-blue-600 transition-colors">
									{favorite.product.name}
								</h3>
							</Link>

							<div className="mt-1 space-y-1">
								<p className="text-xl font-bold text-gray-800">
									{formatCurrency(favorite.product.price, "SEK")}
								</p>

								{favorite.product.categories &&
									favorite.product.categories.length > 0 && (
										<div className="flex flex-wrap gap-1">
											{favorite.product.categories.map((cat) => (
												<Badge
													key={cat.id}
													variant="secondary"
													className="text-xs"
												>
													{cat.name}
												</Badge>
											))}
										</div>
									)}

								<p className="text-sm text-gray-500">
									{t("Added")}{": "}
									{new Date(favorite.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>

						{/* Quantity selector and Actions */}
						<div className="flex flex-col gap-2 flex-shrink-0">
							{/* Quantity selector */}
							<div className="flex items-center gap-1">
								<Button
									size="icon"
									variant="outline"
									className="h-8 w-8"
									onClick={decrementQuantity}
									disabled={quantity <= 1 || isOutOfStock}
								>
									<Minus className="h-3 w-3" />
								</Button>

								<Input
									type="number"
									min={1}
									max={maxQuantity}
									value={quantity}
									onChange={(e) => handleQuantityChange(e.target.value)}
									className="w-16 h-8 text-center"
									disabled={isOutOfStock}
								/>

								<Button
									size="icon"
									variant="outline"
									className="h-8 w-8"
									onClick={incrementQuantity}
									disabled={quantity >= maxQuantity || isOutOfStock}
								>
									<Plus className="h-3 w-3" />
								</Button>
							</div>

							{/* Action buttons */}
							<Button
								size="sm"
								variant={addedToCart ? "default" : "outline"}
								onClick={handleAddToCart}
								disabled={isOutOfStock}
								className={cn(
									"transition-all",
									addedToCart && "bg-gray-800 hover:bg-gray-900"
								)}
							>
								<ShoppingCart className="w-4 h-4 mr-1" />
								{addedToCart
									? t("Added")
									: isOutOfStock
									? t("OutOfStock")
									: t("AddToCart")}
							</Button>

							<Button
								size="sm"
								variant="ghost"
								onClick={() => setShowRemoveDialog(true)}
								disabled={isRemoving}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<Trash2 className="w-4 h-4 mr-1" />
								{t("Remove")}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("RemoveFromFavorites")}</AlertDialogTitle>
						<AlertDialogDescription>
							{`${t("AreYouSureRemoveFavorite")} "${favorite.product.name}"?`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRemove}
							className="bg-red-600 hover:bg-red-700"
						>
							{t("Remove")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
