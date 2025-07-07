// client/src/app/[locale]/(store)/account/profile/components/UserBundles.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { getUserBundles, ProductBundle } from "@/app/actions/bundleActions";
import { Button } from "@/shadcn/components/ui/button";
import { Package, Edit, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { Badge } from "@/shadcn/components/ui/badge";
import { useCart } from "@/app/state/cartHooks";
import { toast } from "sonner";

interface UserBundlesProps {
	locale: string;
}

export default function UserBundles({ locale }: UserBundlesProps) {
	const t = useTranslations();
	const { addItemToCart } = useCart();
	const [bundles, setBundles] = useState<ProductBundle[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const loadBundles = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await getUserBundles({
				page: currentPage,
				pageSize: 6,
			});
			setBundles(response.bundles);
			setTotalPages(response.pageCount);
		} catch (error) {
			console.error("Error loading bundles:", error);
			setBundles([]);
		} finally {
			setIsLoading(false);
		}
	}, [currentPage]);

	const handleAddBundleToCart = (bundle: ProductBundle) => {
		const validItems = bundle.items.filter((item) => item.product);

		if (validItems.length === 0) {
			toast.error(t("NoItemsToAdd"));
			return;
		}

		let successCount = 0;
		for (const item of validItems) {
			if (item.product) {
				addItemToCart({
					productId: item.product.id.toString(),
					name: item.product.name,
					price: item.product.price,
					quantity: item.quantity,
					size: "",
					slug: item.product.slug,
					cartItemId: `${item.product.id}-${Date.now()}-${Math.random()}`,
				});
				successCount++;
			}
		}

		if (successCount === validItems.length) {
			toast.success(t("BundleAddedToCart", { name: bundle.name }));
		}
	};

	useEffect(() => {
		loadBundles();
	}, [loadBundles]);

	if (isLoading) {
		return <BundlesSkeleton />;
	}

	if (bundles.length === 0) {
		return (
			<div className="text-center py-12">
				<Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h3 className="text-lg font-medium mb-2">{t("NoBundlesYet")}</h3>
				<p className="text-gray-500 mb-4">{t("CreateYourFirstBundle")}</p>
				<Link href={`/${locale}/favorite-bundles`}>
					<Button>{t("GoToBundles")}</Button>
				</Link>
			</div>
		);
	}

	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{bundles.map((bundle) => {
					const totalPrice = bundle.items.reduce((sum, item) => {
						return (
							sum + (item.product ? item.product.price * item.quantity : 0)
						);
					}, 0);
					const totalItems = bundle.items.reduce(
						(sum, item) => sum + item.quantity,
						0
					);

					return (
						<div
							key={bundle.id}
							className="border rounded-lg p-4 hover:shadow-md transition-shadow"
						>
							<div className="flex justify-between items-start mb-2">
								<h3 className="font-semibold text-lg">{bundle.name}</h3>
								<Badge variant="secondary">
									{totalItems} {t("Items")}
								</Badge>
							</div>

							{bundle.description && (
								<p className="text-sm text-gray-600 mb-3 line-clamp-2">
									{bundle.description}
								</p>
							)}

							<div className="mb-4">
								<p className="text-sm text-gray-500">{t("TotalValue")}</p>
								<p className="text-xl font-bold text-gray-800">
									{formatCurrency(totalPrice, "SEK")}
								</p>
							</div>

							<div className="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									className="flex-1"
									onClick={() => handleAddBundleToCart(bundle)}
								>
									<ShoppingCart className="w-4 h-4 mr-2" />
									{t("AddToCart")}
								</Button>
								<Link href={`/${locale}/favorite-bundles/${bundle.id}`}>
									<Button size="sm" variant="outline">
										<Edit className="w-4 h-4" />
									</Button>
								</Link>
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

function BundlesSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{[...Array(4)].map((_, i) => (
				<div key={i} className="border rounded-lg p-4">
					<Skeleton className="h-6 w-3/4 mb-2" />
					<Skeleton className="h-4 w-full mb-3" />
					<Skeleton className="h-8 w-1/3 mb-3" />
					<Skeleton className="h-10 w-full" />
				</div>
			))}
		</div>
	);
}
