import { OrderStatus } from "@/app/types";
import { cn } from "@/shadcn/lib/utils";

interface OrderStatusBadgeProps {
	status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	const statusConfig = {
		PENDING: {
			color: "bg-yellow-100 text-yellow-800 border-yellow-200",
			label: "Pending",
		},
		PROCESSING: {
			color: "bg-blue-100 text-blue-800 border-blue-200",
			label: "Processing",
		},
		ON_HOLD: {
			color: "bg-gray-100 text-gray-800 border-gray-200",
			label: "On Hold",
		},
		COMPLETED: {
			color: "bg-green-100 text-green-800 border-green-200",
			label: "Completed",
		},
		CANCELLED: {
			color: "bg-red-100 text-red-800 border-red-200",
			label: "Cancelled",
		},
		REFUNDED: {
			color: "bg-purple-100 text-purple-800 border-purple-200",
			label: "Refunded",
		},
		FAILED: {
			color: "bg-red-100 text-red-800 border-red-200",
			label: "Failed",
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

// Default export for backward compatibility
export default OrderStatusBadge;
