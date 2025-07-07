// src/app/[locale]/(store)/policy/page.tsx
import { getTranslations } from "next-intl/server";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import Header from "@/app/[locale]/(components)/Header/ClientHeader";
import TableOfContents from "./components/TableOfContents";

export default async function PolicyPage() {
	const t = await getTranslations("policy");

	// Format date according to locale
	const lastUpdated = new Date(t("lastUpdated"));
	const formattedDate = lastUpdated.toLocaleDateString(t("locale"), {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Generate IDs for section headings (for anchor links)
	const sections = [
		{ id: "collect", title: t("sections.collect.title") },
		{ id: "use", title: t("sections.use.title") },
		{ id: "protect", title: t("sections.protect.title") },
		{ id: "cookies", title: t("sections.cookies.title") },
		{
			id: "thirdPartyDisclosure",
			title: t("sections.thirdPartyDisclosure.title"),
		},
		{ id: "thirdPartyLinks", title: t("sections.thirdPartyLinks.title") },
		{ id: "google", title: t("sections.google.title") },
		{ id: "california", title: t("sections.california.title") },
		{ id: "children", title: t("sections.children.title") },
		{ id: "fairInfo", title: t("sections.fairInfo.title") },
		{ id: "spam", title: t("sections.spam.title") },
		{ id: "contact", title: t("sections.contact.title") },
	];

	return (
		<SectionWrapper>
			<InnerWrapper>
				<div className="flex flex-col md:flex-row gap-8 mx-auto">
					{/* Table of Contents - Visible on medium screens and up */}
					<aside className="md:w-64 lg:w-72 shrink-0 hidden md:block">
						<div className="sticky top-24">
							<TableOfContents sections={sections} />
						</div>
					</aside>

					{/* Main Content */}
					<div className="flex-1">
						<div className="flex flex-col gap-6">
							<div className="space-y-2">
								<Header text={t("title")} />
								<p className="text-gray-500 dark:text-gray-400">
									{t("lastUpdatedText")}: {formattedDate}
								</p>
							</div>

							{/* Introduction */}
							<div className="space-y-4">
								<p className="text-gray-700 dark:text-gray-300">
									{t("intro.p1")}
								</p>
								<p className="text-gray-700 dark:text-gray-300">
									{t("intro.p2")}
								</p>
								<p className="text-gray-700 dark:text-gray-300">
									{t("intro.p3")}
								</p>
								<p className="text-gray-700 dark:text-gray-300">
									{t("intro.p4")}
								</p>
							</div>

							{/* Detailed Sections */}
							<div className="grid gap-6 border border-gray-200 rounded-lg p-6 bg-gray-50 w-full text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50">
								{sections.map((section) => (
									<section
										key={section.id}
										id={section.id}
										className="space-y-3 scroll-mt-24"
									>
										<h2 className="text-xl font-semibold">{section.title}</h2>
										<div className="text-gray-700 dark:text-gray-300">
											{section.id === "use" ? (
												<>
													<p className="mb-3">{t(`sections.use.content`)}</p>
													<ul className="list-disc pl-6 space-y-2">
														{Array.from({
															length: t.raw("sections.use.list.length"),
														}).map((_, i) => (
															<li key={i}>{t(`sections.use.list.${i}`)}</li>
														))}
													</ul>
												</>
											) : (
												<p>{t(`sections.${section.id}.content`)}</p>
											)}
										</div>
									</section>
								))}
							</div>
						</div>
					</div>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}
