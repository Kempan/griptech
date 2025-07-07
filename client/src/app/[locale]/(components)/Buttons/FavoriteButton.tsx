// client/src/app/[locale]/(components)/Buttons/FavoriteButton.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { cn } from "@/shadcn/lib/utils";
import { toggleFavorite, checkFavorites } from "@/app/actions/favoriteActions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface FavoriteButtonProps {
	productId: string | number;
	productSlug?: string;
	size?: "sm" | "default" | "lg" | "icon";
	variant?: "default" | "outline" | "ghost";
	showText?: boolean;
	className?: string;
	onToggle?: (isFavorited: boolean) => void;
}

export default function FavoriteButton({
	productId,
	productSlug,
	size = "icon",
	variant = "ghost",
	showText = false,
	className,
	onToggle,
}: FavoriteButtonProps) {
	const t = useTranslations();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isFavorited, setIsFavorited] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// Check if product is favorited on mount
	useEffect(() => {
		const checkFavoriteStatus = async () => {
			const numericId =
				typeof productId === "string" ? parseInt(productId, 10) : productId;
			const favoriteStatus = await checkFavorites([numericId]);
			setIsFavorited(favoriteStatus[numericId] || false);
			setIsInitialized(true);
		};

		checkFavoriteStatus();
	}, [productId]);

	const handleToggle = async (e: React.MouseEvent) => {
		// Prevent event bubbling (e.g., when button is inside a clickable card)
		e.preventDefault();
		e.stopPropagation();

		setIsLoading(true);

		startTransition(async () => {
			const result = await toggleFavorite(productId);

			if (result.success) {
				setIsFavorited(result.isFavorited);
				onToggle?.(result.isFavorited);
			} else if (result.message === "Not authenticated") {
				// Redirect to login with return URL
				const returnUrl = productSlug
					? `/product/${productSlug}`
					: window.location.pathname;
				router.push(`/login?returnUrl=${returnUrl}`);
			}

			setIsLoading(false);
		});
	};

	// Don't render until we've checked the initial state
	if (!isInitialized) {
		return (
			<Button
				size={size}
				variant={variant}
				className={cn("relative", className)}
				disabled
			>
				<Heart
					className={cn(
						"transition-all duration-200",
						showText ? "w-4 h-4 mr-2" : "w-4 h-4"
					)}
				/>
				{showText && t("AddToWishlist")}
			</Button>
		);
	}

	return (
		<Button
			size={size}
			variant={variant}
			className={cn(
				"relative transition-all duration-200",
				isFavorited &&
					variant === "outline" &&
					"border-red-500 bg-red-50 hover:bg-red-100",
				isFavorited &&
					variant === "ghost" &&
					"text-red-500 hover:text-red-600 hover:bg-red-50",
				className
			)}
			onClick={handleToggle}
			disabled={isLoading || isPending}
			aria-label={isFavorited ? t("RemoveFromWishlist") : t("AddToWishlist")}
		>
			<Heart
				className={cn(
					"transition-all duration-200",
					showText ? "w-4 h-4 mr-2" : "w-4 h-4",
					isFavorited ? "fill-current" : "",
					isLoading && "animate-pulse"
				)}
			/>
			{showText && (isFavorited ? t("RemoveFromWishlist") : t("AddToWishlist"))}
		</Button>
	);
}
