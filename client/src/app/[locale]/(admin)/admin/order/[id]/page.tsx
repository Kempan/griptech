// client/src/app/[locale]/(admin)/admin/order/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/app/actions/admin/orderActions";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import { Button } from "@/shadcn/components/ui/button";
import OrderDetailView from "../components/OrderDetailView";
import { getTranslations } from "next-intl/server";

interface OrderDetailProps {
	params: Promise<{
		id: string;
		locale: string;
	}>;
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
	const { id, locale } = await params;
	const orderId = parseInt(id, 10);
	const t = await getTranslations();
	try {
		// Fetch order data
		const order = await getOrderById(orderId);

		if (!order) {
			return notFound();
		}

		// Format dates on the server
		const formattedOrder = {
			...order,
			// Format dates as ISO strings that will be consistently parsed
			createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : "",
			updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : "",
			paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : "",
			shippedAt: order.shippedAt ? new Date(order.shippedAt).toISOString() : "",
		};

		return (
			<div className="flex flex-col">
				<div className="flex justify-between items-center">
					<ServerHeader text={`Order: ${order.orderNumber}`} />
					<Link href={`/${locale}/admin/orders`}>
						<Button variant="outline">{t("backToOrders")}</Button>
					</Link>
				</div>

				<OrderDetailView order={formattedOrder} locale={locale} />
			</div>
		);
	} catch (error) {
		console.error("Error fetching order:", error);
		return (
			<div className="flex flex-col">
				<ServerHeader text={t("orderDetail")} />
				<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
					<p className="text-red-500">{t("failedToLoadOrderDetails")}</p>
					<Link href={`/${locale}/admin/orders`} className="mt-4 inline-block">
						<Button variant="outline">{t("backToOrders")}</Button>
					</Link>
				</div>
			</div>
		);
	}
}
