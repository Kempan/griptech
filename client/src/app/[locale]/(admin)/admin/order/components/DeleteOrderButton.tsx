"use client";

// client/src/app/[locale]/(admin)/admin/order/components/DeleteOrderButton.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOrder } from "@/app/actions/admin/orderActions";
import { Button } from "@/shadcn/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface DeleteOrderButtonProps {
	orderId: number;
	locale: string;
}

export default function DeleteOrderButton({
	orderId,
	locale,
}: DeleteOrderButtonProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);
	const t = useTranslations();
	const handleDelete = async () => {
		if (
			!confirm(
				t("deleteOrderConfirmation")
			)
		) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteOrder(orderId);
			toast.success(t("orderDeletedSuccessfully"));
			router.push(`/${locale}/admin/orders`);
		} catch (error) {
			console.error("Failed to delete order:", error);
			toast.error(t("failedToDeleteOrder"));
			setIsDeleting(false);
		}
	};

	return (
		<Button variant="error" onClick={handleDelete} disabled={isDeleting}>
			{isDeleting ? t("deleting") : t("deleteOrder")}
		</Button>
	);
}
