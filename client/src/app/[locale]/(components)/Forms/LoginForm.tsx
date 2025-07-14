"use client";

import { useState } from "react";
import { z } from "zod";
import { useLoginUserMutation } from "@/app/state/api";
import { useTranslations } from "next-intl";
import { cn } from "@/shadcn/lib/utils";
import { Button } from "@/shadcn/components/ui/button";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation"; // Add this import

// 🔹 Define Zod schema for validation
const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(5, "Password must be at least 8 characters"),
});

export default function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const t = useTranslations();
	const router = useRouter(); // Add this hook
	const [login, { isLoading }] = useLoginUserMutation();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [formErrors, setFormErrors] = useState<{
		email?: string;
		password?: string;
	}>({});
	const [loginError, setLoginError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoginError(null);

		// 🔹 Validate form inputs using Zod
		const result = loginSchema.safeParse({ email, password });

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			setFormErrors({
				email: errors.email?.[0],
				password: errors.password?.[0],
			});
			return;
		}

		setFormErrors({}); // Clear previous errors if validation passes

		try {
			const response = await login({ email, password }).unwrap();

			// Check if user has admin role and redirect accordingly
			if (response.user && response.user.roles.includes("admin")) {
				router.push("/admin"); // Redirect to admin panel
			} else {
				router.push("/"); // Redirect to home page
			}
		} catch (err) {
			console.error("Login error:", err);
			if (
				typeof err === "object" &&
				err !== null &&
				"data" in err &&
				typeof err.data === "object" &&
				err.data !== null &&
				"message" in err.data
			) {
				setLoginError(
					(err.data as { message?: string }).message || t("LoginFailed")
				);
			} else {
				setLoginError(t("LoginFailed"));
			}
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form onSubmit={handleSubmit} className="p-6 md:p-8 min-h-[485px]">
						<div className="flex flex-col justify-center h-full gap-6">
							<div className="flex flex-col items-center text-center">
								<h1 className="text-2xl font-bold">{t("WelcomeBack")}</h1>
								<p className="text-muted-foreground">{t("LoginToAccount")}</p>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="email">{t("Email")}</Label>
								<Input
									id="email"
									type="email"
									placeholder={t("Email")}
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
								{formErrors.email && (
									<p className="text-red-500 text-sm">{formErrors.email}</p>
								)}
							</div>

							<div className="grid gap-2">
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
								<div className="flex items-center">
									<Label htmlFor="password">{t("Password")}</Label>
									<a
										href="#"
										className="ml-auto text-sm underline-offset-2 hover:underline"
									>
										{t("ForgotPassword")}
									</a>
								</div>
								{formErrors.password && (
									<p className="text-red-500 text-sm">{formErrors.password}</p>
								)}
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? t("LoggingIn") : t("Login")}
							</Button>

							{loginError && (
								<p className="text-red-500 text-sm text-center">{loginError}</p>
							)}

							<div className="text-center text-sm">
								{t("DontHaveAccount")}{" "}
								<a href="#" className="underline underline-offset-4">
									{t("SignUp")}
								</a>
							</div>
						</div>
					</form>

					<div className="relative hidden bg-muted md:block">
						<Image
							src="/images/login-wibo.webp"
							alt="Login image"
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
							width={800}
							height={600}
							priority
						/>
					</div>
				</CardContent>
			</Card>

			<div className="text-center text-md text-muted-foreground">
				{t("ByContinuing")}{" "}
				<Link href="/terms" className="underline">
					{t("TermsOfService")}
				</Link>{" "}
				{t("And")}{" "}
				<Link href="/policy" className="underline">
					{t("PrivacyPolicy")}
				</Link>
				.
			</div>
		</div>
	);
}
