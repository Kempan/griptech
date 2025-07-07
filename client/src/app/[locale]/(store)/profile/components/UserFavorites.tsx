// client/src/app/[locale]/(store)/account/profile/components/UserFavorites.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { getUserFavorites, Favorite } from "@/app/actions/favoriteActions";
import { Button } from "@/shadcn/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { Badge } from "@/shadcn/components/ui/badge";
import { useCart } from "@/app/state/cartHooks";

interface UserFavoritesProps {
	locale: string;
}

export default function UserFavorites({ locale }: UserFavoritesProps) {
	const t = useTranslations();
	const { addItemToCart } = useCart();
	const [favorites, setFavorites] = useState<Favorite[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const loadFavorites = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await getUserFavorites({
				page: currentPage,
				pageSize: 8,
			});
			setFavorites(response.favorites);
			setTotalPages(response.pageCount);
		} catch (error) {
			console.error("Error loading favorites:", error);
			setFavorites([]);
		} finally {
			setIsLoading(false);
		}
	}, [currentPage]);

	const handleAddToCart = (favorite: Favorite) => {
		if (!favorite.product) return;

		addItemToCart({
			productId: favorite.product.id.toString(),
			name: favorite.product.name,
			price: favorite.product.price,
			quantity: 1,
			size: "",
			slug: favorite.product.slug,
			cartItemId: `${favorite.product.id}-${Date.now()}`,
		});
	};

	useEffect(() => {
		loadFavorites();
	}, [loadFavorites]);

	if (isLoading) {
		return <FavoritesSkeleton />;
	}

	if (favorites.length === 0) {
		return (
			<div className="text-center py-12">
				<Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h3 className="text-lg font-medium mb-2">{t("NoFavoritesYet")}</h3>
				<p className="text-gray-500 mb-4">{t("StartAddingFavorites")}</p>
				<Link href={`/${locale}/products`}>
					<Button>{t("BrowseProducts")}</Button>
				</Link>
			</div>
		);
	}

	return (
		<div>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{favorites.map((favorite) => {
					if (!favorite.product) return null;

					return (
						<div key={favorite.id} className="group">
							<Link href={`/${locale}/product/${favorite.product.slug}`}>
								<div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
									<Image
										src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/apelsin.jpg`}
										alt={favorite.product.name}
										fill
										className="object-cover group-hover:scale-105 transition-transform"
									/>
								</div>
							</Link>

							<div className="space-y-1">
								<Link href={`/${locale}/product/${favorite.product.slug}`}>
									<h3 className="font-medium text-sm line-clamp-1 hover:underline">
										{favorite.product.name}
									</h3>
								</Link>

								{favorite.product.categories &&
									favorite.product.categories.length > 0 && (
										<Badge variant="secondary" className="text-xs">
											{favorite.product.categories[0].name}
										</Badge>
									)}

								<p className="text-lg font-bold text-gray-800">
									{formatCurrency(favorite.product.price, "SEK")}
								</p>

								<Button
									size="sm"
									className="w-full"
									onClick={() => handleAddToCart(favorite)}
								>
									<ShoppingCart className="w-4 h-4 mr-2" />
									{t("AddToCart")}
								</Button>
							</div>
						</div>
					);
				})}
			</div>

			{totalPages > 1 && (
				<div className="flex justify-center gap-2 mt-6">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
						disabled={currentPage === 1}
					>
						{t("Previous")}
					</Button>
					<span className="py-2 px-4 text-sm">
						{t("Page")} {currentPage} {t("of")} {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
					>
						{t("Next")}
					</Button>
				</div>
			)}
		</div>
	);
}

function FavoritesSkeleton() {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			{[...Array(8)].map((_, i) => (
				<div key={i}>
					<Skeleton className="aspect-square rounded-lg mb-2" />
					<Skeleton className="h-4 w-3/4 mb-1" />
					<Skeleton className="h-6 w-1/2 mb-2" />
					<Skeleton className="h-9 w-full" />
				</div>
			))}
		</div>
	);
}
