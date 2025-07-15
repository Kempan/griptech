// client/src/app/[locale]/(store)/favorite-bundles/page.tsx
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthOnly } from "@/app/[locale]/(components)/auth/ServerAuth";
import { getUserBundles } from "@/app/actions/bundleActions";
import BundlesHeader from "./components/BundlesHeader";
import BundleCard from "./components/BundleCard";
import FavoritesTabContent from "@/app/[locale]/(store)/favorites/components/FavoritesTabContent";
import GuestFallback from "./components/GuestFallback";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import { Package } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shadcn/lib/utils";

export const metadata: Metadata = {
	title: "Product Bundles | Griptech",
	description: "Create and manage your product bundles",
};

// Server component that fetches and renders bundles
async function BundlesList({
	page = 1,
	pageSize = 6,
}: {
	page?: number;
	pageSize?: number;
}) {
	const t = await getTranslations();
	const response = await getUserBundles({ page, pageSize });

	if (response.bundles.length === 0) {
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
				{response.bundles.map((bundle) => (
					<BundleCard key={bundle.id} bundle={bundle} />
				))}
			</div>

			{response.pageCount > 1 && (
				<Pagination currentPage={page} totalPages={response.pageCount} />
			)}
		</>
	);
}

// Server component for pagination	
async function Pagination({
	currentPage,
	totalPages,
}: {
	currentPage: number;
	totalPages: number;
}) {
	const t = await getTranslations();

	return (
		<div className="flex justify-center gap-2 mt-8">
			<Link
				href={`?page=${Math.max(1, currentPage - 1)}`}
				className={cn(
					"px-4 py-2 rounded border",
					currentPage === 1 && "pointer-events-none opacity-50"
				)}
			>
				{t("Previous")}
			</Link>
			<span className="py-2 px-4">
				{t("Page")} {currentPage} {t("of")} {totalPages}
			</span>
			<Link
				href={`?page=${Math.min(totalPages, currentPage + 1)}`}
				className={cn(
					"px-4 py-2 rounded border",
					currentPage === totalPages && "pointer-events-none opacity-50"
				)}
			>
				{t("Next")}
			</Link>
		</div>
	);
}

export default async function FavoriteBundlesPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const params = await searchParams;
	const currentPage = params.page ? parseInt(params.page) : 1;

	return (
		<SectionWrapper className="py-8">
			<InnerWrapper>
				<AuthOnly fallback={<GuestFallback />}>
					<FavoritesTabContent />
					<div className="mx-auto">
						<BundlesHeader />
						<BundlesList page={currentPage} pageSize={6} />
					</div>
				</AuthOnly>
			</InnerWrapper>
		</SectionWrapper>
	);
}
