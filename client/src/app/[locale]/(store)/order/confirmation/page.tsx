// src/app/[locale]/(store)/order/confirmation/page.tsx
import { Suspense } from "react";
import { Button } from "@/shadcn/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shadcn/components/ui/card";
import { Link } from "@/i18n/routing";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import { CheckCircle } from "lucide-react";
import { getOrderByNumber } from "@/app/actions/admin/orderActions";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import { getTranslations } from "next-intl/server";

export default async function OrderConfirmationPage({
	searchParams,
}: {
	searchParams: Promise<{ orderNumber?: string }>;
}) {
	// Await the searchParams
	const params = await searchParams;
	const { orderNumber } = params;

	// Fetch the order details if we have an order number
	let order = null;
	if (orderNumber) {
		order = await getOrderByNumber(orderNumber);
	}

	return (
		<SectionWrapper>
			<InnerWrapper>
				<div className="mx-auto max-w-[800px] py-8">
					<Suspense
						fallback={
							<div className="h-40 w-full animate-pulse bg-gray-100 rounded-lg"></div>
						}
					>
						<OrderConfirmationContent order={order} orderNumber={orderNumber} />
					</Suspense>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}

// Make this an async server component to use getTranslations
async function OrderConfirmationContent({
	order,
	orderNumber,
}: {
	order: any;
	orderNumber?: string;
}) {
	// Get translations on the server
	const t = await getTranslations();

	return (
		<Card className="shadow-md">
			<CardHeader className="text-center border-b pb-6">
				<div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
					<CheckCircle className="w-10 h-10 text-gray-800" />
				</div>
				<CardTitle className="text-2xl text-gray-800">
					{t("OrderConfirmed")}
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-6">
				<div className="space-y-4">
					<p className="text-center text-gray-600">{t("OrderThankYou")}</p>
					<div className="bg-gray-50 p-4 rounded-md">
						<h3 className="font-medium mb-2">{t("OrderDetails")}</h3>
						<dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							<div>
								<dt className="text-gray-500 text-sm">{t("OrderNumber")}</dt>
								<dd className="font-medium">
									{order
										? order.orderNumber
										: orderNumber ||
										  `#ORD-${Math.floor(Math.random() * 10000)}`}
								</dd>
							</div>
							<div>
								<dt className="text-gray-500 text-sm">{t("Date")}</dt>
								<dd className="font-medium">
									{order
										? formatDateDisplay(order.createdAt)
										: new Date().toLocaleDateString()}
								</dd>
							</div>
							<div>
								<dt className="text-gray-500 text-sm">{t("PaymentMethod")}</dt>
								<dd className="font-medium">
									{order ? order.paymentMethod : t("CreditCard")}
								</dd>
							</div>
							<div>
								<dt className="text-gray-500 text-sm">{t("Status")}</dt>
								<dd className="font-medium">
									{order ? t(order.status) : t("PROCESSING")}
								</dd>
							</div>
							{order && (
								<>
									<div>
										<dt className="text-gray-500 text-sm">{t("Subtotal")}</dt>
										<dd className="font-medium">
											{formatCurrency(order.subtotal)}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500 text-sm">{t("Tax")}</dt>
										<dd className="font-medium">{formatCurrency(order.tax)}</dd>
									</div>
									<div>
										<dt className="text-gray-500 text-sm">{t("Shipping")}</dt>
										<dd className="font-medium">
											{formatCurrency(order.shipping)}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500 text-sm">{t("Total")}</dt>
										<dd className="font-medium">
											{formatCurrency(order.total)}
										</dd>
									</div>
								</>
							)}
						</dl>
					</div>

					{order && order.orderItems && order.orderItems.length > 0 && (
						<div className="bg-gray-50 p-4 rounded-md">
							<h3 className="font-medium mb-2">{t("OrderItems")}</h3>
							<ul className="divide-y">
								{order.orderItems.map((item: any) => (
									<li key={item.id} className="py-2">
										<div className="flex justify-between">
											<div>
												<p className="font-medium">{item.name}</p>
												<p className="text-sm text-gray-500">
													{t("Quantity")}: {item.quantity}
												</p>
												{item.options &&
													Object.keys(item.options).length > 0 && (
														<p className="text-sm text-gray-500 capitalize">
															{Object.entries(item.options)
																.map(([key, value]) => `${key}: ${value}`)
																.join(", ")}
														</p>
													)}
											</div>
											<div className="text-right">
												<p className="font-medium">
													{formatCurrency(item.price * item.quantity)}
												</p>
												<p className="text-sm text-gray-500">
													{formatCurrency(item.price)} {t("each")}
												</p>
											</div>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}

					<div>
						<h3 className="font-medium mb-2">{t("WhatHappensNext")}</h3>
						<ol className="list-decimal ml-5 space-y-2 text-gray-600">
							<li>{t("NextStepConfirmationEmail")}</li>
							<li>{t("NextStepPreparation")}</li>
							<li>{t("NextStepShipping")}</li>
							<li>{t("NextStepDelivery")}</li>
						</ol>
					</div>
				</div>
			</CardContent>

			<CardFooter className="flex flex-col sm:flex-row gap-3 justify-center border-t pt-6">
				<Link href="/" passHref>
					<Button variant="outline">{t("ContinueShopping")}</Button>
				</Link>
				<Link href="/orders" passHref>
					<Button>{t("ViewMyOrders")}</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}
