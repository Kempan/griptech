// terms/page.tsx
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import Header from "@/app/[locale]/(components)/Header/ClientHeader";
import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
	const t = await getTranslations("legal.terms");

	return (
		<SectionWrapper>
			<InnerWrapper>
				<Header text={t("title")} />
				<div className="flex flex-col gap-6">
					<p className="text-gray-500">
						{t("lastUpdated", { date: "August 1, 2023" })}
					</p>

					<div className="prose max-w-none">
						{/* Use translations for the content */}
						<p>{t("intro")}</p>

						<h2>{t("sections.information.title")}</h2>
						<p>{t("sections.information.content")}</p>

						{/* More sections using translations */}
					</div>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}
