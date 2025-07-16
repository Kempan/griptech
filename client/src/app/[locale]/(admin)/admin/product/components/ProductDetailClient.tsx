// client/src/app/[locale]/(admin)/admin/product/components/ProductDetailClient.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
	useUpdateProductMutation,
	useDeleteProductMutation,
} from "@/app/state/api";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import { Textarea } from "@/shadcn/components/ui/textarea";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shadcn/components/ui/tabs";
import Image from "next/image";
import { Product, ProductCategory } from "@/app/types";
import { toast } from "sonner";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import { useTranslations } from "next-intl";
import { getStockStatusText, getStockStatusColor } from "@/app/lib/utils/stock-utils";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";

interface ProductDetailClientProps {
	product: Product;
	categories: ProductCategory[];
	locale: string;
}

export function ProductDetailClient({
	product,
	categories,
	locale,
}: ProductDetailClientProps) {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [activeTab, setActiveTab] = useState("general");
	const t = useTranslations();
	
	// General fields
	const [name, setName] = useState(product.name);
	const [slug, setSlug] = useState(product.slug || "");
	const [price, setPrice] = useState(product.price.toString());
	const [stockQuantity, setStockQuantity] = useState(
		product.stockQuantity?.toString() || "0"
	);
	const [enableStockManagement, setEnableStockManagement] = useState(
		product.enableStockManagement || false
	);

	// SEO fields
	const [description, setDescription] = useState(product.description || "");
	const [shortDescription, setShortDescription] = useState(
		product.shortDescription || ""
	);
	const [metaTitle, setMetaTitle] = useState(product.metaTitle || "");
	const [metaDescription, setMetaDescription] = useState(
		product.metaDescription || ""
	);
	const [metaKeywords, setMetaKeywords] = useState(product.metaKeywords || "");

	const [selectedCategories, setSelectedCategories] = useState<number[]>(
		product.categories?.map((cat) =>
			typeof cat.id === "string" ? parseInt(cat.id, 10) : cat.id
		).filter((id): id is number => id !== null) || []
	);
	const [error, setError] = useState("");

	const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
	const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

	// Memoized input handlers for focus stability
	const handleNameChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setName(e.target.value);
		},
		[]
	);

	const handleSlugChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSlug(e.target.value);
		},
		[]
	);

	const handlePriceChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setPrice(e.target.value);
		},
		[]
	);

	const handleStockQuantityChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setStockQuantity(e.target.value);
		},
		[]
	);

	const handleStockManagementChange = useCallback(
		(checked: boolean) => {
			setEnableStockManagement(checked);
			// Reset stock quantity when disabling stock management
			if (!checked) {
				setStockQuantity("0");
			}
		},
		[]
	);

	const handleDescriptionChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setDescription(e.target.value);
		},
		[]
	);

	const handleShortDescriptionChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setShortDescription(e.target.value);
		},
		[]
	);

	const handleMetaTitleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setMetaTitle(e.target.value);
		},
		[]
	);

	const handleMetaDescriptionChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setMetaDescription(e.target.value);
		},
		[]
	);

	const handleMetaKeywordsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setMetaKeywords(e.target.value);
		},
		[]
	);

	// Handle form submission
	const handleSave = async () => {
		if (!name || !price) {
			setError("Name and price are required");
			return;
		}

		try {
			await updateProduct({
				id: product.id,
				data: {
					name,
					slug,
					price: parseFloat(price),
					stockQuantity: parseInt(stockQuantity, 10),
					enableStockManagement,
					categoryIds: selectedCategories,
					description,
					shortDescription,
					metaTitle,
					metaDescription,
					metaKeywords,
				},
			}).unwrap();

			setIsEditing(false);
			router.refresh();
			toast.success("Product updated successfully");
		} catch (error) {
			console.error("Failed to update product:", error);
			setError("Failed to update product.");
			toast.error("Failed to update product");
		}
	};

	// Handle product deletion
	const handleDelete = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this product? This action cannot be undone."
			)
		) {
			return;
		}

		try {
			await deleteProduct(product.id).unwrap();
			toast.success("Product deleted successfully");
			router.push(`/${locale}/admin/products`);
		} catch (error) {
			console.error("Failed to delete product:", error);
			setError("Failed to delete product.");
			toast.error("Failed to delete product");
		}
	};

	// Handle category selection
	const handleCategoryChange = useCallback((categoryId: number) => {
		setSelectedCategories((prev) =>
			prev.includes(categoryId)
				? prev.filter((id) => id !== categoryId)
				: [...prev, categoryId]
		);
	}, []);

	// Reset form to initial state
	const handleCancel = () => {
		setIsEditing(false);
		setName(product.name);
		setSlug(product.slug || "");
		setPrice(product.price.toString());
		setStockQuantity(product.stockQuantity?.toString() || "0");
		setEnableStockManagement(product.enableStockManagement || false);
		setDescription(product.description || "");
		setShortDescription(product.shortDescription || "");
		setMetaTitle(product.metaTitle || "");
		setMetaDescription(product.metaDescription || "");
		setMetaKeywords(product.metaKeywords || "");
		setSelectedCategories(
			product.categories?.map((cat) =>
				typeof cat.id === "string" ? parseInt(cat.id, 10) : cat.id
			).filter((id): id is number => id !== null) || []
		);
		setError("");
	};

	// Product Info Display Component
	// ProductInfo component - more compact layout
	const ProductInfo = () => (
		<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
			{/* Left column - Product image */}
			<div className="md:col-span-3">
				<Image
					src="/images/grip3.jpg"
					alt={product.name}
					width={250}
					height={250}
					className="rounded"
				/>
			</div>

			{/* Middle column - Core product info */}
			<div className="md:col-span-5">
				<div className="grid grid-cols-2 gap-x-4 gap-y-3">
					<div>
						<p className="text-sm text-gray-500">ID</p>
						<p className="font-medium">{product.id}</p>
					</div>

					<div>
						<p className="text-sm text-gray-500">{t("name")}</p>
						<p className="font-medium">{product.name}</p>
					</div>

					<div>
							<p className="text-sm text-gray-500">{t("slug")}</p>
						<p
							className="font-medium text-gray-800 truncate"
							title={product.slug || "-"}
						>
							{product.slug || "-"}
						</p>
					</div>

					<div>
						<p className="text-sm text-gray-500">{t("price")}</p>		
						<p className="font-medium">{formatCurrency(product.price, "SEK")}</p>
					</div>

					<div>
						<p className="text-sm text-gray-500">{t("StockManagement")}</p>
						<p className="font-medium">
							{product.enableStockManagement ? t("enabled") : t("disabled")}
						</p>
					</div>

					<div>
						<p className="text-sm text-gray-500">{t("stock")}</p>
						<p className="font-medium">{product.stockQuantity || 0}</p>
					</div>

					<div>
							<p className="text-sm text-gray-500">{t("status")}</p>
						<p className={`font-medium ${getStockStatusColor(product)}`}>
							{getStockStatusText(product, t)}
						</p>
					</div>
				</div>

				{/* Categories */}
				<div className="mt-4">
					<p className="text-sm text-gray-500 mb-1">{t("categories")}</p>
					<div className="flex flex-wrap gap-1">
						{product.categories && product.categories.length > 0 ? (
							product.categories.map((category) => (
								<span
									key={category.id}
									className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800"
								>
									{category.name}
								</span>
							))
						) : (
							<span className="text-gray-500 text-sm italic">
								{t("noCategories")}
							</span>
						)}
					</div>
				</div>

				{/* Dates in a compact format */}
				<div className="mt-4 flex gap-x-6 text-sm">
					{product.createdAt && (
						<div>
							<span className="text-gray-500">{t("created")}: </span>
							<span className="font-medium">
								{formatDateDisplay(product.createdAt)}
							</span>
						</div>
					)}

					{product.updatedAt && (
						<div>
							<span className="text-gray-500">{t("updated")}: </span>
							<span className="font-medium">
								{formatDateDisplay(product.updatedAt)}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Right column - Description and SEO */}
			<div className="md:col-span-4">
				{/* Description with appropriate sizing */}
				{product.description && (
					<div className="mb-3">
						<p className="text-sm text-gray-500 mb-1">{t("description")}</p>
						<p
							className="text-sm text-gray-800 line-clamp-3"
							title={product.description}
						>
							{product.description}
						</p>
					</div>
				)}

				{/* SEO Fields in a collapsible or compact format */}
				{(product.shortDescription ||
					product.metaTitle ||
					product.metaDescription ||
					product.metaKeywords) && (
					<div className="border-t border-gray-100 pt-3 mt-3">
						<h3 className="text-sm font-medium text-gray-700 mb-2">
							{t("seoMetadata")}
						</h3>

						{product.shortDescription && (
							<div className="mb-2">
								<p className="text-xs text-gray-500">{t("shortDescription")}</p>
								<p
									className="text-sm text-gray-800 line-clamp-2"
									title={product.shortDescription}
								>
									{product.shortDescription}
								</p>
							</div>
						)}

						{product.metaTitle && (
							<div className="mb-2">
								<p className="text-xs text-gray-500">{t("metaTitle")}</p>
								<p
									className="text-sm text-gray-800 line-clamp-1"
									title={product.metaTitle}
								>
									{product.metaTitle}
								</p>
							</div>
						)}

						{product.metaDescription && (
							<div className="mb-2">
								<p className="text-xs text-gray-500">{t("metaDescription")}</p>
								<p
									className="text-sm text-gray-800 line-clamp-2"
									title={product.metaDescription}
								>
									{product.metaDescription}
								</p>
							</div>
						)}

						{product.metaKeywords && (
							<div>
								<p className="text-xs text-gray-500">{t("metaKeywords")}</p>
								<p
									className="text-sm text-gray-800 line-clamp-1"
									title={product.metaKeywords}
								>
									{product.metaKeywords}
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);

	// If not in editing mode, show product info view
	if (!isEditing) {
		return (
			<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
				{error && (
					<div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
						{error}
					</div>
				)}

				<h2 className="text-xl font-semibold mb-6">{t("productDetails")}</h2>

				<ProductInfo />

				<div className="mt-6 flex gap-2">
					<Button onClick={() => setIsEditing(true)}>{t("editProduct")}</Button>
					<Button variant="error" onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? t("deleting") : t("deleteProduct")}
					</Button>
				</div>
			</div>
		);
	}

	// Edit mode UI
	return (
		<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
			{error && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
					{error}
				</div>
			)}

			<h2 className="text-xl font-semibold mb-6">{t("productDetails")}</h2>

			<Tabs
				defaultValue="general"
				className="mt-4"
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<TabsList className="mb-4">
					<TabsTrigger value="general">{t("general")}</TabsTrigger>
					<TabsTrigger value="description">
						{t("description")} & {t("categories")}
					</TabsTrigger>
					<TabsTrigger value="seo">{t("seoMetadata")}</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
						{/* Left column - Product image */}
						<div className="md:col-span-3">
							<Image
								src="/images/grip3.jpg"
								alt={name}
								width={250}
								height={250}
								className="rounded"
							/>
							<div className="mt-4">
								<p className="text-sm text-gray-500">ID</p>
								<p className="font-medium">{product.id}</p>
							</div>
							{product.createdAt && (
								<div className="mt-2">
									<p className="text-sm text-gray-500">{t("created")}</p>
									<p className="text-sm">
										{formatDateDisplay(product.createdAt)}
									</p>
								</div>
							)}
						</div>

						{/* Middle and right columns - Form fields */}
						<div className="md:col-span-9">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="mb-4">
									<Label htmlFor="name">{t("productName")}</Label>
									<Input
										id="name"
										value={name}
										onChange={handleNameChange}
										className="mt-1"
									/>
								</div>

								<div className="mb-4">
									<Label htmlFor="slug">{t("slug")}</Label>
									<Input
										id="slug"
										value={slug}
										onChange={handleSlugChange}
										className="mt-1"
									/>
								</div>

								<div className="mb-4">
									<Label htmlFor="price">{t("price")}</Label>
									<div className="relative mt-1">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<span className="text-gray-500 sm:text-sm">$</span>
										</div>
										<Input
											id="price"
											type="number"
											value={price}
											onChange={handlePriceChange}
											className="pl-7"
											step="0.01"
											min="0"
										/>
									</div>
								</div>

								<div className="mb-4">
									<div className="flex items-center space-x-2 mb-2">
										<Checkbox
											id="enableStockManagement"
											checked={enableStockManagement}
											onCheckedChange={handleStockManagementChange}
										/>
										<Label 
											htmlFor="enableStockManagement"
											className="text-sm font-medium cursor-pointer"
										>
											{t("enableStockManagement")}
										</Label>
									</div>
									
									{enableStockManagement && (
										<div>
											<Label htmlFor="stockQuantity">{t("stockQuantity")}</Label>
											<Input
												id="stockQuantity"
												type="number"
												value={stockQuantity}
												onChange={handleStockQuantityChange}
												className="mt-1"
												min="0"
											/>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="description" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
						{/* Left column - Description */}
						<div className="md:col-span-7">
							<div className="mb-4">
								<Label htmlFor="description">{t("description")}</Label>
								<Textarea
									id="description"
									value={description}
									onChange={handleDescriptionChange}
									className="mt-1"
									rows={6}
									placeholder="Product description"
								/>
							</div>

							<div className="mb-4">
								<Label htmlFor="shortDescription">{t("shortDescription")}</Label>
								<Textarea
									id="shortDescription"
									value={shortDescription}
									onChange={handleShortDescriptionChange}
									className="mt-1"
									rows={3}
									placeholder="Brief product summary (1-2 sentences)"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Used for product listings and search results
								</p>
							</div>
						</div>

						{/* Right column - Categories */}
						<div className="md:col-span-5">
							<Label>{t("categories")}</Label>
							<div className="mt-1 border rounded p-3 h-[350px] overflow-y-auto">
								{renderCategories(
									categories,
									selectedCategories,
									handleCategoryChange
								)}
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="seo" className="space-y-4">
					<div className="max-w-2xl">
						<div className="mb-4">
							<Label htmlFor="metaTitle">{t("metaTitle")}</Label>
							<Input
								id="metaTitle"
								value={metaTitle}
								onChange={handleMetaTitleChange}
								className="mt-1"
								placeholder="Custom page title for search engines"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Leave empty to use product name (recommended: 50-60 characters)
							</p>
						</div>

						<div className="mb-4">
							<Label htmlFor="metaDescription">{t("metaDescription")}</Label>
							<Textarea
								id="metaDescription"
								value={metaDescription}
								onChange={handleMetaDescriptionChange}
								className="mt-1"
								rows={3}
								placeholder="Description for search engine results (120-155 characters)"
							/>
							<p className="text-xs text-gray-500 mt-1">
								{metaDescription.length}/155 characters
							</p>
						</div>

						<div className="mb-4">
							<Label htmlFor="metaKeywords">{t("metaKeywords")}</Label>
							<Input
								id="metaKeywords"
								value={metaKeywords}
								onChange={handleMetaKeywordsChange}
								className="mt-1"
								placeholder="Comma-separated keywords"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Separate keywords with commas
							</p>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			<div className="mt-6 flex gap-2">
				<Button onClick={handleSave} disabled={isUpdating || isDeleting}>
					{isUpdating ? t("saving") : t("saveChanges")}
				</Button>
				<Button
					variant="outline"
					onClick={handleCancel}
					disabled={isUpdating || isDeleting}
				>
					{t("cancel")}	
				</Button>
			</div>
		</div>
	);
}

// Recursive function to render categories with indentation
function renderCategories(
	categories: ProductCategory[],
	selectedCategories: number[],
	handleCategoryChange: (categoryId: number) => void,
	level = 0
) {
	return categories.map((category) => {
		// Ensure category.id is a number
		const categoryId =
			typeof category.id === "string" ? parseInt(category.id, 10) : category.id;

		return (
			<div
				key={categoryId}
				style={{ marginLeft: level > 0 ? `${7 * level}px` : "0px" }}
				className="py-1"
			>
				<label className="flex items-center space-x-2 cursor-pointer">
					{level > 0 && <span>{"-".repeat(level)}</span>}
					<input
						type="checkbox"
						checked={selectedCategories.includes(categoryId as number)}
						onChange={() => handleCategoryChange(categoryId as number)}
						className="w-4 h-4"
					/>
					<span className="text-gray-700">{category.name}</span>
				</label>
				{/* Recursive call for child categories */}
				{category.children && category.children.length > 0 && (
					<div>
						{renderCategories(
							category.children,
							selectedCategories,
							handleCategoryChange,
							level + 1
						)}
					</div>
				)}
			</div>
		);
	});
}
