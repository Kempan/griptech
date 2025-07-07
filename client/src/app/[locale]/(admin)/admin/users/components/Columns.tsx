// client/src/app/[locale]/(admin)/admin/users/components/Columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { User } from "@/app/types";

export const createColumns = (
	t: (key: string) => string
): ColumnDef<User>[] => [
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
		accessorKey: "email",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("email")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
	},
	{
		accessorKey: "roles",
		header: t("roles"),
		cell: ({ row }) => {
			const roles = row.original.roles || [];
			return (
				<div className="flex flex-wrap gap-1">
					{roles.map((role) => (
						<span
							key={role}
							className={`px-2 py-0.5 text-xs font-medium rounded ${
								role === "admin"
									? "bg-purple-100 text-purple-800"
									: "bg-blue-100 text-blue-800"
							}`}
						>
							{t(role)}
						</span>
					))}
					{roles.length === 0 && (
						<span className="text-gray-500 italic">{t("none")}</span>
					)}
				</div>
			);
		},
	},
];
