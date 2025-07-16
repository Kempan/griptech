// client/src/app/[locale]/(admin)/admin/products/components/ProductsClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/app/types";
import CreateProduct from "./CreateProduct";
import ProductTable from "./ProductTable";
import SearchBar from "@/app/[locale]/(components)/SearchBar";
import { useTranslations } from "next-intl";

interface ProductsClientProps {
	initialProducts: Product[];
	totalCount: number;
	currentPage: number;
	pageSize: number;
}

export default function ProductsClient({
	initialProducts,
	totalCount,
	currentPage,
	pageSize,
}: ProductsClientProps) {
	const [products, setProducts] = useState<Product[]>(initialProducts);
	const searchParams = useSearchParams();
	const t = useTranslations();

	// Update products when initialProducts or searchParams change
	useEffect(() => {
		setProducts(initialProducts);
	}, [initialProducts, searchParams]);

	// Handle new product creation
	const handleProductCreated = (newProduct: Product) => {
		setProducts((prevProducts) => [...prevProducts, newProduct]);
		console.log(`✅ New product added: ${newProduct.name}`);
	};

	// Handle product deletion
	const handleProductDeleted = (id: number) => {
		setProducts((prevProducts) =>
			prevProducts.filter((product) => product.id !== id)
		);
		console.log(`✅ Product with ID ${id} deleted`);
	};

	console.log("🔵 Products:", products);

	return (
		<div className="flex flex-col gap-4">
			<CreateProduct onProductCreated={handleProductCreated} />
			<SearchBar placeholder={t("search")} />
			<ProductTable
				products={products}
				totalCount={totalCount}
				pageSize={pageSize}
				onProductDeleted={handleProductDeleted}
			/>
		</div>
	);
}
