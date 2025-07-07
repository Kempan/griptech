// client/src/app/[locale]/(admin)/admin/orders/components/OrdersClient.tsx
"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/app/types";
import OrderTable from "./OrderTable";

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
	// State for managing orders
	const [orders, setOrders] = useState<Order[]>(initialOrders);

	// Update orders when initialOrders change
	useEffect(() => {
		setOrders(initialOrders);
	}, [initialOrders]);

	return (
		<div className="mt-6">
			{/* Orders Table */}
			<OrderTable orders={orders} totalCount={totalCount} pageSize={pageSize} />
		</div>
	);
}
