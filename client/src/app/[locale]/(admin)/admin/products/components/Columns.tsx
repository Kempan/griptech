// client/src/app/[locale]/(admin)/admin/products/components/Columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Package } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Product } from "@/app/types";
import { isOutOfStock, hasLowStock, getStockStatusColor, getStockDisplayText } from "@/app/lib/utils/stock-utils";

export const createColumns = (
	t: (key: string) => string,
	onStockManage?: (product: Product) => void
): ColumnDef<Product>[] => [
	{
		accessorKey: "id",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("id")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
	},
	{
		accessorKey: "name",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("name")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
	},
	{
		accessorKey: "price",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("price")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const price = row.getValue("price") as number;
			return <span>${price.toFixed(2)}</span>;
		},
	},
	{
		accessorKey: "stockQuantity",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("stock")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const product = row.original;
			
			// If stock management is disabled, show appropriate message
			if (!product.enableStockManagement) {
				return (
					<div className="flex items-center gap-2">
						<span className="text-gray-500">Stock management disabled</span>
						{onStockManage && (
							<Button
								size="sm"
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									onStockManage(product);
								}}
								className="h-6 w-6 p-0"
							>
								<Package className="h-3 w-3" />
							</Button>
						)}
					</div>
				);
			}
			
			const stockClass = getStockStatusColor(product);
			const displayText = getStockDisplayText(product, t);
			
			return (
				<div className="flex items-center gap-2">
					<span className={stockClass}>
						{displayText}
					</span>
					{onStockManage && (
						<Button
							size="sm"
							variant="ghost"
							onClick={(e) => {
								e.stopPropagation();
								onStockManage(product);
							}}
							className="h-6 w-6 p-0"
						>
							<Package className="h-3 w-3" />
						</Button>
					)}
				</div>
			);
		},
	},
];
