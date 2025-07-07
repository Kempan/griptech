"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/app/types";
import OrderTable from "@/app/[locale]/(store)/orders/components/OrderTable";
import { useTranslations } from "next-intl";

interface OrdersClientProps {
	initialOrders: Order[];
	totalCount: number;
	currentPage: number;
	pageSize: number;
	initialStatus?: OrderStatus;
	initialSearch?: string;
}

export default function OrdersClient({
	initialOrders,
	totalCount,
	currentPage,
	pageSize,
	initialStatus,
	initialSearch,
}: OrdersClientProps) {
	const t = useTranslations();
	// State for managing orders
	const [orders, setOrders] = useState<Order[]>(initialOrders);

	// Update orders when initialOrders change
	useEffect(() => {
		setOrders(initialOrders);
	}, [initialOrders]);

	return (
		<div className="mt-6">
			{orders.length === 0 ? (
				<div className="text-center py-12 bg-gray-50 rounded-lg">
					<h3 className="text-lg font-medium text-gray-700">
						{t("NoOrdersFound")}
					</h3>
					<p>{t("YouHavenTPlacedAnyOrdersYet")}</p>
				</div>
			) : (
				<OrderTable
					orders={orders}
					totalCount={totalCount}
					pageSize={pageSize}
				/>
			)}
		</div>
	);
}
