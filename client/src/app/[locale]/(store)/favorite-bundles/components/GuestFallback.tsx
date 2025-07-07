// client/src/app/[locale]/(store)/favorite-bundles/components/GuestFallback.tsx
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/shadcn/components/ui/button";

export default async function GuestFallback() {
	const t = await getTranslations();
	return (
		<div className="max-w-md mx-auto text-center py-12">
			<h1 className="text-2xl font-bold mb-4">{t("signInToViewBundles")}</h1>
			<p className="text-gray-600 mb-6">
				{t("youNeedToBeSignedInToCreateAndManageProductBundles")}
			</p>
			<Link href="/login?returnUrl=/favorite-bundles">
				<Button>{t("signIn")}</Button>
			</Link>
		</div>
	);
}
