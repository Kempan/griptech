"use client";

// client/src/app/[locale]/(admin)/admin/order/components/OrderStatusUpdater.tsx
import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/admin/orderActions";
import { Order, OrderStatus } from "@/app/types";
import { Button } from "@/shadcn/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shadcn/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface OrderStatusUpdaterProps {
	order: Order;
}

export default function OrderStatusUpdater({ order }: OrderStatusUpdaterProps) {
	const router = useRouter();
	const [status, setStatus] = useState<OrderStatus>(order.status);
	const [isUpdating, setIsUpdating] = useState(false);
	const t = useTranslations();
	const handleUpdate = async () => {
		if (status === order.status) return;

		setIsUpdating(true);
		try {
			await updateOrderStatus(order.id, status);
			toast.success(t("orderStatusUpdatedSuccessfully"));
			router.refresh(); // Refresh the page to show updated data
		} catch (error) {
			console.error("Error updating order status:", error);
			toast.error(t("failedToUpdateOrderStatus"));
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Select
				value={status}
				onValueChange={(value) => setStatus(value as OrderStatus)}
			>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={t("status")} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="PENDING">{t("pending")}</SelectItem>
					<SelectItem value="PROCESSING">{t("processing")}</SelectItem>
					<SelectItem value="ON_HOLD">{t("onHold")}</SelectItem>
					<SelectItem value="COMPLETED">{t("completed")}</SelectItem>
					<SelectItem value="CANCELLED">{t("cancelled")}</SelectItem>
					<SelectItem value="REFUNDED">{t("refunded")}</SelectItem>
					<SelectItem value="FAILED">{t("failed")}</SelectItem>
				</SelectContent>
			</Select>

			<Button
				onClick={handleUpdate}
				disabled={status === order.status || isUpdating}
				size="sm"
			>
				{isUpdating ? t("updating") : t("update")}
			</Button>
		</div>
	);
}
