"use client";

import { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import { Checkbox } from "@/shadcn/components/ui/checkbox";
import { createUser } from "@/app/actions/admin/userActions";
import { PlusCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface CreateUserProps {
	onUserCreated: (newUser: any) => void;
}

export default function CreateUser({ onUserCreated }: CreateUserProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [roles, setRoles] = useState<string[]>(["customer"]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const t = useTranslations();
	// Toggle role selection
	const handleRoleToggle = (role: string) => {
		if (roles.includes(role)) {
			setRoles(roles.filter((r) => r !== role));
		} else {
			setRoles([...roles, role]);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!name || !email || !password) {
			setError("Name, email, and password are required");
			return;
		}

		// Ensure at least one role is selected
		if (roles.length === 0) {
			setRoles(["customer"]);
		}

		setIsSubmitting(true);
		setError("");

		try {
			const newUser = await createUser({
				name,
				email,
				password,
				roles,
			});

			if (newUser) {
				// Reset form
				setName("");
				setEmail("");
				setPassword("");
				setRoles(["customer"]);
				setIsOpen(false);

				// Notify parent component
				onUserCreated(newUser);
			} else {
				setError("Failed to create user");
			}
		} catch (err) {
			setError("An error occurred while creating the user");
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="">
			{!isOpen ? (
				<Button onClick={() => setIsOpen(true)}>
					<PlusCircleIcon className="w-5 h-5" />
					{t("createUser")}
				</Button>
			) : (
				<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
					<h2 className="text-lg font-semibold mb-4">{t("createUser")}</h2>

					{error && (
						<div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="create-name">{t("name")}</Label>
							<Input
								id="create-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t("userName")}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="create-email">{t("email")}</Label>
							<Input
								id="create-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="user@example.com"
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="create-password">{t("password")}</Label>
							<Input
								id="create-password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={t("password")}
								className="mt-1"
							/>
						</div>

						<div>
							<Label className="block mb-2">{t("userRoles")}</Label>
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="create-role-admin"
										checked={roles.includes("admin")}
										onCheckedChange={() => handleRoleToggle("admin")}
									/>
									<Label htmlFor="create-role-admin">{t("admin")}</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="create-role-customer"
										checked={roles.includes("customer")}
										onCheckedChange={() => handleRoleToggle("customer")}
									/>
									<Label htmlFor="create-role-customer">{t("customer")}</Label>
								</div>
							</div>
						</div>

						<div className="flex gap-2 pt-2">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? t("creating") : t("createUser")}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
								disabled={isSubmitting}
							>
								{t("cancel")}
							</Button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
