// client/src/app/[locale]/(admin)/admin/products/components/CreateProductModal.tsx
"use client";

import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useCreateProductMutation } from "@/app/state/api";
import { CreateProductFormData } from "@/app/types/product";
import { Product, ProductCategory } from "@/app/types";
import { useTranslations } from "next-intl";

// Import shadcn components
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import { Textarea } from "@/shadcn/components/ui/textarea";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/shadcn/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shadcn/components/ui/select";
import { Separator } from "@/shadcn/components/ui/separator";

type CreateProductModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onCreate?: (product: Product) => void;
	categories?: ProductCategory[];
};

const CreateProductModal = ({
	isOpen,
	onClose,
	onCreate,
	categories = [],
}: CreateProductModalProps) => {
	const [formData, setFormData] = useState<CreateProductFormData>({
		name: "",
		slug: "",
		price: 0,
		stockQuantity: 0,
		rating: 0,
		enableStockManagement: false,
		description: "",
		shortDescription: "",
		metaTitle: "",
		metaDescription: "",
		metaKeywords: "",
		categoryIds: [],
	});

	const t = useTranslations();

	// Use RTK Query mutation for product creation
	const [createProduct, { isLoading, isError }] = useCreateProductMutation();

	// Reset form when modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			setFormData({
				name: "",
				slug: "",
				price: 0,
				stockQuantity: 0,
				rating: 0,
				enableStockManagement: false,
				description: "",
				shortDescription: "",
				metaTitle: "",
				metaDescription: "",
				metaKeywords: "",
				categoryIds: [],
			});
		}
	}, [isOpen]);

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]:
				name === "price" || name === "stockQuantity" || name === "rating"
					? parseFloat(value) || 0
					: value,
		});
	};

	const handleCategoryChange = (categoryId: number, checked: boolean) => {
		setFormData(prev => ({
			...prev,
			categoryIds: checked
				? [...prev.categoryIds, categoryId]
				: prev.categoryIds.filter(id => id !== categoryId)
		}));
	};

	const handleStockManagementChange = (checked: boolean) => {
		setFormData(prev => ({
			...prev,
			enableStockManagement: checked,
			// Preserve stock quantity when toggling stock management
			stockQuantity: checked ? (prev.stockQuantity || 0) : prev.stockQuantity
		}));
	};

	// Recursive function to render categories with hierarchy
	const renderCategories = (
		categories: ProductCategory[],
		level = 0
	) => {
		return categories.map((category) => (
			<div key={category.id} style={{ marginLeft: level * 20 }}>
				<div className="flex items-center space-x-2 py-1">
					<Checkbox
						id={`category-${category.id}`}
						checked={formData.categoryIds.includes(category.id || 0)}
						onCheckedChange={(checked) => 
							handleCategoryChange(category.id || 0, checked as boolean)
						}
					/>
					<Label 
						htmlFor={`category-${category.id}`}
						className="text-sm font-normal cursor-pointer"
					>
						{category.name}
					</Label>
				</div>
				{category.children && category.children.length > 0 && (
					<div className="ml-4">
						{renderCategories(category.children, level + 1)}
					</div>
				)}
			</div>
		));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const result = await createProduct(formData).unwrap();

			// Call onCreate with the created product
			if (onCreate && result) {
				onCreate(result as Product);
			}

			onClose();
		} catch (error) {
			console.error("Error creating product:", error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("createProduct")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					{/* Basic Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Basic Information</h3>
						
						<div className="grid gap-2">
							<Label htmlFor="name">{t("productName")}</Label>
							<Input
								id="name"
								name="name"
								placeholder={t("productNamePlaceholder")}
								value={formData.name}
								onChange={handleChange}
								required
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="slug">{t("slug")}</Label>
							<Input
								id="slug"
								name="slug"
								placeholder={t("productSlugPlaceholder")}
								value={formData.slug}
								onChange={handleChange}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="price">{t("price")}</Label>
								<Input
									id="price"
									name="price"
									type="number"
									placeholder="0.00"
									value={formData.price}
									onChange={handleChange}
									step="0.01"
									min="0"
									required
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="rating">{t("rating")}</Label>
								<Input
									id="rating"
									name="rating"
									type="number"
									placeholder="0.0"
									value={formData.rating}
									onChange={handleChange}
									min="0"
									max="5"
									step="0.1"
									required
								/>
							</div>
						</div>

						{/* Stock Management */}
						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="enableStockManagement"
									checked={formData.enableStockManagement}
									onCheckedChange={handleStockManagementChange}
								/>
								<Label 
									htmlFor="enableStockManagement"
									className="text-sm font-medium cursor-pointer"
								>
									Enable Stock Management
								</Label>
							</div>
							
							{formData.enableStockManagement && (
								<div className="grid gap-2">
									<Label htmlFor="stockQuantity">{t("stockQuantity")}</Label>
									<Input
										id="stockQuantity"
										name="stockQuantity"
										type="number"
										placeholder="0"
										value={formData.stockQuantity}
										onChange={handleChange}
										min="0"
										required
									/>
								</div>
							)}
						</div>


					</div>

					<Separator />

					{/* Description */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Description</h3>
						
						<div className="grid gap-2">
							<Label htmlFor="shortDescription">Short Description</Label>
							<Textarea
								id="shortDescription"
								name="shortDescription"
								placeholder="Brief product description..."
								value={formData.shortDescription}
								onChange={handleChange}
								rows={2}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">Full Description</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="Detailed product description..."
								value={formData.description}
								onChange={handleChange}
								rows={4}
							/>
						</div>
					</div>

					<Separator />

					{/* Categories */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Categories</h3>
						<div className="max-h-40 overflow-y-auto border rounded-md p-3">
							{categories.length > 0 ? (
								renderCategories(categories)
							) : (
								<p className="text-gray-500 text-sm">No categories available</p>
							)}
						</div>
					</div>

					<Separator />

					{/* SEO Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">SEO Information</h3>
						
						<div className="grid gap-2">
							<Label htmlFor="metaTitle">Meta Title</Label>
							<Input
								id="metaTitle"
								name="metaTitle"
								placeholder="SEO title for search engines..."
								value={formData.metaTitle}
								onChange={handleChange}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="metaDescription">Meta Description</Label>
							<Textarea
								id="metaDescription"
								name="metaDescription"
								placeholder="SEO description for search engines..."
								value={formData.metaDescription}
								onChange={handleChange}
								rows={2}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="metaKeywords">Meta Keywords</Label>
							<Input
								id="metaKeywords"
								name="metaKeywords"
								placeholder="Keywords separated by commas..."
								value={formData.metaKeywords}
								onChange={handleChange}
							/>
						</div>
					</div>

					{isError && (
						<p className="text-red-500 text-sm">{t("failedToCreateProduct")}</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isLoading}
						>
							{t("cancel")}
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? t("creating") : t("createProduct")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateProductModal;
