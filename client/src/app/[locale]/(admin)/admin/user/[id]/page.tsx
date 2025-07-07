// client/src/app/[locale]/(admin)/admin/user/[id]/page.tsx
import { getUserById, updateUser } from "@/app/actions/admin/userActions";
import Header from "@/app/[locale]/(components)/Header/ClientHeader";
import { Button } from "@/shadcn/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserDetailClient } from "../components/UserDetailClient";
import { getTranslations } from "next-intl/server";
interface UserDetailProps {
	params: Promise<{
		id: string;
		locale: string;
	}>;
}

export default async function UserDetail({ params }: UserDetailProps) {
	const { id, locale } = await params;
	const t = await getTranslations();
	const userId = parseInt(id, 10);

	try {
		const user = await getUserById(userId);

		if (!user) {
			return notFound();
		}

		return (
			<div className="flex flex-col">
				<div className="flex justify-between items-center">
					<Header text={`User: ${user.name}`} />
					<Link href={`/${locale}/admin/users`}>
						<Button variant="outline">{t("backToUsers")}</Button>
					</Link>
				</div>

				<UserDetailClient user={user} locale={locale} />
			</div>
		);
	} catch (error) {
		console.error("Error fetching user:", error);
		return (
			<div className="flex flex-col">
				<Header text={t("userDetail")} />
				<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
					<p className="text-red-500">{t("failedToLoadUserDetails")}</p>
					<Link
						href={`/${locale}/admin/users`}
						className="mt-4 inline-block"
					>
						<Button variant="outline">{t("backToUsers")}</Button>
					</Link>
				</div>
			</div>
		);
	}
}
