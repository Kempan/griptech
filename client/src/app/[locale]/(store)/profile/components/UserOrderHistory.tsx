// client/src/app/[locale]/(store)/account/profile/components/UserOrderHistory.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { getCustomerOrders } from "@/app/actions/orderActions";
import { getAuthStatus } from "@/app/actions/authActions";
import { Order } from "@/app/types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shadcn/components/ui/table";
import { Button } from "@/shadcn/components/ui/button";
import { Badge } from "@/shadcn/components/ui/badge";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/shadcn/components/ui/pagination";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { Package } from "lucide-react";

interface UserOrderHistoryProps {
	locale: string;
}

export default function UserOrderHistory({ locale }: UserOrderHistoryProps) {
	const t = useTranslations();
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	const loadOrders = useCallback(async () => {
		setIsLoading(true);
		try {
			const authStatus = await getAuthStatus();
			if (!authStatus.isLoggedIn || !authStatus.userId) {
				setOrders([]);
				return;
			}

			const response = await getCustomerOrders({
				userId: authStatus.userId,
				page: currentPage,
				pageSize: 10,
			});

			setOrders(response.orders);
			setTotalCount(response.totalCount);
			setTotalPages(Math.ceil(response.totalCount / 10));
		} catch (error) {
			console.error("Error loading orders:", error);
			setOrders([]);
		} finally {
			setIsLoading(false);
		}
	}, [currentPage]);

	const getStatusBadgeVariant = (status: string) => {
		switch (status.toUpperCase()) {
			case "COMPLETED":
				return "success";
			case "PROCESSING":
				return "warning";
			case "PENDING":
				return "outline";
			case "CANCELLED":
				return "destructive";
			case "REFUNDED":
				return "secondary";
			default:
				return "default";
		}
	};

	useEffect(() => {
		loadOrders();
	}, [loadOrders]);

	if (isLoading) {
		return <OrdersSkeleton />;
	}

	if (orders.length === 0) {
		return (
			<div className="text-center py-12">
				<Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h3 className="text-lg font-medium mb-2">{t("NoOrdersYet")}</h3>
				<p className="text-gray-500 mb-4">{t("StartShoppingToSeeOrders")}</p>
				<Link href={`/${locale}/products`}>
					<Button>{t("StartShopping")}</Button>
				</Link>
			</div>
		);
	}

	return (
		<div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("OrderNumber")}</TableHead>
							<TableHead>{t("Date")}</TableHead>
							<TableHead>{t("Status")}</TableHead>
							<TableHead>{t("Total")}</TableHead>
							<TableHead className="text-right">{t("Actions")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.map((order) => (
							<TableRow key={order.id}>
								<TableCell className="font-medium">
									{order.orderNumber}
								</TableCell>
								<TableCell>{formatDateDisplay(order.createdAt)}</TableCell>
								<TableCell>
									<Badge variant={getStatusBadgeVariant(order.status) as any}>
										{t(order.status)}
									</Badge>
								</TableCell>
								<TableCell>
									{formatCurrency(order.total, order.currency)}
								</TableCell>
								<TableCell className="text-right">
									<Link href={`/${locale}/account/orders/${order.id}`}>
										<Button size="sm" variant="outline">
											{t("ViewDetails")}
										</Button>
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{totalPages > 1 && (
				<Pagination className="mt-4">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (currentPage > 1) setCurrentPage(currentPage - 1);
								}}
								className={
									currentPage === 1 ? "pointer-events-none opacity-50" : ""
								}
							/>
						</PaginationItem>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<PaginationItem key={page}>
								<PaginationLink
									href="#"
									onClick={(e) => {
										e.preventDefault();
										setCurrentPage(page);
									}}
									isActive={page === currentPage}
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						))}

						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (currentPage < totalPages) setCurrentPage(currentPage + 1);
								}}
								className={
									currentPage === totalPages
										? "pointer-events-none opacity-50"
										: ""
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}

function OrdersSkeleton() {
	return (
		<div className="space-y-4">
			{[...Array(3)].map((_, i) => (
				<div
					key={i}
					className="flex justify-between items-center p-4 border rounded"
				>
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-32" />
					</div>
					<Skeleton className="h-8 w-20" />
				</div>
			))}
		</div>
	);
}
