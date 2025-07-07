// src/app/[locale]/(store)/checkout/page.tsx
import { Suspense } from "react";
import CartContent from "./components/CartContent";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";

export default function CheckoutPage() {
	return (
		<SectionWrapper>
			<InnerWrapper>
				<div className="mx-auto max-w-[1000px]">
					<CartContent />

					<Suspense
						fallback={
							<div className="h-40 w-full animate-pulse bg-gray-100 rounded-lg mt-6"></div>
						}
					></Suspense>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}
