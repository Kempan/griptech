// client/src/app/[locale]/(admin)/admin/products/components/CreateProductModal.tsx
"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { useCreateProductMutation } from "@/app/state/api";
import { CreateProductFormData } from "@/app/types/product";
import { Product } from "@/app/types";
import { useTranslations } from "next-intl";

// Import shadcn components
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/shadcn/components/ui/dialog";

type CreateProductModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onCreate?: (product: Product) => void;
};

const CreateProductModal = ({
	isOpen,
	onClose,
	onCreate,
}: CreateProductModalProps) => {
	const [formData, setFormData] = useState<CreateProductFormData>({
		name: "",
		slug: "",
		price: 0,
		stockQuantity: 0,
		rating: 0,
	});

	const t = useTranslations();

	// Use RTK Query mutation for product creation
	const [createProduct, { isLoading, isError }] = useCreateProductMutation();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]:
				name === "price" || name === "stockQuantity" || name === "rating"
					? parseFloat(value)
					: value,
		});
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const result = await createProduct(formData).unwrap();

			// Call onCreate with the created product
			if (onCreate && result) {
				onCreate(result as Product);
			}

			// Reset form
			setFormData({
				name: "",
				slug: "",
				price: 0,
				stockQuantity: 0,
				rating: 0,
			});
			onClose();
		} catch (error) {
			console.error("Error creating product:", error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("createProduct")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
							required
						/>
					</div>

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
