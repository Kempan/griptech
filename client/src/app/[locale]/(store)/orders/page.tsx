// client/src/app/[locale]/(store)/orders/page.tsx
import { Suspense } from "react";
import { getCustomerOrders } from "@/app/actions/orderActions";
import { OrderStatus } from "@/app/types";
import OrdersClient from "./components/OrdersClient";
import OrderFilterBar from "./components/OrderFilterBar";
import { LoadingSkeleton } from "@/app/[locale]/(components)/LoadingSkeleton";
import { redirect } from "next/navigation";
import { getAuthStatus } from "@/app/actions/authActions";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import { getTranslations } from "next-intl/server";

interface OrdersPageProps {
	searchParams: Promise<{
		search?: string;
		page?: string;
		status?: OrderStatus;
	}>;
	params: Promise<{
		locale: string;
	}>;
}

export default async function OrdersPage({
	searchParams,
	params,
}: OrdersPageProps) {
	const t = await getTranslations();
	const { page, status, search } = await searchParams;
	const { locale } = await params;
	const pageSize = 10;

	// Get user session
	const session = await getAuthStatus();

	// Redirect to login if not authenticated
	if (!session?.isLoggedIn) {
		redirect(`/${locale}/login?callbackUrl=/${locale}/orders`);
	}

	return (
		<SectionWrapper>
			<InnerWrapper>
				<div className="max-w-7xl mx-auto py-8">
					<h1 className="text-3xl font-bold tracking-tight mb-6">{t("myOrders")}</h1>

					{/* Filter Bar - client component for search/filtering */}
					<OrderFilterBar initialStatus={status} initialSearch={search} />

					{/* Orders Table with suspense boundary */}
					<Suspense fallback={<LoadingSkeleton />}>
						<OrdersTable
							userId={session.userId || 0}
							page={page ? parseInt(page) : 1}
							pageSize={pageSize}
							status={status}
							search={search}
						/>
					</Suspense>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}

// Server Component for Orders Table
async function OrdersTable({
	userId,
	page,
	pageSize,
	status,
	search,
}: {
	userId: number;
	page: number;
	pageSize: number;
	status?: OrderStatus;
	search?: string;
}) {
	// Fetch user's orders data
	const { orders, totalCount } = await getCustomerOrders({
		userId,
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
