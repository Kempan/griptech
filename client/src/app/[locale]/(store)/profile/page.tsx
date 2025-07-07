// client/src/app/[locale]/(store)/profile/page.tsx
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAuthStatus } from "@/app/actions/authActions";
import { redirect } from "next/navigation";
import UserProfileClient from "./components/UserProfileClient";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";

export const metadata: Metadata = {
	title: "My Profile | Griptech",
	description: "Manage your profile and account settings",
};

export default async function ProfilePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations();
	const authStatus = await getAuthStatus();

	// Redirect to login if not authenticated
	if (!authStatus.isLoggedIn) {
		redirect(`/${locale}/login?returnUrl=/profile`);
	}

	return (
		<SectionWrapper className="py-8">
			<InnerWrapper>
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold mb-2">{t("MyProfile")}</h1>
						<p className="text-gray-600">{t("ManageYourAccountSettings")}</p>
					</div>

					{/* Profile Component */}
					<UserProfileClient locale={locale} />
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}
