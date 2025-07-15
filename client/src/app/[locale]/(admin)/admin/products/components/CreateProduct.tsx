// client/src/app/[locale]/(admin)/admin/products/components/CreateProduct.tsx
"use client";

import { useState } from "react";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import CreateProductModal from "./CreateProductModal";
import { Product, ProductCategory } from "@/app/types";
import { useTranslations } from "next-intl";
import { useGetCategoriesQuery } from "@/app/state/api";

interface CreateProductProps {
	onProductCreated?: (newProduct: Product) => void;
}

export default function CreateProduct({
	onProductCreated,
}: CreateProductProps = {}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const t = useTranslations();

	// Fetch categories for the modal
	const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();

	const handleProductCreated = (newProduct: Product) => {
		setIsModalOpen(false);
		if (onProductCreated) {
			onProductCreated(newProduct);
		}
	};

	return (
		<>
			<Button onClick={() => setIsModalOpen(true)} className="w-fit">
				<PlusCircleIcon className="h-4 w-4" />
				{t("createProduct")}
			</Button>

			<CreateProductModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onCreate={handleProductCreated}
				categories={categories}
			/>
		</>
	);
}
