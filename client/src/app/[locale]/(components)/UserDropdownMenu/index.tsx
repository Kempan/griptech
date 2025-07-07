"use client";

import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useGetAuthStatusQuery, useLogoutUserMutation } from "@/app/state/api";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu";
import LoadingErrorHandler from "@/app/[locale]/(components)/LoadingErrorHandler";
import { useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";

const UserDropdownMenu = () => {
	const t = useTranslations();
	const router = useRouter();
	const { isLoggedIn, isAdmin, isLoading, isError, refetch } = useAuth();
	const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();

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
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<User
					className="cursor-pointer transition-colors"
					size={24}
					strokeWidth={1.5}
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<LoadingErrorHandler
					isLoading={isLoading}
					isError={isError}
					data={{ isLoggedIn }}
					errorMessage="Failed to check authentication status."
					loadingMessage=""
				>
					<DropdownMenuLabel>
						{isLoggedIn ? t("MyAccount") : t("Account")}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{isLoggedIn ? (
						// Logged in menu items
						<>
							<DropdownMenuItem asChild>
								<Link href="/profile" className="w-full cursor-pointer">
									{t("Profile")}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/orders" className="w-full cursor-pointer">
									{t("Orders")}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/favorites" className="w-full cursor-pointer">
									{t("FavoriteList")}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link
									href="/favorite-bundles"
									className="w-full cursor-pointer"
								>
									{t("ProductBundles")}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/" className="w-full cursor-pointer">
									{t("Addresses")}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								disabled={isLoggingOut}
								className="cursor-pointer"
								onClick={handleLogout}
							>
								{isLoggingOut ? t("LoggingOut") : t("Logout")}
							</DropdownMenuItem>
						</>
					) : (
						// Not logged in menu items
						<>
							<DropdownMenuItem asChild>
								<Link href="/login" className="w-full cursor-pointer">
									{t("Login")}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/" className="w-full cursor-pointer">
									{t("Register")}
								</Link>
							</DropdownMenuItem>
						</>
					)}
				</LoadingErrorHandler>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserDropdownMenu;
