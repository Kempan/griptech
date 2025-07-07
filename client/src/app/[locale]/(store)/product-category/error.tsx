"use client";

import { InnerWrapper, SectionWrapper } from "../../(components)/Wrappers";
import { Button } from "@/shadcn/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react"; // Import icons
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Error({ reset }: { reset: () => void }) {
	const t = useTranslations();

	return (
		<SectionWrapper>
			<InnerWrapper>
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<div className="bg-red-50 p-6 rounded-lg max-w-md w-full">
						<h2 className="text-xl font-semibold text-red-700 mb-3">
							{t("categoryNotFound")}
						</h2>
						<p className="text-gray-700 mb-6">
							{t("categoryNotFoundDescription")}
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Button
								onClick={() => reset()}
								className="flex items-center gap-2"
							>
								<RefreshCw size={16} />
								{t("tryAgain")}
							</Button>

							<Link href="/categories" passHref>
								<Button variant="outline" className="flex items-center gap-2">
									<ArrowLeft size={16} />
									{t("browseCategories")}
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}
