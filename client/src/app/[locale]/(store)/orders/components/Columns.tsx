// client/src/app/[locale]/(store)/orders/components/Columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Order } from "@/app/types";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { OrderStatusBadge } from "@/app/[locale]/(store)/orders/components/OrderStatusBadge";
import Link from "next/link";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import { useTranslations } from "next-intl";

// Create a separate component for the order number cell
function OrderNumberCell({ order }: { order: Order }) {
	const orderNumber = order.orderNumber;
	const orderId = order.id;

	return (
		<Link
			href={`/order/${orderId}`}
			className="font-medium text-primary hover:underline"
		>
			{orderNumber}
		</Link>
	);
}

// Create a separate component for the actions cell
function ActionsCell({ order }: { order: Order }) {
	const orderId = order.id;
	const t = useTranslations();
	return (
		<Link
			href={`/order/${orderId}`}
			className="text-sm text-primary font-medium hover:underline"
		>
			{t("viewDetails")}
		</Link>
	);
}

export const orderColumns: ColumnDef<Order>[] = [
	{
		accessorKey: "orderNumber",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				Order # <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <OrderNumberCell order={row.original} />,
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				Date <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as string;
			return <span>{formatDateDisplay(date)}</span>;
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				Status <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			return <OrderStatusBadge status={row.getValue("status") as any} />;
		},
	},
	{
		accessorKey: "total",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				Total <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const total = row.getValue("total") as number;
			const currency = row.original.currency || "SEK";
			return <span>{formatCurrency(total, currency)}</span>;
		},
	},
	{
		accessorKey: "orderItems",
		header: "Items",
		cell: ({ row }) => {
			const items = row.original.orderItems || [];
			return <span>{items.length}</span>;
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => <ActionsCell order={row.original} />,
	},
];
