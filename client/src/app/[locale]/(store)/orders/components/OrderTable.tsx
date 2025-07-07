"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { DataTable } from "@/app/[locale]/(admin)/admin/products/components/DataTable";
import { orderColumns } from "@/app/[locale]/(store)/orders/components/Columns";
import { Order } from "@/app/types";
import { useState, useEffect } from "react";

export default function OrderTable({
	orders,
	totalCount,
	pageSize,
}: {
	orders: Order[];
	totalCount: number;
	pageSize: number;
}) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const params = useParams();
	const locale = params.locale as string;

	// State for managing orders
	const [tableData, setTableData] = useState<Order[]>(orders);

	// Update table data when orders prop changes
	useEffect(() => {
		setTableData(orders);
	}, [orders]);

	// Get the current page from searchParams or default to 1
	const currentPage = Number(searchParams.get("page")) || 1;

	// Handle page change
	const handlePageChange = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(page));
		router.push(`?${params.toString()}`);
	};

	// Handle row click to navigate to order detail
	const handleRowClick = (order: Order) => {
		router.push(`/${locale}/order/${order.id}`);
	};

	return (
		<DataTable
			columns={orderColumns}
			data={tableData}
			totalCount={totalCount}
			currentPage={currentPage}
			pageSize={pageSize}
			onPageChange={handlePageChange}
			onRowClick={handleRowClick}
		/>
	);
}
