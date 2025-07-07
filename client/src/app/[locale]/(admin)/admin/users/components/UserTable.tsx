// client/src/app/[locale]/(admin)/admin/users/components/UserTable.tsx
"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { DataTable } from "./DataTable";
import { createColumns } from "./Columns";
import { User } from "@/app/types";
import { Button } from "@/shadcn/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function UserTable({
	users,
	totalCount,
	pageSize,
}: {
	users: User[];
	totalCount: number;
	pageSize: number;
}) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const params = useParams();
	const locale = params.locale as string;
	const t = useTranslations();

	// State for managing users
	const [tableData, setTableData] = useState<User[]>(users);

	// Update table data when users prop changes
	useEffect(() => {
		setTableData(users);
	}, [users]);

	// Get the current page from searchParams or default to 1
	const currentPage = Number(searchParams.get("page")) || 1;

	// Handle page change
	const handlePageChange = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(page));
		router.push(`?${params.toString()}`);
	};

	// Handle row click to navigate to user detail
	const handleRowClick = (user: User) => {
		router.push(`/${locale}/admin/user/${user.id}`);
	};

	// Get translated columns
	const columns = createColumns(t);

	// ✅ Inject View Button as a Separate Column
	const enhancedColumns: ColumnDef<User>[] = [
		...columns,
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => (
				<Button
					size="sm"
					onClick={(e) => {
						e.stopPropagation(); // Prevent row click
						router.push(`/${locale}/admin/user/${row.original.id}`);
					}}
				>
					{t("view")}
				</Button>
			),
		},
	];

	return (
		<DataTable
			columns={enhancedColumns}
			data={tableData}
			totalCount={totalCount}
			currentPage={currentPage}
			pageSize={pageSize}
			onPageChange={handlePageChange}
			onRowClick={handleRowClick}
		/>
	);
}
