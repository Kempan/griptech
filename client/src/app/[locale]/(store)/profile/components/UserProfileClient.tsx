// client/src/app/[locale]/(store)/profile/components/UserProfileClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
	CardHeader,
	CardTitle,
} from "@/shadcn/components/ui/card";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shadcn/components/ui/select";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import { toast } from "sonner";
import { User, Address } from "@/app/types/user";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";

interface UserProfileClientProps {
	locale: string;
}

export default function UserProfileClient({ locale }: UserProfileClientProps) {
	const t = useTranslations();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("profile");
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	// User data
	const [user, setUser] = useState<User | null>(null);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// Shipping address
	const [shippingAddress, setShippingAddress] = useState<Address>({
		firstName: "",
		lastName: "",
		address1: "",
		city: "",
		postalCode: "",
		country: "Sweden",
	});

	// Billing address
	const [useSameAddress, setUseSameAddress] = useState(true);
	const [billingAddress, setBillingAddress] = useState<Address>({
		firstName: "",
		lastName: "",
		address1: "",
		city: "",
		postalCode: "",
		country: "Sweden",
	});

	const loadUserProfile = useCallback(async () => {
		try {
			console.log(
				"Fetching user profile from:",
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`
			);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`,
				{
					method: "GET",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			console.log("Response status:", response.status);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Error response:", errorText);
				throw new Error(
					`Failed to load profile: ${response.status} - ${errorText}`
				);
			}

			const userData = await response.json();
			console.log("User data received:", userData);

			setUser(userData);
			setName(userData.name || "");
			setEmail(userData.email || "");
			setPhone(userData.phone || "");

			if (userData.shippingAddress) {
				setShippingAddress(userData.shippingAddress);
			}

			if (userData.billingAddress) {
				setUseSameAddress(false);
				setBillingAddress(userData.billingAddress);
			} else {
				setUseSameAddress(true);
			}
		} catch (error) {
			console.error("Error loading profile:", error);
			toast.error(t("FailedToLoadProfile"));
		} finally {
			setIsLoading(false);
		}
	}, [t]);

	const handleShippingChange = (field: keyof Address, value: string) => {
		setShippingAddress((prev) => ({ ...prev, [field]: value }));
		if (useSameAddress) {
			setBillingAddress((prev) => ({ ...prev, [field]: value }));
		}
	};

	const handleBillingChange = (field: keyof Address, value: string) => {
		setBillingAddress((prev) => ({ ...prev, [field]: value }));
	};

	const validateForm = () => {
		if (!name || !email) {
			setError(t("NameAndEmailRequired"));
			return false;
		}

		// Validate password if changing
		if (newPassword || confirmPassword) {
			if (!currentPassword) {
				setError(t("CurrentPasswordRequired"));
				return false;
			}
			if (newPassword !== confirmPassword) {
				setError(t("PasswordsDoNotMatch"));
				return false;
			}
			if (newPassword.length < 6) {
				setError(t("PasswordTooShort"));
				return false;
			}
		}

		// Validate shipping address if provided
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
				setError(t("CompleteShippingAddress"));
				setActiveTab("addresses");
				return false;
			}
		}

		// Validate billing address if not using same address
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
				setError(t("CompleteBillingAddress"));
				setActiveTab("addresses");
				return false;
			}
		}

		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		setIsSaving(true);
		setError("");

		try {
			// Prepare update data
			const updateData = {
				name,
				email,
				phone: phone || null,
				shippingAddress: Object.values(shippingAddress).some((v) => v)
					? shippingAddress
					: null,
				billingAddress: useSameAddress
					? null
					: Object.values(billingAddress).some((v) => v)
					? billingAddress
					: null,
				...(newPassword
					? {
							currentPassword,
							newPassword,
					  }
					: {}),
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify(updateData),
				}
			);

			const result = await response.json();

			if (response.ok) {
				toast.success(t("ProfileUpdatedSuccessfully"));
				setIsEditing(false);
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");

				// Reload profile data
				await loadUserProfile();
			} else {
				setError(result.message || t("FailedToUpdateProfile"));
				toast.error(result.message || t("FailedToUpdateProfile"));
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			setError(t("FailedToUpdateProfile"));
			toast.error(t("FailedToUpdateProfile"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setError("");
		// Reset form to original values
		if (user) {
			setName(user.name || "");
			setEmail(user.email || "");
			setPhone(user.phone || "");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");

			if (user.shippingAddress) {
				setShippingAddress(user.shippingAddress);
			}

			if (user.billingAddress) {
				setUseSameAddress(false);
				setBillingAddress(user.billingAddress);
			} else {
				setUseSameAddress(true);
			}
		}
	};

	useEffect(() => {
		loadUserProfile();
	}, [loadUserProfile]);

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	if (!user) {
		return (
			<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
				<p className="text-red-500">{t("FailedToLoadProfile")}</p>
			</div>
		);
	}

	return (
		<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
			{error && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
					{error}
				</div>
			)}

			<h2 className="text-xl font-semibold mb-6">{t("AccountSettings")}</h2>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="profile">{t("Profile")}</TabsTrigger>
					<TabsTrigger value="addresses">{t("Addresses")}</TabsTrigger>
				</TabsList>

				{/* Profile Tab */}
				<TabsContent value="profile">
					<Card>
						<CardHeader>
							<CardTitle>{t("ProfileInformation")}</CardTitle>
							<CardDescription>
								{t("ManageYourPersonalInformation")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{isEditing ? (
									<>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="name">{t("Name")}</Label>
												<Input
													id="name"
													value={name}
													onChange={(e) => setName(e.target.value)}
													disabled={isSaving}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="email">{t("Email")}</Label>
												<Input
													id="email"
													type="email"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													disabled={isSaving}
												/>
											</div>

											<div className="space-y-2 md:col-span-2">
												<Label htmlFor="phone">{t("Phone")}</Label>
												<Input
													id="phone"
													type="tel"
													value={phone}
													onChange={(e) => setPhone(e.target.value)}
													placeholder={t("Optional")}
													disabled={isSaving}
												/>
											</div>
										</div>

										<div className="border-t pt-4 mt-6">
											<h3 className="text-lg font-medium mb-4">
												{t("ChangePassword")}
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="currentPassword">
														{t("CurrentPassword")}
													</Label>
													<Input
														id="currentPassword"
														type="password"
														value={currentPassword}
														onChange={(e) => setCurrentPassword(e.target.value)}
														disabled={isSaving}
													/>
												</div>

												<div className="space-y-2">
													<Label htmlFor="newPassword">
														{t("NewPassword")}
													</Label>
													<Input
														id="newPassword"
														type="password"
														value={newPassword}
														onChange={(e) => setNewPassword(e.target.value)}
														disabled={isSaving}
													/>
												</div>

												<div className="space-y-2 md:col-span-2">
													<Label htmlFor="confirmPassword">
														{t("ConfirmNewPassword")}
													</Label>
													<Input
														id="confirmPassword"
														type="password"
														value={confirmPassword}
														onChange={(e) => setConfirmPassword(e.target.value)}
														disabled={isSaving}
													/>
												</div>
											</div>
										</div>
									</>
								) : (
									<div className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<p className="text-sm text-gray-500">{t("Name")}</p>
												<p className="font-medium">
													{name || t("NotProvided")}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">{t("Email")}</p>
												<p className="font-medium">{email}</p>
											</div>
											<div>
												<p className="text-sm text-gray-500">{t("Phone")}</p>
												<p className="font-medium">
													{phone || t("NotProvided")}
												</p>
											</div>
											{user?.createdAt && (
												<div>
													<p className="text-sm text-gray-500">
														{t("MemberSince")}
													</p>
													<p className="font-medium">
														{formatDateDisplay(user.createdAt)}
													</p>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Addresses Tab */}
				<TabsContent value="addresses">
					<div className="space-y-4">
						{/* Shipping Address */}
						<Card>
							<CardHeader>
								<CardTitle>{t("ShippingAddress")}</CardTitle>
								<CardDescription>
									{t("YourDefaultShippingAddress")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{isEditing ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="shippingFirstName">
												{t("FirstName")}
											</Label>
											<Input
												id="shippingFirstName"
												value={shippingAddress.firstName}
												onChange={(e) =>
													handleShippingChange("firstName", e.target.value)
												}
												disabled={isSaving}
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
												disabled={isSaving}
											/>
										</div>

										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="shippingCompany">
												{t("Company")} ({t("Optional")})
											</Label>
											<Input
												id="shippingCompany"
												value={shippingAddress.company || ""}
												onChange={(e) =>
													handleShippingChange("company", e.target.value)
												}
												disabled={isSaving}
											/>
										</div>

										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="shippingAddress1">
												{t("AddressLine1")}
											</Label>
											<Input
												id="shippingAddress1"
												value={shippingAddress.address1}
												onChange={(e) =>
													handleShippingChange("address1", e.target.value)
												}
												disabled={isSaving}
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
												disabled={isSaving}
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
												disabled={isSaving}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="shippingPostalCode">
												{t("PostalCode")}
											</Label>
											<Input
												id="shippingPostalCode"
												value={shippingAddress.postalCode}
												onChange={(e) =>
													handleShippingChange("postalCode", e.target.value)
												}
												disabled={isSaving}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="shippingCountry">{t("Country")}</Label>
											<Select
												value={shippingAddress.country}
												onValueChange={(value) =>
													handleShippingChange("country", value)
												}
												disabled={isSaving}
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

										<div className="space-y-2">
											<Label htmlFor="shippingPhone">
												{t("Phone")} ({t("Optional")})
											</Label>
											<Input
												id="shippingPhone"
												value={shippingAddress.phone || ""}
												onChange={(e) =>
													handleShippingChange("phone", e.target.value)
												}
												disabled={isSaving}
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
											{shippingAddress.city} {shippingAddress.postalCode}
										</div>
										<div className="mb-1">{shippingAddress.country}</div>
										{shippingAddress.phone && (
											<div className="mb-1">
												{t("Phone")}: {shippingAddress.phone}
											</div>
										)}
									</div>
								) : (
									<p className="text-gray-500">
										{t("NoShippingAddressProvided")}
									</p>
								)}
							</CardContent>
						</Card>

						{/* Billing Address Toggle */}
						{isEditing && (
							<div className="flex items-center space-x-2">
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

						{/* Billing Address */}
						{(!isEditing || !useSameAddress) && (
							<Card>
								<CardHeader>
									<CardTitle>{t("BillingAddress")}</CardTitle>
									<CardDescription>
										{t("YourDefaultBillingAddress")}
									</CardDescription>
								</CardHeader>
								<CardContent>
									{isEditing && !useSameAddress ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="billingFirstName">
													{t("FirstName")}
												</Label>
												<Input
													id="billingFirstName"
													value={billingAddress.firstName}
													onChange={(e) =>
														handleBillingChange("firstName", e.target.value)
													}
													disabled={isSaving}
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
													disabled={isSaving}
												/>
											</div>

											<div className="space-y-2 md:col-span-2">
												<Label htmlFor="billingCompany">
													{t("Company")} ({t("Optional")})
												</Label>
												<Input
													id="billingCompany"
													value={billingAddress.company || ""}
													onChange={(e) =>
														handleBillingChange("company", e.target.value)
													}
													disabled={isSaving}
												/>
											</div>

											<div className="space-y-2 md:col-span-2">
												<Label htmlFor="billingAddress1">
													{t("AddressLine1")}
												</Label>
												<Input
													id="billingAddress1"
													value={billingAddress.address1}
													onChange={(e) =>
														handleBillingChange("address1", e.target.value)
													}
													disabled={isSaving}
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
													disabled={isSaving}
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
													disabled={isSaving}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="billingPostalCode">
													{t("PostalCode")}
												</Label>
												<Input
													id="billingPostalCode"
													value={billingAddress.postalCode}
													onChange={(e) =>
														handleBillingChange("postalCode", e.target.value)
													}
													disabled={isSaving}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="billingCountry">{t("Country")}</Label>
												<Select
													value={billingAddress.country}
													onValueChange={(value) =>
														handleBillingChange("country", value)
													}
													disabled={isSaving}
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

											<div className="space-y-2">
												<Label htmlFor="billingPhone">
													{t("Phone")} ({t("Optional")})
												</Label>
												<Input
													id="billingPhone"
													value={billingAddress.phone || ""}
													onChange={(e) =>
														handleBillingChange("phone", e.target.value)
													}
													disabled={isSaving}
												/>
											</div>
										</div>
									) : user?.billingAddress &&
									  Object.values(user.billingAddress).some((v) => v) ? (
										<div className="bg-gray-50 p-4 rounded-md">
											<div className="mb-1">
												{user.billingAddress.firstName}{" "}
												{user.billingAddress.lastName}
											</div>
											{user.billingAddress.company && (
												<div className="mb-1">
													{user.billingAddress.company}
												</div>
											)}
											<div className="mb-1">{user.billingAddress.address1}</div>
											{user.billingAddress.address2 && (
												<div className="mb-1">
													{user.billingAddress.address2}
												</div>
											)}
											<div className="mb-1">
												{user.billingAddress.city}{" "}
												{user.billingAddress.postalCode}
											</div>
											<div className="mb-1">{user.billingAddress.country}</div>
											{user.billingAddress.phone && (
												<div className="mb-1">
													{t("Phone")}: {user.billingAddress.phone}
												</div>
											)}
										</div>
									) : useSameAddress ? (
										<p className="text-gray-500">
											{t("SameAsShippingAddress")}
										</p>
									) : (
										<p className="text-gray-500">
											{t("NoBillingAddressProvided")}
										</p>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</TabsContent>
			</Tabs>

			{/* Action Buttons */}
			<div className="mt-6 flex gap-2">
				{isEditing ? (
					<>
						<Button onClick={handleSave} disabled={isSaving}>
							{isSaving ? t("saving") : t("saveChanges")}
						</Button>
						<Button
							variant="outline"
							onClick={handleCancel}
							disabled={isSaving}
						>
							{t("Cancel")}
						</Button>
					</>
				) : (
					<Button onClick={() => setIsEditing(true)}>{t("EditProfile")}</Button>
				)}
			</div>
		</div>
	);
}

function ProfileSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-10 w-full" />
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-1/3" />
					<Skeleton className="h-4 w-2/3" />
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
