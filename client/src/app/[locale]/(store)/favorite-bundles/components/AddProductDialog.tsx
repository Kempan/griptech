"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shadcn/components/ui/dialog";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import { Search, Plus, Check } from "lucide-react";
import Image from "next/image";
import { getProducts } from "@/app/actions/productActions";
import { getUserFavorites } from "@/app/actions/favoriteActions";
import { addProductToBundle } from "@/app/actions/bundleActions";
import { Product } from "@/app/types";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { Badge } from "@/shadcn/components/ui/badge";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shadcn/components/ui/tabs";
import { cn } from "@/shadcn/lib/utils";

interface AddProductDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bundleId: number;
	onProductAdded: () => void;
}

export default function AddProductDialog({
	open,
	onOpenChange,
	bundleId,
	onProductAdded,
}: AddProductDialogProps) {
	const t = useTranslations();
	const [activeTab, setActiveTab] = useState<"all" | "favorites">("favorites");
	const [searchQuery, setSearchQuery] = useState("");
	const [allProducts, setAllProducts] = useState<Product[]>([]);
	const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [selectedProducts, setSelectedProducts] = useState<Map<number, number>>(
		new Map()
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);

	// Calculate if all filtered products are selected
	const areAllSelected =
		filteredProducts.length > 0 &&
		filteredProducts.every((product) => selectedProducts.has(product.id));

	// Calculate if some but not all are selected
	const areSomeSelected =
		filteredProducts.some((product) => selectedProducts.has(product.id)) &&
		!areAllSelected;

	// Wrap filterProducts in useCallback to fix the dependency warning
	const filterProducts = useCallback(() => {
		const products = activeTab === "favorites" ? favoriteProducts : allProducts;

		if (!searchQuery.trim()) {
			setFilteredProducts(products);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = products.filter(
			(product) =>
				product.name.toLowerCase().includes(query) ||
				product.categories?.some((cat) =>
					cat.name.toLowerCase().includes(query)
				)
		);
		setFilteredProducts(filtered);
	}, [searchQuery, activeTab, allProducts, favoriteProducts]);

	useEffect(() => {
		if (open) {
			loadProducts();
		}
	}, [open]);

	useEffect(() => {
		filterProducts();
	}, [filterProducts]);

	const loadProducts = async () => {
		setIsLoading(true);
		try {
			// Load all products
			const productsData = await getProducts({ limit: 100 });
			setAllProducts(productsData);

			// Load favorite products
			const favoritesData = await getUserFavorites({ pageSize: 100 });
			const favProducts = favoritesData.favorites
				.map((fav) => fav.product)
				.filter(Boolean) as Product[];
			setFavoriteProducts(favProducts);
		} catch (error) {
			console.error("Error loading products:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const toggleProductSelection = (productId: number) => {
		const newSelection = new Map(selectedProducts);
		if (newSelection.has(productId)) {
			newSelection.delete(productId);
		} else {
			newSelection.set(productId, 1); // Default quantity of 1
		}
		setSelectedProducts(newSelection);
	};

	const updateQuantity = (productId: number, quantity: number) => {
		if (quantity < 1) return;
		const newSelection = new Map(selectedProducts);
		newSelection.set(productId, quantity);
		setSelectedProducts(newSelection);
	};

	const handleSelectAll = () => {
		if (areAllSelected) {
			// Deselect all filtered products
			const newSelection = new Map(selectedProducts);
			filteredProducts.forEach((product) => {
				newSelection.delete(product.id);
			});
			setSelectedProducts(newSelection);
		} else {
			// Select all filtered products
			const newSelection = new Map(selectedProducts);
			filteredProducts.forEach((product) => {
				if (!newSelection.has(product.id)) {
					newSelection.set(product.id, 1); // Default quantity of 1
				}
			});
			setSelectedProducts(newSelection);
		}
	};

	const handleAddProducts = async () => {
		if (selectedProducts.size === 0) return;

		setIsAdding(true);
		try {
			// Add each selected product to the bundle
			for (const [productId, quantity] of selectedProducts) {
				await addProductToBundle(bundleId, productId, quantity);
			}

			// Clear selection and close dialog
			setSelectedProducts(new Map());
			onProductAdded();
			onOpenChange(false);
		} catch (error) {
			console.error("Error adding products to bundle:", error);
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh]">
				<DialogHeader>
					<DialogTitle>{t("AddProductsToBundle")}</DialogTitle>
					<DialogDescription>{t("SelectProductsToAdd")}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<Input
							placeholder={t("SearchProducts")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Tabs */}
					<Tabs
						value={activeTab}
						onValueChange={(value) =>
							setActiveTab(value as "all" | "favorites")
						}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="favorites">{t("MyFavorites")}</TabsTrigger>
							<TabsTrigger value="all">{t("AllProducts")}</TabsTrigger>
						</TabsList>

						<TabsContent value={activeTab} className="mt-4">
							{/* Select All Checkbox */}
							{!isLoading && filteredProducts.length > 0 && (
								<div className="flex items-center gap-2 pb-3 border-b">
									<Checkbox
										checked={areAllSelected}
										onCheckedChange={handleSelectAll}
										aria-label="Select all products"
										className={
											areSomeSelected ? "data-[state=checked]:bg-gray-400" : ""
										}
									/>
									<Label
										htmlFor="select-all"
										className="text-sm font-medium cursor-pointer"
										onClick={handleSelectAll}
									>
										{t("SelectAll")} ({filteredProducts.length})
									</Label>
								</div>
							)}

							<ScrollArea className="h-[400px] pr-4">
								{isLoading ? (
									<div className="text-center py-8">{t("Loading")}...</div>
								) : filteredProducts.length === 0 ? (
									<div className="text-center py-8 text-gray-500">
										{searchQuery
											? t("NoProductsFound")
											: t("NoProductsAvailable")}
									</div>
								) : (
									<div className="space-y-2 pt-3">
										{filteredProducts.map((product) => (
											<ProductSelectItem
												key={product.id}
												product={product}
												isSelected={selectedProducts.has(product.id)}
												quantity={selectedProducts.get(product.id) || 1}
												onToggle={() => toggleProductSelection(product.id)}
												onQuantityChange={(q) => updateQuantity(product.id, q)}
											/>
										))}
									</div>
								)}
							</ScrollArea>
						</TabsContent>
					</Tabs>
				</div>

				<DialogFooter>
					<div className="flex items-center justify-between w-full">
						<span className="text-sm text-gray-600">
							{selectedProducts.size} {t("ProductsSelected")}
						</span>
						<div className="flex gap-2">
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								{t("Cancel")}
							</Button>
							<Button
								onClick={handleAddProducts}
								disabled={selectedProducts.size === 0 || isAdding}
							>
								{isAdding ? t("Adding") : t("AddToBundle")}
							</Button>
						</div>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

interface ProductSelectItemProps {
	product: Product;
	isSelected: boolean;
	quantity: number;
	onToggle: () => void;
	onQuantityChange: (quantity: number) => void;
}

function ProductSelectItem({
	product,
	isSelected,
	quantity,
	onToggle,
	onQuantityChange,
}: ProductSelectItemProps) {
	const t = useTranslations();

	return (
		<div
			className={cn(
				"flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
				isSelected ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
			)}
			onClick={onToggle}
		>
			{/* Checkbox */}
			<div
				className={cn(
					"w-5 h-5 rounded border-2 flex items-center justify-center",
					isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
				)}
			>
				{isSelected && <Check className="w-3 h-3 text-white" />}
			</div>

			{/* Product image */}
			<Image
				src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/apelsin.jpg`}
				alt={product.name}
				width={60}
				height={60}
				className="rounded-md object-cover"
			/>

			{/* Product details */}
			<div className="flex-1">
				<h4 className="font-medium">{product.name}</h4>
				<div className="flex items-center gap-2 mt-1">
					<span className="text-gray-800 font-semibold">
						{formatCurrency(product.price, "SEK")}
					</span>
					{product.categories && product.categories.length > 0 && (
						<Badge variant="secondary" className="text-xs">
							{product.categories[0].name}
						</Badge>
					)}
				</div>
			</div>

			{/* Quantity selector (only show when selected) */}
			{isSelected && (
				<div
					className="flex items-center gap-2"
					onClick={(e) => e.stopPropagation()}
				>
					<Label className="text-sm">{t("Quantity")}:</Label>
					<Input
						type="number"
						min={1}
						value={quantity}
						onChange={(e) => {
							const value = parseInt(e.target.value);
							if (!isNaN(value) && value >= 1) {
								onQuantityChange(value);
							}
						}}
						className="w-20 h-8"
					/>
				</div>
			)}
		</div>
	);
}
