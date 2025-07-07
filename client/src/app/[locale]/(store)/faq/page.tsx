// faq/page.tsx
import { Badge } from "@/shadcn/components/ui/badge";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import { getTranslations } from "next-intl/server";

export default async function FAQPage() {
	// Get translations for the FAQ section
	const t = await getTranslations("faq");

	// Get the FAQ items directly from translations
	// We'll use t.raw() to get the entire array
	const faqItems = t.raw("items");

	return (
		<SectionWrapper>
			<InnerWrapper>
				<div className="">
					<div className="text-center">
						<Badge className="text-lg py-2 px-4 font-medium">
							{t("badge")}
						</Badge>
						<h1 className="mt-4 text-4xl font-semibold">{t("title")}</h1>
						<p className="mt-6 font-medium text-muted-foreground">
							{t("subtitle")}
						</p>
					</div>

					<div className="mx-auto mt-14 max-w-(--breakpoint-sm)">
						{Array.isArray(faqItems) &&
							faqItems.map((faq, index) => (
								<div key={index} className="mb-8 flex gap-4">
									<span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-xs text-primary">
										{index + 1}
									</span>
									<div>
										<h3 className="mb-2 font-medium">{faq.question}</h3>
										<p className="text-sm text-muted-foreground">
											{faq.answer}
										</p>
									</div>
								</div>
							))}
					</div>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}
