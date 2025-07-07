"use client";

import { useState } from "react";
import { z } from "zod";
import { cn } from "@/shadcn/lib/utils";
import { Button } from "@/shadcn/components/ui/button";
import { Card, CardContent } from "@/shadcn/components/ui/card";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import { Textarea } from "@/shadcn/components/ui/textarea"; // Ensure this path is correct or create the Textarea component if it doesn't exist
import Image from "next/image";
import { useTranslations } from "next-intl";

// 🔹 Define Zod schema for validation
const contactSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	business: z.string().optional(),
	email: z.string().email("Invalid email format"),
	message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const t = useTranslations();
	const [name, setName] = useState("");
	const [business, setBusiness] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [formErrors, setFormErrors] = useState<{
		name?: string;
		business?: string;
		email?: string;
		message?: string;
	}>({});
	const [formStatus, setFormStatus] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormStatus(null); // Reset status messages

		// 🔹 Validate form inputs using Zod
		const result = contactSchema.safeParse({ name, business, email, message });

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			setFormErrors({
				name: errors.name?.[0],
				business: errors.business?.[0],
				email: errors.email?.[0],
				message: errors.message?.[0],
			});
			return;
		}

		setFormErrors({}); // Clear previous errors if validation passes
		setIsLoading(true);

		try {
			// Simulate sending the form data to an API endpoint
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, business, email, message }),
			});

			if (!response.ok) {
				throw new Error("Failed to send message");
			}

			setFormStatus({ type: "success", message: "Message sent successfully!" });
			setName("");
			setBusiness("");
			setEmail("");
			setMessage("");
		} catch (err) {
			setFormStatus({
				type: "error",
				message: "Something went wrong. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form onSubmit={handleSubmit} className="p-6 md:p-8 min-h-[485px]">
						<div className="flex flex-col justify-center h-full gap-6">
							<div className="flex flex-col items-center text-center">
								<h1 className="text-2xl font-bold">{t("ContactUs")}</h1>
								<p className="text-muted-foreground">
									{t("HearFromYou")}
								</p>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="name">{t("Name")}</Label>
								<Input
									id="name"
									type="text"
									placeholder={t("YourName")}
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
								{formErrors.name && (
									<p className="text-red-500 text-sm">{formErrors.name}</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="business">{t("Business")}</Label>
								<Input
									id="business"
									type="text"
									placeholder={t("YourBusinessName")}
									value={business}
									onChange={(e) => setBusiness(e.target.value)}
								/>
								{formErrors.business && (
									<p className="text-red-500 text-sm">{formErrors.business}</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="email">{t("Email")}</Label>
								<Input
									id="email"
									type="email"
									placeholder={t("YourEmail")}
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
								{formErrors.email && (
									<p className="text-red-500 text-sm">{formErrors.email}</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="message">{t("Message")}</Label>
								<Textarea
									id="message"
									placeholder={t("YourMessage")}
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									required
									className="resize-none"
								/>
								{formErrors.message && (
									<p className="text-red-500 text-sm">{formErrors.message}</p>
								)}
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? t("Sending...") : t("SendMessage")}
							</Button>

							{/* Show success or error message */}
							{formStatus && (
								<p
									className={`text-sm text-center ${
										formStatus.type === "success"
											? "text-green-500"
											: "text-red-500"
									}`}
								>
									{formStatus.message}
								</p>
							)}
						</div>
					</form>

					<div className="relative hidden bg-muted md:block">
						<Image
							src="/images/login-wibo.webp"
							alt="Contact image"
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
							width={800}
							height={600}
							priority
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
