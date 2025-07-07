// client/src/app/[locale]/(store)/favorite-bundles/[id]/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthOnly } from "@/app/[locale]/(components)/auth/ServerAuth";
import { getBundleById } from "@/app/actions/bundleActions";
import BundleDetailContent from "../components/BundleDetailContent";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import { Skeleton } from "@/shadcn/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/shadcn/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BundleDetailPageProps {
	params: Promise<{
		id: string;
		locale: string;
	}>;
}

export async function generateMetadata({
	params,
}: BundleDetailPageProps): Promise<Metadata> {
	const { id } = await params;
	const bundle = await getBundleById(parseInt(id));

	return {
		title: bundle ? `${bundle.name} | Product Bundle` : "Product Bundle | Griptech",
		description: bundle?.description || "Manage your product bundle",
	};
}

export default async function BundleDetailPage({
	params,
}: BundleDetailPageProps) {
	const { id } = await params;

	const t = await getTranslations();
	const bundleId = parseInt(id);

	// Validate bundle ID
	if (isNaN(bundleId)) {
		notFound();
	}

	return (
		<SectionWrapper className="py-8">
			<InnerWrapper>
				<AuthOnly>
					<div className="mx-auto">
						<Link href="/favorite-bundles">
							<Button variant="ghost" className="mb-4">
								<ArrowLeft className="w-4 h-4 mr-2" />
								{t("BackToBundles")}
							</Button>
						</Link>

						<Suspense fallback={<BundleDetailSkeleton />}>
							<BundleDetail bundleId={bundleId} />
						</Suspense>
					</div>
				</AuthOnly>
			</InnerWrapper>
		</SectionWrapper>
	);
}

async function BundleDetail({ bundleId }: { bundleId: number }) {
	const bundle = await getBundleById(bundleId);

	if (!bundle) {
		notFound();
	}

	return <BundleDetailContent bundle={bundle} />;
}

function BundleDetailSkeleton() {
	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow-sm p-6">
				<Skeleton className="h-8 w-1/3 mb-2" />
				<Skeleton className="h-4 w-2/3" />
			</div>
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="bg-white rounded-lg shadow-sm p-4">
						<div className="flex gap-4">
							<Skeleton className="w-24 h-24 rounded-md" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
