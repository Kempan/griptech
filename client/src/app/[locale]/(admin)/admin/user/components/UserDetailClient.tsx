"use client";

import { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import { useRouter } from "next/navigation";
import { updateUser, deleteUser } from "@/app/actions/admin/userActions";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import { Label } from "@/shadcn/components/ui/label";
import { Input } from "@/shadcn/components/ui/input";
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
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shadcn/components/ui/card";
import { toast } from "sonner";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import { UserOrders } from "./UserOrders";
import { Address, User } from "@/app/types/user";
import { useTranslations } from "next-intl";

interface UserDetailClientProps {
	user: User;
	locale: string;
}

export function UserDetailClient({ user, locale }: UserDetailClientProps) {
	const t = useTranslations();
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [activeTab, setActiveTab] = useState("basic");

	// Form fields state
	const [name, setName] = useState(user.name);
	const [email, setEmail] = useState(user.email);
	const [phone, setPhone] = useState(user.phone || "");
	const [roles, setRoles] = useState<string[]>(user.roles || ["customer"]);
	const [password, setPassword] = useState("");

	// Shipping address state
	const [shippingAddress, setShippingAddress] = useState<Address>(
		user.shippingAddress || {
			firstName: "",
			lastName: "",
			address1: "",
			city: "",
			postalCode: "",
			country: "Sweden",
		}
	);

	// Billing address state
	const [useSameAddress, setUseSameAddress] = useState(!user.billingAddress);
	const [billingAddress, setBillingAddress] = useState<Address>(
		user.billingAddress || {
				firstName: user.shippingAddress?.firstName || "",
				lastName: user.shippingAddress?.lastName || "",
				address1: user.shippingAddress?.address1 || "",
				city: user.shippingAddress?.city || "",
				postalCode: user.shippingAddress?.postalCode || "",
				country: user.shippingAddress?.country || "Sweden",
				company: user.shippingAddress?.company,
				address2: user.shippingAddress?.address2,
				state: user.shippingAddress?.state,
				phone: user.shippingAddress?.phone,
			} || {
				firstName: "",
				lastName: "",
				address1: "",
				city: "",
				postalCode: "",
				country: "Sweden",
			}
	);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	// Toggle role selection
	const handleRoleToggle = (role: string) => {
		if (roles.includes(role)) {
			setRoles(roles.filter((r) => r !== role));
		} else {
			setRoles([...roles, role]);
		}
	};

	// Handle shipping address change
	const handleShippingChange = (field: keyof Address, value: string) => {
		setShippingAddress((prev) => ({ ...prev, [field]: value }));

		// Update billing address too if using same address
		if (useSameAddress) {
			setBillingAddress((prev) => ({ ...prev, [field]: value }));
		}
	};

	// Handle billing address change
	const handleBillingChange = (field: keyof Address, value: string) => {
		setBillingAddress((prev) => ({ ...prev, [field]: value }));
	};

	// Save user changes
	const handleSave = async () => {
		if (!name || !email) {
			setError("Name and email are required");
			return;
		}

		// Ensure at least one role is selected
		if (roles.length === 0) {
			setRoles(["customer"]);
		}

		// Validate required address fields if shipping address is provided
		if (
			shippingAddress.firstName ||
			shippingAddress.lastName ||
			shippingAddress.address1
		) {
			if (
				!shippingAddress.firstName ||
				!shippingAddress.lastName ||
				!shippingAddress.address1 ||
				!shippingAddress.city ||
				!shippingAddress.postalCode ||
				!shippingAddress.country
			) {
				setError("Please complete all required shipping address fields");
				setActiveTab("shipping");
				return;
			}
		}

		// Validate required billing address fields if not using same address and billing info is provided
		if (
			!useSameAddress &&
			(billingAddress.firstName ||
				billingAddress.lastName ||
				billingAddress.address1)
		) {
			if (
				!billingAddress.firstName ||
				!billingAddress.lastName ||
				!billingAddress.address1 ||
				!billingAddress.city ||
				!billingAddress.postalCode ||
				!billingAddress.country
			) {
				setError("Please complete all required billing address fields");
				setActiveTab("shipping");
				return;
			}
		}

		setIsSubmitting(true);
		setError("");

		try {
			const userData = {
				name,
				email,
				phone: phone || null,
				roles,
				shippingAddress: Object.values(shippingAddress).some((v) => v)
					? shippingAddress
					: null,
				billingAddress: useSameAddress
					? null
					: Object.values(billingAddress).some((v) => v)
					? billingAddress
					: null,
				...(password ? { password } : {}),
			};

			const result = await updateUser(user.id, userData);

			if (result) {
				setIsEditing(false);
				toast.success("User updated successfully");
				// Refresh the page to show updated data
				router.refresh();
			} else {
				setError("Failed to update user");
				toast.error("Failed to update user");
			}
		} catch (err) {
			setError("An error occurred while updating the user");
			toast.error("An error occurred while updating the user");
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle user deletion
	const handleDelete = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this user? This action cannot be undone."
			)
		) {
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await deleteUser(user.id);
			if (result) {
				toast.success("User deleted successfully");
				router.push(`/${locale}/admin/users`);
			} else {
				setError("Failed to delete user");
				toast.error("Failed to delete user");
			}
		} catch (err) {
			setError("An error occurred while deleting the user");
			toast.error("An error occurred while deleting the user");
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Format date for display
	const formatDate = (dateString?: string) => {
		if (!dateString) return "Never";
		return formatDateDisplay(dateString);
	};

	return (
		<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
			{error && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
					{error}
				</div>
			)}

			<h2 className="text-xl font-semibold mb-6">{t("UserDetails")}</h2>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
				<TabsList className="grid grid-cols-3 w-full">
					<TabsTrigger value="basic">{t("BasicInfo")}</TabsTrigger>
					<TabsTrigger value="shipping">{t("Addresses")}</TabsTrigger>
					<TabsTrigger value="orders">{t("Orders")}</TabsTrigger>
				</TabsList>

				{/* Basic Info Tab */}
				<TabsContent value="basic">
					<Card>
						<CardHeader>
							<CardTitle>{t("BasicInformation")}</CardTitle>
							<CardDescription>{t("UserAccountDetailsAndRoles")}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<div className="mb-4">
										<p className="text-sm text-gray-500">{t("ID")}</p>
										<p className="font-medium">{user.id}</p>
									</div>

									{isEditing ? (
										<>
											<div className="mb-4">
												<Label htmlFor="name">{t("Name")}</Label>
												<Input
													id="name"
													value={name}
													onChange={(e) => setName(e.target.value)}
													className="mt-1"
												/>
											</div>

											<div className="mb-4">
												<Label htmlFor="email">{t("Email")}</Label>
												<Input
													id="email"
													type="email"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													className="mt-1"
												/>
											</div>

											<div className="mb-4">
												<Label htmlFor="phone">{t("Phone")}</Label>
												<Input
													id="phone"
													type="tel"
													value={phone}
													onChange={(e) => setPhone(e.target.value)}
													className="mt-1"
													placeholder={t("PhoneNumber")}
												/>
											</div>

											<div className="mb-4">
												<Label htmlFor="password">
													{t("Password")} ({t("LeaveBlankToKeepCurrent")})
												</Label>
												<Input
													id="password"
													type="password"
													value={password}
													onChange={(e) => setPassword(e.target.value)}
													placeholder={t("NewPassword")}
													className="mt-1"
												/>
											</div>
										</>
									) : (
										<>
											<div className="mb-4">
												<p className="text-sm text-gray-500">{t("Name")}</p>
												<p className="font-medium">{user.name}</p>
											</div>

											<div className="mb-4">
												<p className="text-sm text-gray-500">{t("Email")}</p>
												<p className="font-medium">{user.email}</p>
											</div>

											<div className="mb-4">
												<p className="text-sm text-gray-500">{t("Phone")}</p>
												<p className="font-medium">
													{user.phone || t("NotProvided")}
												</p>
											</div>
										</>
									)}
								</div>

								<div>
									{isEditing ? (
										<div className="mb-4">
											<Label className="text-sm text-gray-500 mb-2 block">
												{t("UserRoles")}
											</Label>
											<div className="space-y-2">
												<div className="flex items-center space-x-2">
													<Checkbox
														id="role-admin"
														checked={roles.includes("admin")}
														onCheckedChange={() => handleRoleToggle("admin")}
													/>
													<Label htmlFor="role-admin">{t("Admin")}</Label>
												</div>
												<div className="flex items-center space-x-2">
													<Checkbox
														id="role-customer"
														checked={roles.includes("customer")}
														onCheckedChange={() => handleRoleToggle("customer")}
													/>
													<Label htmlFor="role-customer">{t("Customer")}</Label>
												</div>
											</div>
										</div>
									) : (
										<div className="mb-4">
											<p className="text-sm text-gray-500">{t("Roles")}</p>
											<div className="flex flex-wrap gap-2 mt-1">
												{user.roles && user.roles.length > 0 ? (
													user.roles.map((role) => (
														<span
															key={role}
															className={`px-2 py-1 text-xs font-medium rounded ${
																role === "admin"
																	? "bg-purple-100 text-purple-800"
																	: "bg-blue-100 text-blue-800"
															}`}
														>
															{role}
														</span>
													))
												) : (
													<span className="text-gray-500 italic">
														{t("NoRolesAssigned")}
													</span>
												)}
											</div>
										</div>
									)}

									{user.lastLogin && (
										<div className="mb-4">
											<p className="text-sm text-gray-500">{t("LastLogin")}</p>
											<p className="font-medium">
												{formatDate(user.lastLogin)}
											</p>
										</div>
									)}

									{user.createdAt && (
										<div className="mb-4">
											<p className="text-sm text-gray-500">{t("Created")}</p>
											<p className="font-medium">
												{formatDate(user.createdAt)}
											</p>
										</div>
									)}

									{user.updatedAt && (
										<div className="mb-4">
											<p className="text-sm text-gray-500">{t("LastUpdated")}</p>
											<p className="font-medium">
												{formatDate(user.updatedAt)}
											</p>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Shipping & Billing Tab */}
				<TabsContent value="shipping">
					<Card>
						<CardHeader>
							<CardTitle>{t("ShippingAddress")}</CardTitle>
							<CardDescription>
								{t("DefaultShippingInformationForOrders")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isEditing ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="shippingFirstName">{t("FirstName")}</Label>
										<Input
											id="shippingFirstName"
											value={shippingAddress.firstName}
											onChange={(e) =>
												handleShippingChange("firstName", e.target.value)
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="shippingLastName">{t("LastName")}</Label>
										<Input
											id="shippingLastName"
											value={shippingAddress.lastName}
											onChange={(e) =>
												handleShippingChange("lastName", e.target.value)
											}
										/>
									</div>

									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="shippingCompany">{t("Company")} ({t("Optional")})</Label>
										<Input
											id="shippingCompany"
											value={shippingAddress.company || ""}
											onChange={(e) =>
												handleShippingChange("company", e.target.value)
											}
										/>
									</div>

									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="shippingAddress1">{t("AddressLine1")}</Label>
										<Input
											id="shippingAddress1"
											value={shippingAddress.address1}
											onChange={(e) =>
												handleShippingChange("address1", e.target.value)
											}
										/>
									</div>

									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="shippingAddress2">
											{t("AddressLine2")} ({t("Optional")})
										</Label>
										<Input
											id="shippingAddress2"
											value={shippingAddress.address2 || ""}
											onChange={(e) =>
												handleShippingChange("address2", e.target.value)
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="shippingCity">{t("City")}</Label>
										<Input
											id="shippingCity"
											value={shippingAddress.city}
											onChange={(e) =>
												handleShippingChange("city", e.target.value)
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="shippingState">
											{t("StateProvince")} ({t("Optional")})
										</Label>
										<Input
											id="shippingState"
											value={shippingAddress.state || ""}
											onChange={(e) =>
												handleShippingChange("state", e.target.value)
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="shippingPostalCode">{t("PostalCode")}</Label>
										<Input
											id="shippingPostalCode"
											value={shippingAddress.postalCode}
											onChange={(e) =>
												handleShippingChange("postalCode", e.target.value)
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="shippingCountry">{t("Country")}</Label>
										<Select
											value={shippingAddress.country}
											onValueChange={(value) =>
												handleShippingChange("country", value)
											}
										>
											<SelectTrigger id="shippingCountry">
												<SelectValue placeholder={t("SelectCountry")} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Sweden">Sweden</SelectItem>
												<SelectItem value="Norway">Norway</SelectItem>
												<SelectItem value="Denmark">Denmark</SelectItem>
												<SelectItem value="Finland">Finland</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="shippingPhone">{t("Phone")} ({t("Optional")})</Label>
										<Input
											id="shippingPhone"
											value={shippingAddress.phone || ""}
											onChange={(e) =>
												handleShippingChange("phone", e.target.value)
											}
										/>
									</div>
								</div>
							) : shippingAddress &&
							  Object.values(shippingAddress).some((v) => v) ? (
								<div className="bg-gray-50 p-4 rounded-md">
									<div className="mb-1">
										{shippingAddress.firstName} {shippingAddress.lastName}
									</div>
									{shippingAddress.company && (
										<div className="mb-1">{shippingAddress.company}</div>
									)}
									<div className="mb-1">{shippingAddress.address1}</div>
									{shippingAddress.address2 && (
										<div className="mb-1">{shippingAddress.address2}</div>
									)}
									<div className="mb-1">
										{shippingAddress.city}
										{shippingAddress.state
											? `, ${shippingAddress.state}`
											: ""}{" "}
										{shippingAddress.postalCode}
									</div>
									<div className="mb-1">{shippingAddress.country}</div>
									{shippingAddress.phone && (
										<div className="mb-1">{shippingAddress.phone}</div>
									)}
								</div>
							) : (
								<p className="text-gray-500 italic">
									{t("NoShippingAddressProvided")}
								</p>
							)}
						</CardContent>
					</Card>

					{isEditing && (
						<div className="flex items-center space-x-2 my-4">
							<Checkbox
								id="sameAsBilling"
								checked={useSameAddress}
								onCheckedChange={(checked) => setUseSameAddress(!!checked)}
							/>
							<Label htmlFor="sameAsBilling" className="cursor-pointer">
								{t("BillingAddressSameAsShipping")}
							</Label>
						</div>
					)}

					{(!isEditing || !useSameAddress) && (
						<Card className="mt-4">
							<CardHeader>
								<CardTitle>{t("BillingAddress")}</CardTitle>
								<CardDescription>
									{t("DefaultBillingInformationForOrders")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{isEditing && !useSameAddress ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="billingFirstName">{t("FirstName")}</Label>
											<Input
												id="billingFirstName"
												value={billingAddress.firstName}
												onChange={(e) =>
													handleBillingChange("firstName", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="billingLastName">{t("LastName")}</Label>
											<Input
												id="billingLastName"
												value={billingAddress.lastName}
												onChange={(e) =>
													handleBillingChange("lastName", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="billingCompany">{t("Company")} ({t("Optional")})</Label>
											<Input
												id="billingCompany"
												value={billingAddress.company || ""}
												onChange={(e) =>
													handleBillingChange("company", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="billingAddress1">{t("AddressLine1")}</Label>
											<Input
												id="billingAddress1"
												value={billingAddress.address1}
												onChange={(e) =>
													handleBillingChange("address1", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="billingAddress2">
												{t("AddressLine2")} ({t("Optional")})
											</Label>
											<Input
												id="billingAddress2"
												value={billingAddress.address2 || ""}
												onChange={(e) =>
													handleBillingChange("address2", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="billingCity">{t("City")}</Label>
											<Input
												id="billingCity"
												value={billingAddress.city}
												onChange={(e) =>
													handleBillingChange("city", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="billingState">
												{t("StateProvince")} ({t("Optional")})
											</Label>
											<Input
												id="billingState"
												value={billingAddress.state || ""}
												onChange={(e) =>
													handleBillingChange("state", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="billingPostalCode">{t("PostalCode")}</Label>
											<Input
												id="billingPostalCode"
												value={billingAddress.postalCode}
												onChange={(e) =>
													handleBillingChange("postalCode", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="billingCountry">{t("Country")}</Label>
											<Select
												value={billingAddress.country}
												onValueChange={(value) =>
													handleBillingChange("country", value)
												}
											>
												<SelectTrigger id="billingCountry">
													<SelectValue placeholder={t("SelectCountry")} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Sweden">Sweden</SelectItem>
													<SelectItem value="Norway">Norway</SelectItem>
													<SelectItem value="Denmark">Denmark</SelectItem>
													<SelectItem value="Finland">Finland</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="billingPhone">{t("Phone")} ({t("Optional")})</Label>
											<Input
												id="billingPhone"
												value={billingAddress.phone || ""}
												onChange={(e) =>
													handleBillingChange("phone", e.target.value)
												}
											/>
										</div>
									</div>
								) : user.billingAddress &&
								  Object.values(user.billingAddress).some((v) => v) ? (
									<div className="bg-gray-50 p-4 rounded-md">
										<div className="mb-1">
											{user.billingAddress.firstName}{" "}
											{user.billingAddress.lastName}
										</div>
										{user.billingAddress.company && (
											<div className="mb-1">{user.billingAddress.company}</div>
										)}
										<div className="mb-1">{user.billingAddress.address1}</div>
										{user.billingAddress.address2 && (
											<div className="mb-1">{user.billingAddress.address2}</div>
										)}
										<div className="mb-1">
											{user.billingAddress.city}
											{user.billingAddress.state
												? `, ${user.billingAddress.state}`
												: ""}{" "}
											{user.billingAddress.postalCode}
										</div>
										<div className="mb-1">{user.billingAddress.country}</div>
										{user.billingAddress.phone && (
											<div className="mb-1">{user.billingAddress.phone}</div>
										)}
									</div>
								) : useSameAddress ? (
									<p className="text-gray-500">{t("SameAsShippingAddress")}</p>
								) : (
									<p className="text-gray-500 italic">
										{t("NoBillingAddressProvided")}
									</p>
								)}
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Orders Tab */}
				<TabsContent value="orders">
					<Card>
						<CardHeader>
							<CardTitle>{t("OrderHistory")}</CardTitle>
							<CardDescription>{t("UserPastOrders")}</CardDescription>
						</CardHeader>
						<CardContent>
							<UserOrders userId={user.id} locale={locale} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<div className="mt-6 flex gap-2">
				{isEditing ? (
					<>
						<Button onClick={handleSave} disabled={isSubmitting}>
							{isSubmitting ? t("saving") : t("saveChanges")}
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setIsEditing(false);
								setName(user.name);
								setEmail(user.email);
								setPhone(user.phone || "");
								setRoles(user.roles || ["customer"]);
								setPassword("");
								setShippingAddress(
									user.shippingAddress || {
										firstName: "",
										lastName: "",
										address1: "",
										city: "",
										postalCode: "",
										country: "Sweden",
									}
								);
								setBillingAddress(
									user.billingAddress || {
											firstName: user.shippingAddress?.firstName || "",
											lastName: user.shippingAddress?.lastName || "",
											address1: user.shippingAddress?.address1 || "",
											city: user.shippingAddress?.city || "",
											postalCode: user.shippingAddress?.postalCode || "",
											country: user.shippingAddress?.country || "Sweden",
											company: user.shippingAddress?.company,
											address2: user.shippingAddress?.address2,
											state: user.shippingAddress?.state,
											phone: user.shippingAddress?.phone,
										} || {
											firstName: "",
											lastName: "",
											address1: "",
											city: "",
											postalCode: "",
											country: "Sweden",
										}
								);
								setUseSameAddress(!user.billingAddress);
								setError("");
								setActiveTab("basic");
							}}
							disabled={isSubmitting}
						>
							{t("Cancel")}
						</Button>
					</>
				) : (
					<>
						<Button onClick={() => setIsEditing(true)}>{t("EditUser")}</Button>
						<Button
							variant="error"
							onClick={handleDelete}
							disabled={isSubmitting}
						>
							{isSubmitting ? t("Deleting") : t("DeleteUser")}
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
