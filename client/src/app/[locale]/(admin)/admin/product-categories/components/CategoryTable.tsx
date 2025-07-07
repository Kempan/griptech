// client/src/app/[locale]/(admin)/admin/product-categories/components/CategoryTable.tsx
"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { DataTable } from "./DataTable";
import { createColumns } from "./Columns";
import { ProductCategory } from "@/app/types";
import { useDeleteCategoryMutation } from "@/app/state/api";
import { Button } from "@/shadcn/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import { Trash2 } from "lucide-react";

export default function CategoryTable({
	categories,
	allCategories,
	totalCount,
	pageSize,
	onCategoryDeleted,
}: {
	categories: ProductCategory[];
	allCategories: ProductCategory[];
	totalCount: number;
	pageSize: number;
	onCategoryDeleted?: (id: number) => void;
}) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const params = useParams();
	const locale = params.locale as string;
	const [deleteCategory] = useDeleteCategoryMutation();
	const t = useTranslations();

	// State for managing categories after deletion
	const [tableData, setTableData] = useState<ProductCategory[]>(categories);
	// State for managing selected categories
	const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

	useEffect(() => {
		setTableData(categories);
		// Reset selections when categories change
		setSelectedCategories([]);
	}, [categories]);

	// Get the current page from searchParams or default to 1
	const currentPage = Number(searchParams.get("page")) || 1;

	// Handle page change
	const handlePageChange = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(page));
		router.push(`?${params.toString()}`, { scroll: false });
	};

	// Handle row click to navigate to category detail
	const handleRowClick = (category: ProductCategory) => {
		router.push(`/${locale}/admin/product-category/${category.id}`);
	};

	// Handle single category selection
	const handleSelectCategory = (categoryId: number, checked: boolean) => {
		if (checked) {
			setSelectedCategories([...selectedCategories, categoryId]);
		} else {
			setSelectedCategories(
				selectedCategories.filter((id) => id !== categoryId)
			);
		}
	};

	// Handle select all categories
	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			const allIds = tableData
				.map((cat) => cat.id)
				.filter((id): id is number => id !== null);
			setSelectedCategories(allIds);
		} else {
			setSelectedCategories([]);
		}
	};

	// Check if all categories are selected
	const isAllSelected =
		tableData.length > 0 &&
		selectedCategories.length ===
			tableData.filter((cat) => cat.id !== null).length;

	// Check if some categories are selected
	const isSomeSelected = selectedCategories.length > 0 && !isAllSelected;

	// Handle delete single category
	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this category?")) return;

		try {
			await deleteCategory(id).unwrap();
			console.log(
				`✅ Category with ID ${id} was successfully deleted from the database.`
			);

			// Remove the deleted category from local state
			setTableData((prev) => prev.filter((category) => category.id !== id));
			// Remove from selected if it was selected
			setSelectedCategories((prev) => prev.filter((catId) => catId !== id));

			// Call the parent callback if it exists
			if (onCategoryDeleted) {
				onCategoryDeleted(id);
			} else {
				window.location.reload(); // fallback if no callback
			}
		} catch (error) {
			alert("Failed to delete category.");
		}
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedCategories.length === 0) return;

		const confirmMessage =
			selectedCategories.length === 1
				? "Are you sure you want to delete this category?"
				: `Are you sure you want to delete ${selectedCategories.length} categories?`;

		if (!confirm(confirmMessage)) return;

		try {
			// Delete all selected categories
			const deletePromises = selectedCategories.map((id) =>
				deleteCategory(id).unwrap()
			);
			await Promise.all(deletePromises);

			console.log(
				`✅ ${selectedCategories.length} categories were successfully deleted.`
			);

			// Remove deleted categories from local state
			setTableData((prev) =>
				prev.filter(
					(category) => category.id && !selectedCategories.includes(category.id)
				)
			);

			// Clear selections
			setSelectedCategories([]);

			// Call parent callback for each deleted category
			if (onCategoryDeleted) {
				selectedCategories.forEach((id) => onCategoryDeleted(id));
			} else {
				window.location.reload();
			}
		} catch (error) {
			alert("Failed to delete some categories.");
		}
	};

	// Get translated columns
	const columns = createColumns(t);

	// Add checkbox column at the beginning
	const checkboxColumn: ColumnDef<ProductCategory> = {
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
				checked={selectedCategories.includes(row.original.id ?? 0)}
				onCheckedChange={(checked) =>
					handleSelectCategory(row.original.id ?? 0, checked as boolean)
				}
				aria-label="Select row"
				onClick={(e) => e.stopPropagation()} // Prevent row click
			/>
		),
		enableSorting: false,
		enableHiding: false,
	};

	// Add actions column at the end
	const actionsColumn: ColumnDef<ProductCategory> = {
		id: "actions",
		header: t("actions"),
		cell: ({ row }) => (
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
		),
	};

	// Combine all columns
	const enhancedColumns: ColumnDef<ProductCategory>[] = [
		checkboxColumn,
		...columns,
		actionsColumn,
	];

	return (
		<div className="space-y-4">
			{/* Bulk actions bar - only show when items are selected */}
			{selectedCategories.length > 0 && (
				<div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
					<span className="text-sm text-muted-foreground">
						{selectedCategories.length} {t("Selected")}
					</span>
					<Button variant="error" size="sm" onClick={handleBulkDelete}>
						<Trash2 className="h-4 w-4 mr-2" />
						{t("delete")} ({selectedCategories.length})
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
