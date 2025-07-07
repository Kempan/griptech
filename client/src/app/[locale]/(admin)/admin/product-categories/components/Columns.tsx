// client/src/app/[locale]/(admin)/admin/product-categories/components/Columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { ProductCategory } from "@/app/types";

export const createColumns = (
	t: (key: string) => string
): ColumnDef<ProductCategory>[] => [
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
		accessorKey: "slug",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("slug")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
	},
	{
		accessorKey: "parentId",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("parentId")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const parentId = row.getValue("parentId");
			return parentId ? parentId : "-";
		},
	},
];
