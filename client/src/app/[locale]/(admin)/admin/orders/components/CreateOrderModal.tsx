// client/src/app/[locale]/(admin)/admin/orders/components/CreateOrderModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createOrder } from "@/app/actions/admin/orderActions";
import { getProducts } from "@/app/actions/productActions";
import { Product, Order, OrderStatus } from "@/app/types";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import { Textarea } from "@/shadcn/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/shadcn/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shadcn/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shadcn/components/ui/table";
import { toast } from "sonner";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shadcn/components/ui/tabs";
import { useTranslations } from "next-intl";

interface CreateOrderModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreate?: (order: Order) => void;
}

export default function CreateOrderModal({
	isOpen,
	onClose,
	onCreate,
}: CreateOrderModalProps) {
	const [activeTab, setActiveTab] = useState("customer");
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const t = useTranslations();
	// Customer information
	const [customerName, setCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [customerNote, setCustomerNote] = useState("");

	// Shipping address
	const [shippingAddress, setShippingAddress] = useState({
		firstName: "",
		lastName: "",
		address1: "",
		address2: "",
		city: "",
		state: "",
		postalCode: "",
		country: "Sweden",
		phone: "",
	});

	// Billing address
	const [useSameAddress, setUseSameAddress] = useState(true);
	const [billingAddress, setBillingAddress] = useState({
		firstName: "",
		lastName: "",
		address1: "",
		address2: "",
		city: "",
		state: "",
		postalCode: "",
		country: "Sweden",
		phone: "",
	});

	// Order items
	const [orderItems, setOrderItems] = useState<
		Array<{
			productId: number;
			name: string;
			price: number;
			quantity: number;
		}>
	>([]);

	// Product selection
	const [selectedProductId, setSelectedProductId] = useState<string>("");
	const [selectedQuantity, setSelectedQuantity] = useState(1);

	// Order totals
	const [subtotal, setSubtotal] = useState(0);
	const [tax, setTax] = useState(0);
	const [shipping, setShipping] = useState(99); // Default shipping
	const [total, setTotal] = useState(0);

	// Payment method
	const [paymentMethod, setPaymentMethod] = useState("MANUAL");

	// Order status
	const [status, setStatus] = useState<OrderStatus>("PENDING" as OrderStatus);

	// Fetch products when the modal opens
	useEffect(() => {
		if (isOpen) {
			const fetchProducts = async () => {
				try {
					const productsData = await getProducts();
					setProducts(productsData);
				} catch (error) {
					console.error("Error fetching products:", error);
					setError("Failed to load products");
				}
			};

			fetchProducts();
		}
	}, [isOpen]);

	// Calculate totals when order items change
	useEffect(() => {
		const newSubtotal = orderItems.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
		const newTax = newSubtotal * 0.25; // 25% VAT
		const newTotal = newSubtotal + newTax + shipping;

		setSubtotal(newSubtotal);
		setTax(newTax);
		setTotal(newTotal);
	}, [orderItems, shipping]);

	// Populate billing address when useSameAddress changes
	useEffect(() => {
		if (useSameAddress) {
			setBillingAddress(shippingAddress);
		}
	}, [useSameAddress, shippingAddress]);

	// Handle adding a product to the order
	const handleAddProduct = () => {
		if (!selectedProductId) return;

		const productId = parseInt(selectedProductId, 10);
		const product = products.find((p) => p.id === productId);

		if (!product) return;

		// Check if product is already in the order
		const existingItem = orderItems.find(
			(item) => item.productId === productId
		);

		if (existingItem) {
			// Update quantity if product already exists in order
			setOrderItems(
				orderItems.map((item) =>
					item.productId === productId
						? { ...item, quantity: item.quantity + selectedQuantity }
						: item
				)
			);
		} else {
			// Add new product to order
			setOrderItems([
				...orderItems,
				{
					productId,
					name: product.name,
					price: product.price,
					quantity: selectedQuantity,
				},
			]);
		}

		// Reset product selection
		setSelectedProductId("");
		setSelectedQuantity(1);
	};

	// Handle removing a product from the order
	const handleRemoveProduct = (productId: number) => {
		setOrderItems(orderItems.filter((item) => item.productId !== productId));
	};

	// Handle shipping address change
	const handleShippingAddressChange = (field: string, value: string) => {
		const newAddress = { ...shippingAddress, [field]: value };
		setShippingAddress(newAddress);

		// Update billing address if using same address
		if (useSameAddress) {
			setBillingAddress(newAddress);
		}
	};

	// Handle billing address change
	const handleBillingAddressChange = (field: string, value: string) => {
		setBillingAddress({ ...billingAddress, [field]: value });
	};

	// Reset form to initial state
	const resetForm = () => {
		setCustomerName("");
		setCustomerEmail("");
		setCustomerPhone("");
		setCustomerNote("");
		setShippingAddress({
			firstName: "",
			lastName: "",
			address1: "",
			address2: "",
			city: "",
			state: "",
			postalCode: "",
			country: "Sweden",
			phone: "",
		});
		setUseSameAddress(true);
		setBillingAddress({
			firstName: "",
			lastName: "",
			address1: "",
			address2: "",
			city: "",
			state: "",
			postalCode: "",
			country: "Sweden",
			phone: "",
		});
		setOrderItems([]);
		setSelectedProductId("");
		setSelectedQuantity(1);
		setPaymentMethod("MANUAL");
		setStatus("PENDING" as OrderStatus);
		setActiveTab("customer");
		setError("");
	};

	// Handle form submission
	const handleSubmit = async () => {
		// Validate form
		if (!customerName || !customerEmail) {
			setError("Customer name and email are required");
			setActiveTab("customer");
			return;
		}

		if (
			!shippingAddress.firstName ||
			!shippingAddress.lastName ||
			!shippingAddress.address1 ||
			!shippingAddress.city ||
			!shippingAddress.postalCode
		) {
			setError("Please complete the shipping address");
			setActiveTab("shipping");
			return;
		}

		if (
			!useSameAddress &&
			(!billingAddress.firstName ||
				!billingAddress.lastName ||
				!billingAddress.address1 ||
				!billingAddress.city ||
				!billingAddress.postalCode)
		) {
			setError("Please complete the billing address");
			setActiveTab("shipping");
			return;
		}

		if (orderItems.length === 0) {
			setError("Please add at least one product to the order");
			setActiveTab("products");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			// Prepare order data
			const orderData = {
				customerName,
				customerEmail,
				customerPhone: customerPhone || undefined,
				customerNote: customerNote || undefined,
				shippingAddress,
				billingAddress: useSameAddress ? undefined : billingAddress,
				items: orderItems.map((item) => ({
					productId: item.productId,
					quantity: item.quantity,
					options: {},
				})),
				paymentMethod,
				status,
			};

			// Create order
			const result = await createOrder(orderData);

			if (result?.success) {
				toast.success("Order created successfully");
				if (onCreate) {
					onCreate(result.order);
				}
				resetForm();
				onClose();
			} else {
				throw new Error("Failed to create order");
			}
		} catch (error) {
			console.error("Error creating order:", error);
			setError("Failed to create order. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("createNewOrder")}</DialogTitle>
				</DialogHeader>

				{error && (
					<div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
						{error}
					</div>
				)}

				<Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
					<TabsList className="grid grid-cols-3 mb-4">
						<TabsTrigger value="customer">{t("customerInfo")}</TabsTrigger>
						<TabsTrigger value="shipping">{t("shippingBilling")}</TabsTrigger>
						<TabsTrigger value="products">{t("productsPayment")}</TabsTrigger>
					</TabsList>

					<TabsContent value="customer" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="customerName">{t("customerName")}*</Label>
								<Input
									id="customerName"
									value={customerName}
									onChange={(e) => setCustomerName(e.target.value)}
									className="mt-1"
									required
								/>
							</div>

							<div>
								<Label htmlFor="customerEmail">{t("emailAddress")}*</Label>
								<Input
									id="customerEmail"
									type="email"
									value={customerEmail}
									onChange={(e) => setCustomerEmail(e.target.value)}
									className="mt-1"
									required
								/>
							</div>

							<div>
								<Label htmlFor="customerPhone">{t("phoneNumber")}</Label>
								<Input
									id="customerPhone"
									value={customerPhone}
									onChange={(e) => setCustomerPhone(e.target.value)}
									className="mt-1"
								/>
							</div>

							<div className="md:col-span-2">
								<Label htmlFor="customerNote">{t("orderNotes")}</Label>
								<Textarea
									id="customerNote"
									value={customerNote}
									onChange={(e) => setCustomerNote(e.target.value)}
									className="mt-1"
									rows={3}
									placeholder={t("orderNotesPlaceholder")}
								/>
							</div>
						</div>

						<div className="flex justify-end mt-4">
							<Button type="button" onClick={() => setActiveTab("shipping")}>
								{t("next")}: {t("shippingInformation")}
							</Button>
						</div>
					</TabsContent>

					<TabsContent value="shipping" className="space-y-4">
						<div>
							<h3 className="text-lg font-medium mb-4">{t("shippingAddress")}</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="shippingFirstName">{t("firstName")}*</Label>
									<Input
										id="shippingFirstName"
										value={shippingAddress.firstName}
										onChange={(e) =>
											handleShippingAddressChange("firstName", e.target.value)
										}
										className="mt-1"
										required
									/>
								</div>

								<div>
									<Label htmlFor="shippingLastName">{t("lastName")}*</Label>
									<Input
										id="shippingLastName"
										value={shippingAddress.lastName}
										onChange={(e) =>
											handleShippingAddressChange("lastName", e.target.value)
										}
										className="mt-1"
										required
									/>
								</div>

								<div className="md:col-span-2">
									<Label htmlFor="shippingAddress1">{t("addressLine1")}*</Label>
									<Input
										id="shippingAddress1"
										value={shippingAddress.address1}
										onChange={(e) =>
											handleShippingAddressChange("address1", e.target.value)
										}
										className="mt-1"
										required
									/>
								</div>

								<div className="md:col-span-2">
									<Label htmlFor="shippingAddress2">{t("addressLine2")}</Label>
									<Input
										id="shippingAddress2"
										value={shippingAddress.address2}
										onChange={(e) =>
											handleShippingAddressChange("address2", e.target.value)
										}
										className="mt-1"
									/>
								</div>

								<div>
									<Label htmlFor="shippingCity">{t("city")}*</Label>
									<Input
										id="shippingCity"
										value={shippingAddress.city}
										onChange={(e) =>
											handleShippingAddressChange("city", e.target.value)
										}
										className="mt-1"
										required
									/>
								</div>

								<div>
									<Label htmlFor="shippingState">{t("state")}</Label>
									<Input
										id="shippingState"
										value={shippingAddress.state}
										onChange={(e) =>
											handleShippingAddressChange("state", e.target.value)
										}
										className="mt-1"
									/>
								</div>

								<div>
									<Label htmlFor="shippingPostalCode">{t("postalCode")}*</Label>
									<Input
										id="shippingPostalCode"
										value={shippingAddress.postalCode}
										onChange={(e) =>
											handleShippingAddressChange("postalCode", e.target.value)
										}
										className="mt-1"
										required
									/>
								</div>

								<div>
									<Label htmlFor="shippingCountry">{t("country")}*</Label>
									<Input
										id="shippingCountry"
										value={shippingAddress.country}
										onChange={(e) =>
											handleShippingAddressChange("country", e.target.value)
										}
										className="mt-1"
										required
									/>
								</div>
							</div>
						</div>

						<div className="flex items-center pt-4 pb-2">
							<input
								type="checkbox"
								id="sameAsBilling"
								checked={useSameAddress}
								onChange={(e) => setUseSameAddress(e.target.checked)}
								className="w-4 h-4 mr-2"
							/>
							<Label htmlFor="sameAsBilling" className="text-sm cursor-pointer">
								{t("billingAddressSameAsShippingAddress")}
							</Label>
						</div>

						{!useSameAddress && (
							<div>
								<h3 className="text-lg font-medium mb-4">{t("billingAddress")}</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="billingFirstName">{t("firstName")}*</Label>
										<Input
											id="billingFirstName"
											value={billingAddress.firstName}
											onChange={(e) =>
												handleBillingAddressChange("firstName", e.target.value)
											}
											className="mt-1"
											required
										/>
									</div>

									<div>
										<Label htmlFor="billingLastName">{t("lastName")}*</Label>
										<Input
											id="billingLastName"
											value={billingAddress.lastName}
											onChange={(e) =>
												handleBillingAddressChange("lastName", e.target.value)
											}
											className="mt-1"
											required
										/>
									</div>

									<div className="md:col-span-2">
										<Label htmlFor="billingAddress1">{t("addressLine1")}*</Label>
										<Input
											id="billingAddress1"
											value={billingAddress.address1}
											onChange={(e) =>
												handleBillingAddressChange("address1", e.target.value)
											}
											className="mt-1"
											required
										/>
									</div>

									<div className="md:col-span-2">
										<Label htmlFor="billingAddress2">{t("addressLine2")}</Label>
										<Input
											id="billingAddress2"
											value={billingAddress.address2}
											onChange={(e) =>
												handleBillingAddressChange("address2", e.target.value)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="billingCity">{t("city")}*</Label>
										<Input
											id="billingCity"
											value={billingAddress.city}
											onChange={(e) =>
												handleBillingAddressChange("city", e.target.value)
											}
											className="mt-1"
											required
										/>
									</div>

									<div>
										<Label htmlFor="billingState">{t("state")}</Label>
										<Input
											id="billingState"
											value={billingAddress.state}
											onChange={(e) =>
												handleBillingAddressChange("state", e.target.value)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="billingPostalCode">{t("postalCode")}*</Label>
										<Input
											id="billingPostalCode"
											value={billingAddress.postalCode}
											onChange={(e) =>
												handleBillingAddressChange("postalCode", e.target.value)
											}
											className="mt-1"
											required
										/>
									</div>

									<div>
										<Label htmlFor="billingCountry">{t("country")}*</Label>
										<Input
											id="billingCountry"
											value={billingAddress.country}
											onChange={(e) =>
												handleBillingAddressChange("country", e.target.value)
											}
											className="mt-1"
											required
										/>
									</div>
								</div>
							</div>
						)}

						<div className="flex justify-between mt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setActiveTab("customer")}
							>
								{t("back")}
							</Button>
							<Button type="button" onClick={() => setActiveTab("products")}>
								{t("next")}: {t("products")}
							</Button>
						</div>
					</TabsContent>

					<TabsContent value="products" className="space-y-4">
						<div>
							<h3 className="text-lg font-medium mb-4">{t("orderItems")}</h3>

							<div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
								<div className="md:col-span-7">
									<Label htmlFor="productSelect">{t("product")}</Label>
									<Select
										value={selectedProductId}
										onValueChange={setSelectedProductId}
									>
										<SelectTrigger>
											<SelectValue placeholder={t("selectProduct")} />
										</SelectTrigger>
										<SelectContent>
											{products.map((product) => (
												<SelectItem
													key={product.id}
													value={product.id.toString()}
												>
													{product.name} -{" "}
													{formatCurrency(product.price, "SEK")}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="md:col-span-3">
									<Label htmlFor="quantity">{t("quantity")}</Label>
									<Input
										id="quantity"
										type="number"
										value={selectedQuantity}
										onChange={(e) =>
											setSelectedQuantity(parseInt(e.target.value) || 1)
										}
										min="1"
										className="mt-1"
									/>
								</div>

								<div className="md:col-span-2 flex items-end">
									<Button
										type="button"
										onClick={handleAddProduct}
										disabled={!selectedProductId}
										className="w-full mt-1"
									>
										{t("add")}
									</Button>
								</div>
							</div>

							<div className="border rounded-md overflow-hidden">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t("product")}</TableHead>
											<TableHead className="text-right">{t("price")}</TableHead>
											<TableHead className="text-right">{t("quantity")}</TableHead>
											<TableHead className="text-right">{t("total")}</TableHead>
											<TableHead className="w-[50px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{orderItems.length > 0 ? (
											orderItems.map((item) => (
												<TableRow key={item.productId}>
													<TableCell>{item.name}</TableCell>
													<TableCell className="text-right">
														{formatCurrency(item.price, "SEK")}
													</TableCell>
													<TableCell className="text-right">
														{item.quantity}
													</TableCell>
													<TableCell className="text-right">
														{formatCurrency(item.price * item.quantity, "SEK")}
													</TableCell>
													<TableCell>
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																handleRemoveProduct(item.productId)
															}
															className="h-8 w-8 p-0"
														>
															×
														</Button>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={5}
													className="text-center py-4 text-muted-foreground"
												>
													{t("noProductsAddedToOrder")}
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>

							<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="md:col-span-2 space-y-4">
									<div>
										<Label htmlFor="paymentMethod">{t("paymentMethod")}</Label>
										<Select
											value={paymentMethod}
											onValueChange={setPaymentMethod}
										>
											<SelectTrigger id="paymentMethod">
												<SelectValue placeholder={t("selectPaymentMethod")} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="MANUAL">
													{t("manualPhoneOrder")}
												</SelectItem>
												<SelectItem value="CREDIT_CARD">
													{t("creditCard")}
												</SelectItem>
												<SelectItem value="BANK_TRANSFER">
													{t("bankTransfer")}
												</SelectItem>
												<SelectItem value="SWISH">{t("swish")}</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="status">{t("orderStatus")}</Label>
										<Select
											value={status}
											onValueChange={(value) => setStatus(value as OrderStatus)}
										>
											<SelectTrigger id="status">
												<SelectValue placeholder={t("selectOrderStatus")} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="PENDING">{t("pending")}</SelectItem>
												<SelectItem value="PROCESSING">{t("processing")}</SelectItem>
												<SelectItem value="ON_HOLD">{t("onHold")}</SelectItem>
												<SelectItem value="COMPLETED">{t("completed")}</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="bg-gray-50 p-4 rounded">
									<h3 className="font-medium mb-2">{t("orderSummary")}</h3>
									<div className="space-y-1">
										<div className="flex justify-between">
											<span>{t("subtotal")}:</span>
											<span>{formatCurrency(subtotal, "SEK")}</span>
										</div>
										<div className="flex justify-between">
											<span>{t("tax")} (25%):</span>
											<span>{formatCurrency(tax, "SEK")}</span>
										</div>
										<div className="flex justify-between">
											<span>{t("shipping")}:</span>
											<span>{formatCurrency(shipping, "SEK")}</span>
										</div>
										<div className="flex justify-between font-bold pt-1 border-t mt-1">
											<span>{t("total")}:</span>
											<span>{formatCurrency(total, "SEK")}</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="flex justify-between mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => setActiveTab("shipping")}
							>
								{t("back")}
							</Button>
							<Button type="button" onClick={handleSubmit} disabled={isLoading}>
								{isLoading ? t("creating") : t("createOrder")}
							</Button>
						</div>
					</TabsContent>
				</Tabs>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						{t("cancel")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
