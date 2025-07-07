"use client";

import { useState, useEffect } from "react";
import { getUserOrders } from "@/app/actions/admin/userActions";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import Link from "next/link";
import { Button } from "@/shadcn/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shadcn/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/shadcn/components/ui/pagination";
import { Badge } from "@/shadcn/components/ui/badge";
import { useTranslations } from "next-intl";

interface UserOrdersProps {
	userId: number;
	locale: string;
}

interface Order {
	id: number;
	orderNumber: string;
	status: string;
	total: number;
	currency: string;
	createdAt: string;
	shippedAt?: string | null;
	paidAt?: string | null;
	customerName: string;
	customerEmail: string;
}

export function UserOrders({ userId, locale }: UserOrdersProps) {
	const t = useTranslations();
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		const fetchOrders = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await getUserOrders(userId);

				if (response && response.orders) {
					setOrders(response.orders);
					setTotalPages(response.pageCount || 1);
					setCurrentPage(response.currentPage || 1);
				} else {
					setOrders([]);
					setError("No orders found");
				}
			} catch (err) {
				console.error("Error fetching user orders:", err);
				setError("Failed to load orders");
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrders();
	}, [userId, currentPage]);

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
				<span className="ml-2">{t("loadingOrders")}</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">{error}</p>
			</div>
		);
	}

	if (orders.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">{t("noOrdersFoundForThisUser")}</p>
			</div>
		);
	}

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t("orderNumber")}</TableHead>
						<TableHead>{t("date")}</TableHead>
						<TableHead>{t("status")}</TableHead>
						<TableHead>{t("total")}</TableHead>
						<TableHead className="text-right">{t("actions")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{orders.map((order) => (
						<TableRow key={order.id}>
							<TableCell className="font-medium">{order.orderNumber}</TableCell>
							<TableCell>{formatDateDisplay(order.createdAt)}</TableCell>
							<TableCell>
								<Badge variant={getStatusBadgeVariant(order.status) as any}>
									{order.status}
								</Badge>
							</TableCell>
							<TableCell>
								{formatCurrency(order.total, order.currency)}
							</TableCell>
							<TableCell className="text-right">
								<Link href={`/${locale}/admin/order/${order.id}`}>
									<Button size="sm" variant="outline">
										{t("view")}
									</Button>
								</Link>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

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
