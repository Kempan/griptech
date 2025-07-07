// client/src/app/[locale]/(store)/favorites/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthOnly } from "@/app/[locale]/(components)/auth/ServerAuth";
import FavoritesList from "./components/FavoritesList";
import FavoritesHeader from "./components/FavoritesHeader";
import FavoritesTabContent from "./components/FavoritesTabContent";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/shadcn/components/ui/button";

export const metadata: Metadata = {
	title: "My Favorites | Griptech",
	description: "View and manage your favorite products",
};

export default async function FavoritesPage() {
	return (
		<SectionWrapper className="py-8">
			<InnerWrapper>
				<AuthOnly fallback={<GuestFallback />}>
					<FavoritesTabContent />
					<div className="mx-auto">
						<FavoritesHeader />

						<Suspense fallback={<FavoritesListSkeleton />}>
							<FavoritesList />
						</Suspense>
					</div>
				</AuthOnly>
			</InnerWrapper>
		</SectionWrapper>
	);
}

async function GuestFallback() {
	const t = await getTranslations();
	return (
		<div className="max-w-md mx-auto text-center py-12">
			<h1 className="text-2xl font-bold mb-4">{t("signInToViewFavorites")}</h1>
			<p className="text-gray-600 mb-6">
				{t("youNeedToBeSignedInToViewAndManageYourFavoriteProducts")}
			</p>
			<Link href="/login?returnUrl=/favorites">
				<Button>{t("signIn")}</Button>
			</Link>
		</div>
	);
}

function FavoritesListSkeleton() {
	return (
		<div className="space-y-4">
			{[...Array(3)].map((_, i) => (
				<div key={i} className="bg-white rounded-lg shadow-sm p-4">
					<div className="flex gap-4">
						<Skeleton className="w-24 h-24 rounded-md" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-4 w-1/4" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
