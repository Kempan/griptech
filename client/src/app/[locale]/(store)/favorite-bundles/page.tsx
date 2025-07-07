// client/src/app/[locale]/(store)/favorite-bundles/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { AuthOnly } from "@/app/[locale]/(components)/auth/ServerAuth";
import BundlesHeader from "./components/BundlesHeader";
import BundlesList from "./components/BundlesList";
import FavoritesTabContent from "@/app/[locale]/(store)/favorites/components/FavoritesTabContent";
import GuestFallback from "./components/GuestFallback";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import { Skeleton } from "@/shadcn/components/ui/skeleton";

export const metadata: Metadata = {
	title: "Product Bundles | Griptech",
	description: "Create and manage your product bundles",
};

export default async function FavoriteBundlesPage() {
	return (
		<SectionWrapper className="py-8">
			<InnerWrapper>
				<AuthOnly fallback={<GuestFallback />}>
					<FavoritesTabContent />
					<div className="mx-auto">
						<BundlesHeader />
						<Suspense fallback={<BundlesListSkeleton />}>
							<BundlesList />
						</Suspense>
					</div>
				</AuthOnly>
			</InnerWrapper>
		</SectionWrapper>
	);
}

function BundlesListSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{[...Array(6)].map((_, i) => (
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
