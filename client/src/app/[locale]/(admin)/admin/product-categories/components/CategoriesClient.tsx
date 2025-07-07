// client/src/app/[locale]/(admin)/admin/product-categories/components/CategoriesClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCategory } from "@/app/types";
import CreateCategory from "./CreateCategory";
import CategoryTable from "./CategoryTable";
import SearchBar from "@/app/[locale]/(components)/SearchBar";
import { useTranslations } from "next-intl";

interface CategoriesClientProps {
	initialCategories: ProductCategory[];
	allCategories: ProductCategory[];
	totalCount: number;
	currentPage: number;
	pageSize: number;
}

export default function CategoriesClient({
	initialCategories,
	allCategories,
	totalCount,
	currentPage,
	pageSize,
}: CategoriesClientProps) {
	const [categories, setCategories] =
		useState<ProductCategory[]>(initialCategories);
	const searchParams = useSearchParams();
	const t = useTranslations();

	useEffect(() => {
		setCategories(initialCategories);
	}, [initialCategories, searchParams]);

	// Handle new category creation
	const handleCategoryCreated = (newCategory: ProductCategory) => {
		setCategories((prevCategories) => [...prevCategories, newCategory]);
		console.log(`✅ New category added: ${newCategory.name}`);
	};

	// Handle category deletion
	const handleCategoryDeleted = (id: number) => {
		setCategories((prevCategories) =>
			prevCategories.filter((category) => category.id !== id)
		);
		console.log(`✅ Category with ID ${id} deleted`);
	};

	return (
		<div className="flex flex-col gap-4">
			<CreateCategory
				categories={allCategories}
				onCategoryCreated={handleCategoryCreated}
			/>
			<SearchBar placeholder={t("search")} />
			<CategoryTable
				categories={categories}
				allCategories={allCategories}
				totalCount={totalCount}
				pageSize={pageSize}
				onCategoryDeleted={handleCategoryDeleted}
			/>
		</div>
	);
}
