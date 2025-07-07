// client/src/app/[locale]/(admin)/admin/orders/components/Columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu";
import { Order, OrderStatus } from "@/app/types";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { OrderStatusBadge } from "@/app/[locale]/(store)/orders/components/OrderStatusBadge";
import Link from "next/link";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/admin/orderActions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// Component for order number cell
function OrderNumberCell({ order }: { order: Order }) {
	return (
		<Link
			href={`/admin/order/${order.id}`}
			className="font-medium text-primary hover:underline"
		>
			{order.orderNumber}
		</Link>
	);
}

// Component for actions dropdown
function ActionsCell({ order }: { order: Order }) {
	const router = useRouter();
	const [isUpdating, setIsUpdating] = useState(false);
	const t = useTranslations();
	const handleStatusUpdate = async (newStatus: OrderStatus) => {
		setIsUpdating(true);
		try {
			const result = await updateOrderStatus(order.id, newStatus);
			if (result) {
				toast.success(t("orderStatusUpdatedSuccessfully"));
				router.refresh();
			} else {
				toast.error(t("failedToUpdateOrderStatus"));
			}
		} catch (error) {
			toast.error(t("anErrorOccurred"));
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
					<span className="sr-only">{t("openMenu")}</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
				<DropdownMenuItem
					onClick={() => router.push(`/admin/order/${order.id}`)}
				>
					{t("viewDetails")}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel>{t("updateStatus")}</DropdownMenuLabel>
				<DropdownMenuItem
					onClick={() => handleStatusUpdate(OrderStatus.PROCESSING)}
					disabled={order.status === "PROCESSING"}
				>
					{t("markAsProcessing")}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => handleStatusUpdate(OrderStatus.COMPLETED)}
					disabled={order.status === "COMPLETED"}
				>
					{t("markAsCompleted")}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => handleStatusUpdate(OrderStatus.CANCELLED)}
					disabled={order.status === "CANCELLED"}
				>
					{t("markAsCancelled")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export const createAdminOrderColumns = (
	t: (key: string) => string
): ColumnDef<Order>[] => [
	{
		accessorKey: "orderNumber",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("orderNumber")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <OrderNumberCell order={row.original} />,
	},
	{
		accessorKey: "customerName",
		header: t("customer"),
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("date")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => formatDateDisplay(row.getValue("createdAt")),
	},
	{
		accessorKey: "status",
		header: t("status"),
		cell: ({ row }) => (
			<OrderStatusBadge status={row.getValue("status") as any} />
		),
	},
	{
		accessorKey: "total",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="p-0"
			>
				{t("total")} <ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) =>
			formatCurrency(row.getValue("total"), row.original.currency || "SEK"),
	},
	{
		id: "actions",
		cell: ({ row }) => <ActionsCell order={row.original} />,
	},
];
