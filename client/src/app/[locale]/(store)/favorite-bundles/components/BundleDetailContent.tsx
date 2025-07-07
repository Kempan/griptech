// client/src/app/[locale]/(store)/favorite-bundles/components/BundleDetailContent.tsx
"use client";

import { useState } from "react";
import {
	ProductBundle,
	updateBundle,
	updateBundleItems,
} from "@/app/actions/bundleActions";
import { useTranslations } from "next-intl";
import {
	Package,
	Edit2,
	Save,
	X,
	Plus,
	ShoppingCart,
	CheckCircle,
} from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Textarea } from "@/shadcn/components/ui/textarea";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shadcn/components/ui/card";
import BundleItemsList from "./BundleItemsList";
import AddProductDialog from "./AddProductDialog";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import { useCart } from "@/app/state/cartHooks";
import { toast } from "sonner";

interface BundleDetailContentProps {
	bundle: ProductBundle;
}

export default function BundleDetailContent({
	bundle: initialBundle,
}: BundleDetailContentProps) {
	const t = useTranslations();
	const { addItemToCart } = useCart();
	const [bundle, setBundle] = useState(initialBundle);
	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const [editName, setEditName] = useState(bundle.name);
	const [editDescription, setEditDescription] = useState(
		bundle.description || ""
	);
	const [isSaving, setIsSaving] = useState(false);
	const [showAddProduct, setShowAddProduct] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [addedToCart, setAddedToCart] = useState(false);

	// Calculate totals
	const totalItems = bundle.items.reduce((sum, item) => sum + item.quantity, 0);
	const totalPrice = bundle.items.reduce((sum, item) => {
		return sum + (item.product ? item.product.price * item.quantity : 0);
	}, 0);

	// Get items that can be added to cart (have product data)
	const validItems = bundle.items.filter((item) => item.product);

	const handleAddAllToCart = async () => {
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
						cartItemId: `${item.product.id}-${Date.now()}-${Math.random()}`, // Unique ID for each cart item
					});
					successCount++;
				}
			}

			if (successCount === validItems.length) {
				setAddedToCart(true);
				toast.success(t("AllBundleItemsAddedToCart", { count: successCount }));

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

	const handleSaveDetails = async () => {
		if (!editName.trim()) return;

		setIsSaving(true);
		try {
			const result = await updateBundle(bundle.id, {
				name: editName.trim(),
				description: editDescription.trim() || undefined,
			});

			if (result.success && result.bundle) {
				setBundle({
					...bundle,
					name: editName.trim(),
					description: editDescription.trim() || null,
				});
				setIsEditingDetails(false);
			}
		} catch (error) {
			console.error("Error updating bundle:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancelEdit = () => {
		setEditName(bundle.name);
		setEditDescription(bundle.description || "");
		setIsEditingDetails(false);
	};

	const handleItemsUpdate = async (updatedItems: typeof bundle.items) => {
		const result = await updateBundleItems(
			bundle.id,
			updatedItems.map((item, index) => ({
				productId: item.productId,
				quantity: item.quantity,
				order: index,
			}))
		);

		if (result.success) {
			setBundle({ ...bundle, items: updatedItems });
		}
	};

	const handleProductAdded = async () => {
		// Reload the bundle data to get the updated items
		try {
			const { getBundleById } = await import("@/app/actions/bundleActions");
			const updatedBundle = await getBundleById(bundle.id);
			if (updatedBundle) {
				setBundle(updatedBundle);
			}
		} catch (error) {
			console.error("Error reloading bundle:", error);
		}
		setShowAddProduct(false);
	};

	return (
		<div className="space-y-6">
			{/* Bundle Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Package className="w-8 h-8 text-blue-500" />
							{isEditingDetails ? (
								<div className="space-y-2 flex-1">
									<Input
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										placeholder={t("BundleName")}
										className="text-2xl font-bold"
										disabled={isSaving}
									/>
									<Textarea
										value={editDescription}
										onChange={(e) => setEditDescription(e.target.value)}
										placeholder={t("BundleDescription")}
										rows={2}
										disabled={isSaving}
									/>
								</div>
							) : (
								<div>
									<h1 className="text-3xl font-bold">{bundle.name}</h1>
									{bundle.description && (
										<p className="text-gray-600 mt-1">{bundle.description}</p>
									)}
								</div>
							)}
						</div>

						<div className="flex gap-2">
							{isEditingDetails ? (
								<>
									<Button
										variant="outline"
										size="sm"
										onClick={handleCancelEdit}
										disabled={isSaving}
									>
										<X className="w-4 h-4" />
									</Button>
									<Button
										size="sm"
										onClick={handleSaveDetails}
										disabled={!editName.trim() || isSaving}
									>
										<Save className="w-4 h-4 mr-2" />
										{t("Save")}
									</Button>
								</>
							) : (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsEditingDetails(true)}
								>
									<Edit2 className="w-4 h-4 mr-2" />
									{t("Edit")}
								</Button>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-sm text-gray-600">{t("TotalItems")}</p>
							<p className="text-2xl font-bold">{totalItems}</p>
						</div>
						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-sm text-gray-600">{t("TotalValue")}</p>
							<p className="text-2xl font-bold text-gray-800">
								{formatCurrency(totalPrice, "SEK")}
							</p>
						</div>
						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-sm text-gray-600">{t("CreatedOn")}</p>
							<p className="text-lg">
								{formatDateDisplay(new Date(bundle.createdAt).toISOString())}
							</p>
						</div>
					</div>

					{/* Add All to Cart Button */}
					<div className="mt-4 pt-4 border-t">
						<Button
							onClick={handleAddAllToCart}
							disabled={isAddingToCart || validItems.length === 0}
							className="w-full"
							size="lg"
							variant={addedToCart ? "secondary" : "default"}
						>
							{addedToCart ? (
								<>
									<CheckCircle className="w-5 h-5 mr-2" />
									{t("AddedToCart")}
								</>
							) : (
								<>
									<ShoppingCart className="w-5 h-5 mr-2" />
									{isAddingToCart ? t("Adding") : t("AddAllToCart")}
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Bundle Items */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle>{t("BundleItems")}</CardTitle>
						<Button onClick={() => setShowAddProduct(true)}>
							<Plus className="w-4 h-4 mr-2" />
							{t("AddProduct")}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<BundleItemsList
						bundleId={bundle.id}
						items={bundle.items}
						onItemsChange={handleItemsUpdate}
					/>
				</CardContent>
			</Card>

			{/* Add Product Dialog */}
			<AddProductDialog
				open={showAddProduct}
				onOpenChange={setShowAddProduct}
				bundleId={bundle.id}
				onProductAdded={handleProductAdded}
			/>
		</div>
	);
}
