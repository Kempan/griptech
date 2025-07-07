"use client";

import { useRouter } from "next/navigation";
import { useGetAuthStatusQuery, useLogoutUserMutation } from "@/app/state/api";
import { Button } from "@/shadcn/components/ui/button";
import { useCallback } from "react";
import LoadingErrorHandler from "@/app/[locale]/(components)/LoadingErrorHandler";
import { useTranslations } from "next-intl";

export default function AuthButton() {
	const { data, isLoading, isError } = useGetAuthStatusQuery();
	const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();
	const router = useRouter();
	const t = useTranslations();

	// Logout function with useCallback to prevent unnecessary re-renders
	const handleLogout = useCallback(async () => {
		try {
			await logoutUser().unwrap();
			router.push("/");
		} catch (error) {
			console.error("Logout failed:", error);
			alert("Something went wrong. Please try again.");
		}
	}, [logoutUser, router]);

	return (
		<LoadingErrorHandler
			isLoading={isLoading}
			isError={isError}
			data={data}
			errorMessage="Failed to check authentication status."
			loadingMessage=""
		>
			{data?.isLoggedIn ? (
				<Button
					onClick={handleLogout}
					variant="error"
					disabled={isLoggingOut} // Disable button while logging out
					aria-busy={isLoggingOut} // Accessibility improvement
				>
					{isLoggingOut ? t("LoggingIn") : t("Logout")}
				</Button>
			) : (
				<Button onClick={() => router.push("/login")}>{t("Login")}</Button>
			)}
		</LoadingErrorHandler>
	);
}
