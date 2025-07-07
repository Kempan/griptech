// client/src/app/[locale]/(admin)/admin/orders/page.tsx
import { Suspense } from "react";
import {
	getAdminOrders,
	getOrderStatistics,
} from "@/app/actions/admin/orderActions";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import { OrderStatus } from "@/app/types";
import OrdersClient from "./components/OrdersClient";
import StatsCards from "./components/StatsCards";
import OrderFilterBar from "./components/OrderFilterBar";
import { LoadingSkeleton } from "@/app/[locale]/(components)/LoadingSkeleton";
import { getTranslations } from "next-intl/server";

interface OrdersPageProps {
	searchParams: Promise<{
		search?: string;
		page?: string;
		status?: OrderStatus;
	}>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
	const t = await getTranslations();
	const resolvedSearchParams = await searchParams;
	const { search, page, status } = resolvedSearchParams;
	const pageSize = 10;

	// Statistics can be fetched independently
	const statistics = await getOrderStatistics();

	return (
		<div className="mx-auto pb-4 w-full">
			<ServerHeader text={t("orders")} />

			{/* Stats Cards are pure server components */}
			<div className="my-6">
				<StatsCards statistics={statistics} />
			</div>

			{/* Filter Bar - client component for search/filtering */}
			<OrderFilterBar initialStatus={status} initialSearch={search} />

			{/* Orders Table with suspense boundary */}
			<Suspense fallback={<LoadingSkeleton />}>
				<OrdersTable
					page={page ? parseInt(page) : 1}
					pageSize={pageSize}
					status={status}
					search={search}
				/>
			</Suspense>
		</div>
	);
}

// Server Component for Orders Table
async function OrdersTable({
	page,
	pageSize,
	status,
	search,
}: {
	page: number;
	pageSize: number;
	status?: OrderStatus;
	search?: string;
}) {
	// Fetch orders data
	const { orders, totalCount } = await getAdminOrders({
		page,
		pageSize,
		status,
		search,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	return (
		<OrdersClient
			initialOrders={orders}
			totalCount={totalCount}
			currentPage={page}
			pageSize={pageSize}
			initialStatus={status}
			initialSearch={search}
		/>
	);
}
