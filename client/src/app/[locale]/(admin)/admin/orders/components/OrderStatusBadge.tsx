// client/src/app/[locale]/(admin)/admin/orders/components/OrderStatusBadge.tsx
"use client";

import { OrderStatus } from "@/app/types";
import { cn } from "@/shadcn/lib/utils";
import { useTranslations } from "next-intl";

interface OrderStatusBadgeProps {
	status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	const t = useTranslations();

	const statusConfig = {
		PENDING: {
			color: "bg-yellow-100 text-yellow-800 border-yellow-200",
			label: t("pending"),
		},
		PROCESSING: {
			color: "bg-blue-100 text-blue-800 border-blue-200",
			label: t("processing"),
		},
		ON_HOLD: {
			color: "bg-gray-100 text-gray-800 border-gray-200",
			label: t("onHold"),
		},
		COMPLETED: {
			color: "bg-green-100 text-green-800 border-green-200",
			label: t("completed"),
		},
		CANCELLED: {
			color: "bg-red-100 text-red-800 border-red-200",
			label: t("cancelled"),
		},
		REFUNDED: {
			color: "bg-purple-100 text-purple-800 border-purple-200",
			label: t("refunded"),
		},
		FAILED: {
			color: "bg-red-100 text-red-800 border-red-200",
			label: t("failed"),
		},
	};

	const config = statusConfig[status] || statusConfig.PENDING;

	return (
		<span
			className={cn(
				"px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-sm border",
				config.color
			)}
		>
			{config.label}
		</span>
	);
}
