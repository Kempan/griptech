// client/src/app/[locale]/(store)/favorites/components/BundlesList.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserBundles } from "@/app/actions/bundleActions";
import BundleCard from "./BundleCard";
import { ProductBundle } from "@/app/actions/bundleActions";
import { useTranslations } from "next-intl";
import { Package } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Skeleton } from "@/shadcn/components/ui/skeleton";

export default function BundlesList() {
	const t = useTranslations();
	const [bundles, setBundles] = useState<ProductBundle[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const loadBundles = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getUserBundles({ page: currentPage, pageSize: 6 });
			setBundles(response.bundles);
			setTotalPages(response.pageCount);
		} catch (error) {
			console.error("Error loading bundles:", error);
		} finally {
			setLoading(false);
		}
	}, [currentPage]);

	useEffect(() => {
		loadBundles();
	}, [loadBundles]);

	if (loading) {
		return <BundlesListSkeleton />;
	}

	if (bundles.length === 0) {
		return (
			<div className="text-center py-12 bg-gray-50 rounded-lg">
				<Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h2 className="text-xl font-semibold mb-2">{t("NoBundles")}</h2>
				<p className="text-gray-600 mb-6">{t("CreateYourFirstBundle")}</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{bundles.map((bundle) => (
					<BundleCard key={bundle.id} bundle={bundle} />
				))}
			</div>

			{totalPages > 1 && (
				<div className="flex justify-center gap-2 mt-8">
					<Button
						variant="outline"
						onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
						disabled={currentPage === 1}
					>
						{t("Previous")}
					</Button>
					<span className="py-2 px-4">
						{t("Page")} {currentPage} {t("of")} {totalPages}
					</span>
					<Button
						variant="outline"
						onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
					>
						{t("Next")}
					</Button>
				</div>
			)}
		</>
	);
}

function BundlesListSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{[...Array(3)].map((_, i) => (
				<div key={i} className="bg-white rounded-lg shadow-sm p-6">
					<Skeleton className="h-6 w-3/4 mb-2" />
					<Skeleton className="h-4 w-full mb-4" />
					<div className="space-y-2">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				</div>
			))}
		</div>
	);
}
