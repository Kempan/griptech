// client/src/app/[locale]/(admin)/admin/order/components/OrderDetailView.tsx
"use client";

import { Order } from "@/app/types";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { Card } from "@/shadcn/components/ui/card";
import OrderStatusUpdater from "./OrderStatusUpdater";
import OrderNotes from "./OrderNotes";
import DeleteOrderButton from "./DeleteOrderButton";
import AddressDisplay from "./AddressDisplay";
import UserSelector from "./UserSelector";
import { useTranslations } from "next-intl";

interface OrderDetailViewProps {
	order: Order;
	locale: string;
}

import { formatDateDisplay } from "@/app/lib/utils/formatDate";

export default function OrderDetailView({
	order,
	locale,
}: OrderDetailViewProps) {
	const t = useTranslations();
	return (
		<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Order Summary */}
				<Card className="p-6 lg:col-span-2">
					<h2 className="text-xl font-semibold mb-4">{t("orderSummary")}</h2>

					<div className="space-y-4">
						<div className="flex justify-between border-b pb-2">
							<span className="font-medium">{t("status")}:</span>
							<OrderStatusUpdater order={order} />
						</div>

						<div className="flex justify-between border-b pb-2">
							<span className="font-medium">{t("orderDate")}:</span>
							<span>{formatDateDisplay(order.createdAt)}</span>
						</div>

						<div className="flex justify-between border-b pb-2">
							<span className="font-medium">{t("paymentMethod")}:</span>
							<span>{order.paymentMethod || "Not specified"}</span>
						</div>

						<div className="flex justify-between border-b pb-2">
							<span className="font-medium">{t("paidOn")}:</span>
							<span>{formatDateDisplay(order.paidAt)}</span>
						</div>

						<div className="flex justify-between border-b pb-2">
							<span className="font-medium">{t("shippedOn")}:</span>
							<span>{formatDateDisplay(order.shippedAt)}</span>
						</div>

						{/* Admin Notes */}
						<OrderNotes
							orderId={order.id}
							adminNote={order.adminNote}
							customerNote={order.customerNote}
						/>
					</div>
				</Card>

				{/* Customer Information */}
				<Card className="p-6">
					<h2 className="text-xl font-semibold mb-4">{t("customer")}</h2>

					<div className="space-y-6">
						<div>
							<h3 className="font-medium text-gray-700 mb-2">
								{t("contactInformation")}
							</h3>
							<p className="text-gray-800">{order.customerName}</p>
							<p className="mt-1">
								<a
									href={`mailto:${order.customerEmail}`}
									className="text-gray-800 hover:underline"
								>
									{order.customerEmail}
								</a>
							</p>
							{order.customerPhone && (
								<p className="mt-1 text-gray-800">{order.customerPhone}</p>
							)}
						</div>

						<div>
							<h3 className="font-medium text-gray-700 mb-2">
								{t("shippingAddress")}
							</h3>
							<div className="bg-gray-50 p-3 rounded border border-gray-200">
								{order.shippingAddress &&
									typeof order.shippingAddress === "object" && (
										<AddressDisplay address={order.shippingAddress} />
									)}
							</div>
						</div>

						{order.billingAddress && (
							<div>
								<h3 className="font-medium text-gray-700 mb-2">
									{t("billingAddress")}
								</h3>
								<div className="bg-gray-50 p-3 rounded border border-gray-200">
									{typeof order.billingAddress === "object" && (
										<AddressDisplay address={order.billingAddress} />
									)}
								</div>
							</div>
						)}

						{/* User Selector - New Component */}
						<UserSelector
							orderId={order.id}
							currentUserId={order.user?.id}
							currentUserName={order.user?.name}
							currentUserEmail={order.user?.email}
						/>
					</div>
				</Card>
			</div>

			{/* Order Items */}
			<Card className="p-6 mt-6">
				<h2 className="text-xl font-semibold mb-4">{t("orderItems")}</h2>

				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									{t("product")}
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									{t("price")}
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									{t("quantity")}
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									{t("total")}
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{order.orderItems.map((item) => (
								<tr key={item.id}>
									<td className="px-6 py-4">
										<div className="text-sm font-medium text-gray-900">
											{item.name}
										</div>
										{item.options && Object.keys(item.options).length > 0 && (
											<div className="text-xs text-gray-500 mt-1">
												{Object.entries(
													item.options as Record<string, string>
												).map(([key, value]) => (
													<span key={key} className="mr-2">
														{key}: {value}
													</span>
												))}
											</div>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatCurrency(item.price, order.currency)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{item.quantity}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
										{formatCurrency(item.price * item.quantity, order.currency)}
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<td colSpan={3} className="px-6 py-3 text-right font-medium">
									{t("subtotal")}:
								</td>
								<td className="px-6 py-3 text-right">
									{formatCurrency(order.subtotal, order.currency)}
								</td>
							</tr>
							<tr>
								<td colSpan={3} className="px-6 py-3 text-right font-medium">
									{t("tax")}:
								</td>
								<td className="px-6 py-3 text-right">
									{formatCurrency(order.tax, order.currency)}
								</td>
							</tr>
							<tr>
								<td colSpan={3} className="px-6 py-3 text-right font-medium">
									{t("shipping")}:
								</td>
								<td className="px-6 py-3 text-right">
									{formatCurrency(order.shipping, order.currency)}
								</td>
							</tr>
							{order.discount && (
								<tr>
									<td colSpan={3} className="px-6 py-3 text-right font-medium">
										{t("discount")}:
									</td>
									<td className="px-6 py-3 text-right">
										-{formatCurrency(order.discount, order.currency)}
									</td>
								</tr>
							)}
							<tr className="border-t-2">
								<td
									colSpan={3}
									className="px-6 py-3 text-right font-medium text-lg"
								>
									{t("total")}:
								</td>
								<td className="px-6 py-3 text-right font-bold text-lg">
									{formatCurrency(order.total, order.currency)}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</Card>

			<div className="mt-6 flex gap-2">
				<DeleteOrderButton orderId={order.id} locale={locale} />
			</div>
		</div>
	);
}
