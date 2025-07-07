// client/src/app/[locale]/(admin)/admin/products/components/ProductTable.tsx
"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { DataTable } from "./DataTable";
import { createColumns } from "./Columns";
import { Product } from "@/app/types";
import { useDeleteProductMutation } from "@/app/state/api";
import { Button } from "@/shadcn/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import { Trash2, Eye } from "lucide-react";

export default function ProductTable({
	products,
	totalCount,
	pageSize,
	onProductDeleted,
}: {
	products: Product[];
	totalCount: number;
	pageSize: number;
	onProductDeleted?: (id: number) => void;
}) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const params = useParams();
	const locale = params.locale as string;
	const [deleteProduct] = useDeleteProductMutation();
	const t = useTranslations();

	// State for managing products
	const [tableData, setTableData] = useState<Product[]>(products);
	// State for managing selected products
	const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

	// Update table data when products prop changes
	useEffect(() => {
		setTableData(products);
		// Reset selections when products change
		setSelectedProducts([]);
	}, [products]);

	// Get the current page from searchParams or default to 1
	const currentPage = Number(searchParams.get("page")) || 1;

	// Handle page change
	const handlePageChange = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(page));
		router.push(`?${params.toString()}`);
	};

	// Handle row click to navigate to product detail
	const handleRowClick = (product: Product) => {
		router.push(`/${locale}/admin/product/${product.id}`);
	};

	// Handle single product selection
	const handleSelectProduct = (productId: number, checked: boolean) => {
		if (checked) {
			setSelectedProducts([...selectedProducts, productId]);
		} else {
			setSelectedProducts(selectedProducts.filter((id) => id !== productId));
		}
	};

	// Handle select all products
	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			const allIds = tableData
				.map((product) => product.id)
				.filter((id): id is number => id !== undefined);
			setSelectedProducts(allIds);
		} else {
			setSelectedProducts([]);
		}
	};

	// Check if all products are selected
	const isAllSelected =
		tableData.length > 0 &&
		selectedProducts.length ===
			tableData.filter((product) => product.id !== undefined).length;

	// Check if some products are selected
	const isSomeSelected = selectedProducts.length > 0 && !isAllSelected;

	// Handle delete single product
	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this product?")) return;

		try {
			await deleteProduct(id).unwrap();
			console.log(`✅ Product with ID ${id} was successfully deleted.`);

			// Remove the deleted product from local state
			setTableData((prev) => prev.filter((product) => product.id !== id));
			// Remove from selected if it was selected
			setSelectedProducts((prev) =>
				prev.filter((productId) => productId !== id)
			);

			// Call the parent callback if it exists
			if (onProductDeleted) {
				onProductDeleted(id);
			} else {
				window.location.reload(); // fallback if no callback
			}
		} catch (error) {
			alert("Failed to delete product.");
		}
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedProducts.length === 0) return;

		const confirmMessage =
			selectedProducts.length === 1
				? "Are you sure you want to delete this product?"
				: `Are you sure you want to delete ${selectedProducts.length} products?`;

		if (!confirm(confirmMessage)) return;

		try {
			// Delete all selected products
			const deletePromises = selectedProducts.map((id) =>
				deleteProduct(id).unwrap()
			);
			await Promise.all(deletePromises);

			console.log(
				`✅ ${selectedProducts.length} products were successfully deleted.`
			);

			// Remove deleted products from local state
			setTableData((prev) =>
				prev.filter(
					(product) => product.id && !selectedProducts.includes(product.id)
				)
			);

			// Clear selections
			setSelectedProducts([]);

			// Call parent callback for each deleted product
			if (onProductDeleted) {
				selectedProducts.forEach((id) => onProductDeleted(id));
			} else {
				window.location.reload();
			}
		} catch (error) {
			alert("Failed to delete some products.");
		}
	};

	// Get translated columns
	const columns = createColumns(t);

	// Add checkbox column at the beginning
	const checkboxColumn: ColumnDef<Product> = {
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={isAllSelected}
				indeterminate={isSomeSelected}
				onCheckedChange={handleSelectAll}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={selectedProducts.includes(row.original.id ?? 0)}
				onCheckedChange={(checked) =>
					handleSelectProduct(row.original.id ?? 0, checked as boolean)
				}
				aria-label="Select row"
				onClick={(e) => e.stopPropagation()} // Prevent row click
			/>
		),
		enableSorting: false,
		enableHiding: false,
	};

	// Add actions column at the end
	const actionsColumn: ColumnDef<Product> = {
		id: "actions",
		header: t("actions"),
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Button
					size="sm"
					variant="ghost"
					onClick={(e) => {
						e.stopPropagation(); // Prevent row click
						router.push(`/${locale}/admin/product/${row.original.id}`);
					}}
				>
					<Eye className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation(); // Prevent row click
						handleDelete(row.original.id ?? 0);
					}}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		),
	};

	// Combine all columns
	const enhancedColumns: ColumnDef<Product>[] = [
		checkboxColumn,
		...columns,
		actionsColumn,
	];

	return (
		<div className="space-y-4">
			{/* Bulk actions bar - only show when items are selected */}
			{selectedProducts.length > 0 && (
				<div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
					<span className="text-sm text-muted-foreground">
						{selectedProducts.length} {t("Selected")}
					</span>
					<Button variant="error" size="sm" onClick={handleBulkDelete}>
						<Trash2 className="h-4 w-4 mr-2" />
						{t("delete")} ({selectedProducts.length})
					</Button>
				</div>
			)}

			<DataTable
				columns={enhancedColumns}
				data={tableData}
				totalCount={totalCount}
				currentPage={currentPage}
				pageSize={pageSize}
				onPageChange={handlePageChange}
				onRowClick={handleRowClick}
			/>
		</div>
	);
}
