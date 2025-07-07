"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCart } from "@/app/state/cartHooks";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { fetchUserProfile } from "@/app/actions/userActions";
import { Loader2 } from "lucide-react";

// Shadcn components
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shadcn/components/ui/card";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import { Textarea } from "@/shadcn/components/ui/textarea";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shadcn/components/ui/select";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shadcn/components/ui/tabs";
import { createOrder } from "@/app/actions/orderActions";

interface CheckoutFormProps {
	onOrderComplete?: () => void;
}

export default function CheckoutForm({ onOrderComplete }: CheckoutFormProps) {
	const t = useTranslations();
	const { cart, clearCartItems } = useCart();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState("customer");

	// Get authentication information
	const { isLoggedIn, userId } = useAuth();

	// Customer information
	const [customerInfo, setCustomerInfo] = useState({
		customerName: "",
		customerEmail: "",
		customerPhone: "",
		customerNote: "",
	});

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

	// Payment method
	const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");

	// Form validation
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Prefill user data
	useEffect(() => {
		const prefillUserData = async () => {
			if (isLoggedIn && userId) {
				console.log("User is logged in, fetching profile data for prefill");

				try {
					const userData = await fetchUserProfile();
					if (userData) {
						// Basic information
						if (userData.user?.name || userData.user?.email) {
							setCustomerInfo((prev) => ({
								...prev,
								customerName: userData.user?.name || prev.customerName,
								customerEmail: userData.user?.email || prev.customerEmail,
								customerPhone: userData.user?.phone || prev.customerPhone,
							}));
						}

						// Split name into first and last name if possible
						let firstName = "";
						let lastName = "";

						if (userData.user?.name) {
							const nameParts = userData.user?.name.split(" ");
							if (nameParts.length >= 2) {
								firstName = nameParts[0];
								lastName = nameParts.slice(1).join(" ");
							} else {
								firstName = userData.user?.name;
							}
						}

						// Shipping address
						if (userData.user?.shippingAddress) {
							setShippingAddress(userData.user?.shippingAddress);
						} else if (firstName && lastName) {
							// If no shipping address but we have name, prefill the name parts
							setShippingAddress((prev) => ({
								...prev,
								firstName,
								lastName,
								phone: userData.user?.phone || prev.phone,
							}));
						}

						// Billing address
						if (userData.user?.billingAddress) {
							setBillingAddress(userData.user?.billingAddress);
							setUseSameAddress(false);
						} else if (userData.user?.shippingAddress) {
							// If no billing address but shipping address exists
							setUseSameAddress(true);
						} else if (firstName && lastName) {
							// If no addresses but we have name
							setBillingAddress((prev) => ({
								...prev,
								firstName,
								lastName,
								phone: userData.user?.phone || prev.phone,
							}));
						}
					}
				} catch (error) {
					console.error("Error fetching user profile:", error);
					// Continue without prefilling
				}
			}
		};

		prefillUserData();
	}, [isLoggedIn, userId]);

	// Handle customer info change
	const handleCustomerInfoChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setCustomerInfo((prev) => ({ ...prev, [name]: value }));

		// Clear error when field is filled
		if (errors[name] && value.trim()) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	// Handle shipping address change
	const handleShippingAddressChange = (field: string, value: string) => {
		const newAddress = { ...shippingAddress, [field]: value };
		setShippingAddress(newAddress);

		// Clear error when field is filled
		if (errors[`shipping_${field}`] && value.trim()) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[`shipping_${field}`];
				return newErrors;
			});
		}

		// Update billing address if using same address
		if (useSameAddress) {
			setBillingAddress(newAddress);
		}
	};

	// Handle billing address change
	const handleBillingAddressChange = (field: string, value: string) => {
		setBillingAddress({ ...billingAddress, [field]: value });

		// Clear error when field is filled
		if (errors[`billing_${field}`] && value.trim()) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[`billing_${field}`];
				return newErrors;
			});
		}
	};

	// Validate form before submission
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Validate customer info
		if (!customerInfo.customerName.trim()) {
			newErrors.customerName = t("FieldRequired");
		}

		if (!customerInfo.customerEmail.trim()) {
			newErrors.customerEmail = t("FieldRequired");
		} else if (!/\S+@\S+\.\S+/.test(customerInfo.customerEmail)) {
			newErrors.customerEmail = t("InvalidEmail");
		}

		// Validate shipping address
		const requiredShippingFields = [
			"firstName",
			"lastName",
			"address1",
			"city",
			"postalCode",
			"country",
		];

		requiredShippingFields.forEach((field) => {
			if (!shippingAddress[field as keyof typeof shippingAddress].trim()) {
				newErrors[`shipping_${field}`] = t("FieldRequired");
			}
		});

		// Validate billing address if not using same address
		if (!useSameAddress) {
			const requiredBillingFields = [
				"firstName",
				"lastName",
				"address1",
				"city",
				"postalCode",
				"country",
			];

			requiredBillingFields.forEach((field) => {
				if (!billingAddress[field as keyof typeof billingAddress].trim()) {
					newErrors[`billing_${field}`] = t("FieldRequired");
				}
			});
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			// Determine which tab has errors and switch to it
			if (
				Object.keys(errors).some(
					(key) => key.startsWith("shipping_") || key.startsWith("billing_")
				)
			) {
				setActiveTab("shipping");
			} else {
				setActiveTab("customer");
			}

			toast.error(t("PleaseCorrectErrors"));
			return;
		}

		if (cart.items.length === 0) {
			toast.error(t("CartEmpty"));
			return;
		}

		setIsSubmitting(true);

		// Call the callback immediately to show loading state
		if (onOrderComplete) {
			onOrderComplete();
		}

		try {
			// Format the shipping address
			const formattedShippingAddress = {
				firstName: shippingAddress.firstName,
				lastName: shippingAddress.lastName,
				address1: shippingAddress.address1,
				address2: shippingAddress.address2 || "",
				city: shippingAddress.city,
				state: shippingAddress.state || "",
				postalCode: shippingAddress.postalCode,
				country: shippingAddress.country,
				phone: shippingAddress.phone || "",
			};

			// Format the billing address if different from shipping
			const formattedBillingAddress = useSameAddress
				? formattedShippingAddress
				: {
						firstName: billingAddress.firstName,
						lastName: billingAddress.lastName,
						address1: billingAddress.address1,
						address2: billingAddress.address2 || "",
						city: billingAddress.city,
						state: billingAddress.state || "",
						postalCode: billingAddress.postalCode,
						country: billingAddress.country,
						phone: billingAddress.phone || "",
				  };

			// Prepare order data
			const orderData = {
				items: cart.items.map((item) => ({
					productId: parseInt(item.productId),
					quantity: item.quantity,
					options: { size: item.size },
				})),
				customerName: customerInfo.customerName,
				customerEmail: customerInfo.customerEmail,
				customerPhone: customerInfo.customerPhone || undefined,
				customerNote: customerInfo.customerNote || undefined,
				shippingAddress: formattedShippingAddress,
				billingAddress: useSameAddress ? undefined : formattedBillingAddress,
				paymentMethod,
				// Include userId if user is logged in
				userId: isLoggedIn && userId ? userId : undefined,
			};

			console.log(`Creating order with userId: ${orderData.userId}`);

			// Send the order to the server
			const response = await createOrder(orderData);

			if (!response || !response.success) {
				throw new Error(response?.error || "Failed to create order");
			}

			// Save address to user profile if logged in
			if (isLoggedIn && userId) {
				try {
					// This could be implemented as a separate action
					// to update the user's saved addresses
					console.log("Saving addresses to user profile");
				} catch (error) {
					// Don't fail the order if this fails
					console.error("Error saving addresses to profile:", error);
				}
			}

			// Show success message
			toast.success(t("OrderPlacedSuccessfully"));

			// Clear the cart AFTER showing success but BEFORE redirect
			clearCartItems();

			// Redirect to order confirmation page with the order number
			router.push(
				`/order/confirmation?orderNumber=${response.order.orderNumber}`
			);
		} catch (error) {
			console.error("Error placing order:", error);
			toast.error(
				error instanceof Error ? error.message : t("ErrorPlacingOrder")
			);
			// Reset the loading state if there's an error
			setIsSubmitting(false);
		}
	};

	// Display a message if the user is logged in
	const renderAuthStatus = () => {
		if (isLoggedIn) {
			return (
				<div className="bg-gray-100 border border-gray-200 text-gray-800 rounded-md p-3 mb-4">
					<p className="text-sm font-medium">
						{t("LoggedInAs")}:{" "}
						{customerInfo.customerName ||
							customerInfo.customerEmail ||
							t("User")}
					</p>
					<p className="text-xs mt-1">
						{t("OrderWillBeAssociatedWithAccount")}
					</p>
				</div>
			);
		}
		return null;
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid grid-cols-3 w-full">
					<TabsTrigger value="customer">{t("CustomerInformation")}</TabsTrigger>
					<TabsTrigger value="shipping">{t("ShippingBilling")}</TabsTrigger>
					<TabsTrigger value="payment">{t("PaymentMethod")}</TabsTrigger>
				</TabsList>

				{/* Customer Information Tab */}
				<TabsContent value="customer" className="space-y-4 mt-4">
					<Card>
						<CardHeader>
							<CardTitle>{t("CustomerInformation")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{renderAuthStatus()}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="customerName">
										{t("FullName")} <span className="text-red-500">*</span>
									</Label>
									<Input
										id="customerName"
										name="customerName"
										value={customerInfo.customerName}
										onChange={handleCustomerInfoChange}
										placeholder={t("EnterFullName")}
										className={errors.customerName ? "border-red-500" : ""}
									/>
									{errors.customerName && (
										<p className="text-red-500 text-sm">
											{errors.customerName}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="customerEmail">
										{t("Email")} <span className="text-red-500">*</span>
									</Label>
									<Input
										id="customerEmail"
										name="customerEmail"
										type="email"
										value={customerInfo.customerEmail}
										onChange={handleCustomerInfoChange}
										placeholder={t("EnterEmail")}
										className={errors.customerEmail ? "border-red-500" : ""}
									/>
									{errors.customerEmail && (
										<p className="text-red-500 text-sm">
											{errors.customerEmail}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="customerPhone">{t("PhoneNumber")}</Label>
									<Input
										id="customerPhone"
										name="customerPhone"
										value={customerInfo.customerPhone}
										onChange={handleCustomerInfoChange}
										placeholder={t("EnterPhoneNumber")}
									/>
								</div>

								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="customerNote">{t("OrderNotes")}</Label>
									<Textarea
										id="customerNote"
										name="customerNote"
										value={customerInfo.customerNote}
										onChange={handleCustomerInfoChange}
										placeholder={t("EnterOrderNotes")}
										rows={3}
									/>
								</div>
							</div>

							<div className="flex justify-end">
								<Button type="button" onClick={() => setActiveTab("shipping")}>
									{t("Next")}: {t("ShippingInformation")}
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Shipping & Billing Tab */}
				<TabsContent value="shipping" className="space-y-4 mt-4">
					<Card>
						<CardHeader>
							<CardTitle>{t("ShippingAddress")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="shippingFirstName">
										{t("FirstName")} <span className="text-red-500">*</span>
									</Label>
									<Input
										id="shippingFirstName"
										value={shippingAddress.firstName}
										onChange={(e) =>
											handleShippingAddressChange("firstName", e.target.value)
										}
										placeholder={t("EnterFirstName")}
										className={
											errors.shipping_firstName ? "border-red-500" : ""
										}
									/>
									{errors.shipping_firstName && (
										<p className="text-red-500 text-sm">
											{errors.shipping_firstName}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="shippingLastName">
										{t("LastName")} <span className="text-red-500">*</span>
									</Label>
									<Input
										id="shippingLastName"
										value={shippingAddress.lastName}
										onChange={(e) =>
											handleShippingAddressChange("lastName", e.target.value)
										}
										placeholder={t("EnterLastName")}
										className={errors.shipping_lastName ? "border-red-500" : ""}
									/>
									{errors.shipping_lastName && (
										<p className="text-red-500 text-sm">
											{errors.shipping_lastName}
										</p>
									)}
								</div>

								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="shippingAddress1">
										{t("Address")} <span className="text-red-500">*</span>
									</Label>
									<Input
										id="shippingAddress1"
										value={shippingAddress.address1}
										onChange={(e) =>
											handleShippingAddressChange("address1", e.target.value)
										}
										placeholder={t("EnterAddress")}
										className={errors.shipping_address1 ? "border-red-500" : ""}
									/>
									{errors.shipping_address1 && (
										<p className="text-red-500 text-sm">
											{errors.shipping_address1}
										</p>
									)}
								</div>

								<div className="space-y-2 md:col-span-2">
									<Label htmlFor="shippingAddress2">
										{t("ApartmentSuite")}
									</Label>
									<Input
										id="shippingAddress2"
										value={shippingAddress.address2}
										onChange={(e) =>
											handleShippingAddressChange("address2", e.target.value)
										}
										placeholder={t("EnterApartmentSuite")}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="shippingCity">
										{t("City")} <span className="text-red-500">*</span>
									</Label>
									<Input
										id="shippingCity"
										value={shippingAddress.city}
										onChange={(e) =>
											handleShippingAddressChange("city", e.target.value)
										}
										placeholder={t("EnterCity")}
										className={errors.shipping_city ? "border-red-500" : ""}
									/>
									{errors.shipping_city && (
										<p className="text-red-500 text-sm">
											{errors.shipping_city}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="shippingState">{t("StateProvince")}</Label>
									<Input
										id="shippingState"
										value={shippingAddress.state}
										onChange={(e) =>
											handleShippingAddressChange("state", e.target.value)
										}
										placeholder={t("EnterStateProvince")}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="shippingPostalCode">
										{t("PostalCode")} <span className="text-red-500">*</span>
									</Label>
									<Input
										id="shippingPostalCode"
										value={shippingAddress.postalCode}
										onChange={(e) =>
											handleShippingAddressChange("postalCode", e.target.value)
										}
										placeholder={t("EnterPostalCode")}
										className={
											errors.shipping_postalCode ? "border-red-500" : ""
										}
									/>
									{errors.shipping_postalCode && (
										<p className="text-red-500 text-sm">
											{errors.shipping_postalCode}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="shippingCountry">
										{t("Country")} <span className="text-red-500">*</span>
									</Label>
									<Select
										value={shippingAddress.country}
										onValueChange={(value) =>
											handleShippingAddressChange("country", value)
										}
									>
										<SelectTrigger
											id="shippingCountry"
											className={
												errors.shipping_country ? "border-red-500" : ""
											}
										>
											<SelectValue placeholder={t("SelectCountry")} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Sweden">Sweden</SelectItem>
											<SelectItem value="Norway">Norway</SelectItem>
											<SelectItem value="Denmark">Denmark</SelectItem>
											<SelectItem value="Finland">Finland</SelectItem>
										</SelectContent>
									</Select>
									{errors.shipping_country && (
										<p className="text-red-500 text-sm">
											{errors.shipping_country}
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="sameAsBilling"
							checked={useSameAddress}
							onCheckedChange={(checked) =>
								setUseSameAddress(checked as boolean)
							}
						/>
						<Label htmlFor="sameAsBilling" className="cursor-pointer">
							{t("BillingAddressSameAsShipping")}
						</Label>
					</div>

					{!useSameAddress && (
						<Card>
							<CardHeader>
								<CardTitle>{t("BillingAddress")}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="billingFirstName">
											{t("FirstName")} <span className="text-red-500">*</span>
										</Label>
										<Input
											id="billingFirstName"
											value={billingAddress.firstName}
											onChange={(e) =>
												handleBillingAddressChange("firstName", e.target.value)
											}
											placeholder={t("EnterFirstName")}
											className={
												errors.billing_firstName ? "border-red-500" : ""
											}
										/>
										{errors.billing_firstName && (
											<p className="text-red-500 text-sm">
												{errors.billing_firstName}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="billingLastName">
											{t("LastName")} <span className="text-red-500">*</span>
										</Label>
										<Input
											id="billingLastName"
											value={billingAddress.lastName}
											onChange={(e) =>
												handleBillingAddressChange("lastName", e.target.value)
											}
											placeholder={t("EnterLastName")}
											className={
												errors.billing_lastName ? "border-red-500" : ""
											}
										/>
										{errors.billing_lastName && (
											<p className="text-red-500 text-sm">
												{errors.billing_lastName}
											</p>
										)}
									</div>

									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="billingAddress1">
											{t("Address")} <span className="text-red-500">*</span>
										</Label>
										<Input
											id="billingAddress1"
											value={billingAddress.address1}
											onChange={(e) =>
												handleBillingAddressChange("address1", e.target.value)
											}
											placeholder={t("EnterAddress")}
											className={
												errors.billing_address1 ? "border-red-500" : ""
											}
										/>
										{errors.billing_address1 && (
											<p className="text-red-500 text-sm">
												{errors.billing_address1}
											</p>
										)}
									</div>

									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="billingAddress2">
											{t("ApartmentSuite")}
										</Label>
										<Input
											id="billingAddress2"
											value={billingAddress.address2}
											onChange={(e) =>
												handleBillingAddressChange("address2", e.target.value)
											}
											placeholder={t("EnterApartmentSuite")}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="billingCity">
											{t("City")} <span className="text-red-500">*</span>
										</Label>
										<Input
											id="billingCity"
											value={billingAddress.city}
											onChange={(e) =>
												handleBillingAddressChange("city", e.target.value)
											}
											placeholder={t("EnterCity")}
											className={errors.billing_city ? "border-red-500" : ""}
										/>
										{errors.billing_city && (
											<p className="text-red-500 text-sm">
												{errors.billing_city}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="billingState">{t("StateProvince")}</Label>
										<Input
											id="billingState"
											value={billingAddress.state}
											onChange={(e) =>
												handleBillingAddressChange("state", e.target.value)
											}
											placeholder={t("EnterStateProvince")}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="billingPostalCode">
											{t("PostalCode")} <span className="text-red-500">*</span>
										</Label>
										<Input
											id="billingPostalCode"
											value={billingAddress.postalCode}
											onChange={(e) =>
												handleBillingAddressChange("postalCode", e.target.value)
											}
											placeholder={t("EnterPostalCode")}
											className={
												errors.billing_postalCode ? "border-red-500" : ""
											}
										/>
										{errors.billing_postalCode && (
											<p className="text-red-500 text-sm">
												{errors.billing_postalCode}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="billingCountry">
											{t("Country")} <span className="text-red-500">*</span>
										</Label>
										<Select
											value={billingAddress.country}
											onValueChange={(value) =>
												handleBillingAddressChange("country", value)
											}
										>
											<SelectTrigger
												id="billingCountry"
												className={
													errors.billing_country ? "border-red-500" : ""
												}
											>
												<SelectValue placeholder={t("SelectCountry")} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Sweden">Sweden</SelectItem>
												<SelectItem value="Norway">Norway</SelectItem>
												<SelectItem value="Denmark">Denmark</SelectItem>
												<SelectItem value="Finland">Finland</SelectItem>
											</SelectContent>
										</Select>
										{errors.billing_country && (
											<p className="text-red-500 text-sm">
												{errors.billing_country}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					<div className="flex justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={() => setActiveTab("customer")}
						>
							{t("Back")}
						</Button>
						<Button type="button" onClick={() => setActiveTab("payment")}>
							{t("Next")}: {t("PaymentMethod")}
						</Button>
					</div>
				</TabsContent>

				{/* Payment Method Tab */}
				<TabsContent value="payment" className="space-y-4 mt-4">
					<Card>
						<CardHeader>
							<CardTitle>{t("PaymentMethod")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="paymentMethod">
									{t("SelectPaymentMethod")}
								</Label>
								<Select value={paymentMethod} onValueChange={setPaymentMethod}>
									<SelectTrigger id="paymentMethod">
										<SelectValue placeholder={t("SelectPaymentMethod")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="CREDIT_CARD">
											{t("CreditCard")}
										</SelectItem>
										<SelectItem value="SWISH">Swish</SelectItem>
										<SelectItem value="BANK_TRANSFER">
											{t("BankTransfer")}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{paymentMethod === "CREDIT_CARD" && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="cardNumber">{t("CardNumber")}</Label>
										<Input id="cardNumber" placeholder="1234 5678 9012 3456" />
									</div>

									<div className="space-y-2">
										<Label htmlFor="cardExpiry">{t("ExpiryDate")}</Label>
										<Input id="cardExpiry" placeholder="MM/YY" />
									</div>

									<div className="space-y-2">
										<Label htmlFor="cardCvc">{t("CVC")}</Label>
										<Input id="cardCvc" placeholder="123" />
									</div>
								</div>
							)}

							{paymentMethod === "SWISH" && (
								<div className="space-y-2">
									<Label htmlFor="swishNumber">{t("SwishNumber")}</Label>
									<Input id="swishNumber" placeholder="070-123 45 67" />
								</div>
							)}

							{paymentMethod === "BANK_TRANSFER" && (
								<div className="bg-gray-100 p-4 rounded-md">
									<p className="font-medium">{t("BankTransferInstructions")}</p>
									<p className="mt-2">{t("BankDetails")}:</p>
									<ul className="list-disc pl-5 mt-2 space-y-1">
										<li>Bank: Example Bank</li>
										<li>Account: 1234-5678</li>
										<li>
											Reference:{" "}
											{`${customerInfo.customerName.substring(
												0,
												10
											)}-${Date.now().toString().substring(6)}`}
										</li>
									</ul>
								</div>
							)}
						</CardContent>
					</Card>

					<div className="flex justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={() => setActiveTab("shipping")}
						>
							{t("Back")}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="min-w-[120px]"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("Processing")}
								</>
							) : (
								t("PlaceOrder")
							)}
						</Button>
					</div>
				</TabsContent>
			</Tabs>
		</form>
	);
}
