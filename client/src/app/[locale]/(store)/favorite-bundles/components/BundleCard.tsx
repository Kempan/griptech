// client/src/app/[locale]/(store)/favorite-bundles/components/BundleCard.tsx
"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shadcn/components/ui/card";
import { Button } from "@/shadcn/components/ui/button";
import { Badge } from "@/shadcn/components/ui/badge";
import { Edit, Trash2, ShoppingCart, CheckCircle } from "lucide-react";
import { ProductBundle } from "@/app/actions/bundleActions";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { useTranslations } from "next-intl";
import { deleteBundle } from "@/app/actions/bundleActions";
import { useCart } from "@/app/state/cartHooks";
import Link from "next/link";
import Image from "next/image";
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
import { toast } from "sonner";

interface BundleCardProps {
	bundle: ProductBundle;
	onDelete: (bundleId: number) => void;
}

export default function BundleCard({ bundle, onDelete }: BundleCardProps) {
	const t = useTranslations();
	const { addItemToCart } = useCart();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [addedToCart, setAddedToCart] = useState(false);

	// Calculate total price
	const totalPrice = bundle.items.reduce((sum, item) => {
		return sum + (item.product ? item.product.price * item.quantity : 0);
	}, 0);

	// Calculate total items
	const totalItems = bundle.items.reduce((sum, item) => sum + item.quantity, 0);

	// Get items that can be added to cart (have product data)
	const validItems = bundle.items.filter((item) => item.product);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteBundle(bundle.id);
			if (result.success) {
				onDelete(bundle.id);
			}
		} catch (error) {
			console.error("Error deleting bundle:", error);
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	const handleAddToCart = async () => {
		if (validItems.length === 0) {
			toast.error(t("NoItemsToAdd"));
			return;
		}

		setIsAddingToCart(true);
		try {
			// Add each item in the bundle to the cart
			let successCount = 0;
			for (const item of validItems) {
				if (item.product) {
					// Create cart item for each product in the bundle
					addItemToCart({
						productId: item.product.id.toString(),
						name: item.product.name,
						price: item.product.price,
						quantity: item.quantity,
						size: "", // You can modify this if your products have sizes
						slug: item.product.slug,
						cartItemId: `${item.product.id}-${Date.now()}`, // Unique ID for each cart item
					});
					successCount++;
				}
			}

			if (successCount === validItems.length) {
				setAddedToCart(true);
				toast.success(t("BundleAddedToCart", { count: successCount }));

				// Reset the added state after 3 seconds
				setTimeout(() => setAddedToCart(false), 3000);
			} else if (successCount > 0) {
				toast.warning(
					t("SomeItemsNotAdded", {
						added: successCount,
						failed: validItems.length - successCount,
					})
				);
			}
		} catch (error) {
			console.error("Error adding bundle to cart:", error);
			toast.error(t("FailedToAddToCart"));
		} finally {
			setIsAddingToCart(false);
		}
	};

	return (
		<>
			<Card className="hover:shadow-lg transition-shadow">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle className="line-clamp-1">{bundle.name}</CardTitle>
							{bundle.description && (
								<CardDescription className="line-clamp-2 mt-1">
									{bundle.description}
								</CardDescription>
							)}
						</div>
						<Badge variant="secondary">
							{totalItems} {t("Items")}
						</Badge>
					</div>
				</CardHeader>

				<CardContent>
					<div className="space-y-3">
						{/* Product preview images */}
						<div className="flex -space-x-2 overflow-hidden">
							{bundle.items.slice(0, 4).map((item, index) => (
								<div
									key={item.productId}
									className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-100"
									style={{ zIndex: 4 - index }}
								>
									<Image
										src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/apelsin.jpg`}
										alt={item.product?.name || "Product"}
										fill
										className="object-cover"
									/>
								</div>
							))}
							{bundle.items.length > 4 && (
								<div className="relative w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
									<span className="text-xs font-medium text-gray-600">
										+{bundle.items.length - 4}
									</span>
								</div>
							)}
						</div>

						{/* Product names */}
						<div className="text-sm text-gray-600">
							{bundle.items
								.slice(0, 2)
								.map((item) => item.product?.name)
								.filter(Boolean)
								.join(", ")}
							{bundle.items.length > 2 && ` ${t("AndMore")}`}
						</div>

						{/* Total price */}
						<div className="pt-2 border-t">
							<p className="text-sm text-gray-500">{t("TotalValue")}</p>
							<p className="text-xl font-bold text-gray-800">
								{formatCurrency(totalPrice, "SEK")}
							</p>
						</div>
					</div>
				</CardContent>

				<CardFooter className="flex gap-2">
					<Button
						onClick={handleAddToCart}
						disabled={isAddingToCart || validItems.length === 0}
						className="flex-1"
						variant={addedToCart ? "secondary" : "default"}
					>
						{addedToCart ? (
							<>
								<CheckCircle className="w-4 h-4 mr-2" />
								{t("AddedToCart")}
							</>
						) : (
							<>
								<ShoppingCart className="w-4 h-4 mr-2" />
								{isAddingToCart ? t("Adding") : t("AddToCart")}
							</>
						)}
					</Button>
					<Link href={`/favorite-bundles/${bundle.id}`}>
						<Button variant="outline" size="icon">
							<Edit className="w-4 h-4" />
						</Button>
					</Link>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowDeleteDialog(true)}
						className="text-red-600 hover:text-red-700 hover:bg-red-50"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</CardFooter>
			</Card>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("DeleteBundle")}</AlertDialogTitle>
						<AlertDialogDescription>
							{`${t("AreYouSureDeleteBundle")} "${bundle.name}"?`}
							{t("ThisActionCannotBeUndone")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-600 hover:bg-red-700"
							disabled={isDeleting}
						>
							{isDeleting ? t("Deleting") : t("Delete")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
