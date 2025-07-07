// client/src/app/[locale]/(admin)/admin/products/components/Columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Product } from "@/app/types";

export const createColumns = (
	t: (key: string) => string
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
			const stock = row.getValue("stockQuantity") as number | null;
			return <span>{stock ?? "N/A"}</span>;
		},
	},
];
