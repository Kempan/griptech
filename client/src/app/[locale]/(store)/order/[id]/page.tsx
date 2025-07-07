// client/src/app/[locale]/(store)/order/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getCustomerOrderById } from "@/app/actions/orderActions";
import { OrderStatusBadge } from "@/app/[locale]/(store)/orders/components/OrderStatusBadge";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import { Link } from "@/i18n/routing";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import { Button } from "@/shadcn/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shadcn/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shadcn/components/ui/table";
import { ArrowLeft } from "lucide-react";
import { getAuthStatus } from "@/app/actions/authActions";
import { getTranslations } from "next-intl/server";

interface OrderPageProps {
	params: Promise<{
		id: string;
		locale: string;
	}>;
}

export default async function OrderPage({ params }: OrderPageProps) {
	const { id, locale } = await params;
	const t = await getTranslations();

	// Get user session
	const session = await getAuthStatus();

	// Redirect to login if not authenticated
	if (!session?.isLoggedIn) {
		redirect(`/${locale}/login?callbackUrl=/${locale}/order/${id}`);
	}
	// Fetch order details
	const order = await getCustomerOrderById(Number(id));
	
	// If order not found, show 404
	if (!order) {
		notFound();
	}

	return (
		<SectionWrapper>
			<InnerWrapper>
				<div className="max-w-7xl mx-auto py-8">
					<div className="mb-6">
						<Link
							href="/orders"
							className="flex items-center text-sm text-gray-600 hover:text-primary mb-4"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							{t("backToOrders")}
						</Link>
						<h1 className="text-3xl font-bold tracking-tight">
							Order #{order.orderNumber}
						</h1>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Order Summary */}
						<Card className="md:col-span-2">
							<CardHeader>
								<CardTitle>{t("orderSummary")}</CardTitle>
								<CardDescription>
									{t("placedOn")} {formatDateDisplay(order.createdAt)}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex justify-between items-center mb-4">
									<div>
										<h3 className="font-medium">{t("status")}</h3>
										<OrderStatusBadge status={order.status} />
									</div>
									<div className="text-right">
										<h3 className="font-medium">{t("total")}</h3>
										<p className="text-2xl font-bold">
											{formatCurrency(order.total, order.currency || "SEK")}
										</p>
									</div>
								</div>

								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[50%]">{t("product")}</TableHead>
											<TableHead className="text-right">{t("price")}</TableHead>
											<TableHead className="text-right">{t("quantity")}</TableHead>
											<TableHead className="text-right">{t("total")}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{order.orderItems &&
											order.orderItems.map((item) => (
												<TableRow key={item.id}>
													<TableCell className="font-medium">
														{item.name}
													</TableCell>
													<TableCell className="text-right">
														{formatCurrency(
															item.price,
															order.currency || "SEK"
														)}
													</TableCell>
													<TableCell className="text-right">
														{item.quantity}
													</TableCell>
													<TableCell className="text-right">
														{formatCurrency(
															item.price * item.quantity,
															order.currency || "SEK"
														)}
													</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>

								<div className="mt-4 pt-4 border-t space-y-2">
									<div className="flex justify-between">
										<span>{t("subtotal")}</span>
										<span>
											{formatCurrency(order.subtotal, order.currency || "SEK")}
										</span>
									</div>
									<div className="flex justify-between">
										<span>{t("tax")}</span>
										<span>
											{formatCurrency(order.tax, order.currency || "SEK")}
										</span>
									</div>
									<div className="flex justify-between">
										<span>{t("shipping")}</span>
										<span>
											{formatCurrency(order.shipping, order.currency || "SEK")}
										</span>
									</div>
									<div className="flex justify-between font-bold pt-2 border-t">
										<span>{t("total")}</span>
										<span>
											{formatCurrency(order.total, order.currency || "SEK")}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Customer and Shipping Info */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>{t("customerInformation")}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="font-medium">{order.customerName}</p>
									<p>{order.customerEmail}</p>
									{order.customerPhone && <p>{order.customerPhone}</p>}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>{t("shippingAddress")}</CardTitle>
								</CardHeader>
								<CardContent>
									{order.shippingAddress && (
										<div>
											<p>
												{order.shippingAddress.firstName}{" "}
												{order.shippingAddress.lastName}
											</p>
											<p>{order.shippingAddress.address1}</p>
											{order.shippingAddress.address2 && (
												<p>{order.shippingAddress.address2}</p>
											)}
											<p>
												{order.shippingAddress.postalCode}{" "}
												{order.shippingAddress.city}
											</p>
											<p>{order.shippingAddress.country}</p>
										</div>
									)}
								</CardContent>
							</Card>

							{order.customerNote && (
								<Card>
									<CardHeader>
										<CardTitle>{t("orderNotes")}</CardTitle>
									</CardHeader>
									<CardContent>
										<p>{order.customerNote}</p>
									</CardContent>
								</Card>
							)}
						</div>
					</div>

					<div className="mt-8 flex justify-between">
						<Link href="/orders" passHref>
							<Button variant="outline">{t("backToOrders")}</Button>
						</Link>
						<Link href="/" passHref>
							<Button>{t("continueShopping")}</Button>
						</Link>
					</div>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}
