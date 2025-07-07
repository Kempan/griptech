// app/[locale]/(components)/Price/index.tsx
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { getTranslations } from "next-intl/server";
import { AuthOnly, GuestOnly } from "@/app/[locale]/(components)/auth/ServerAuth";
import Link from "next/link";
import { Button } from "@/shadcn/components/ui/button";

interface PriceProps {
	amount: number;
	currency?: string;
	className?: string;
	showLoginButton?: boolean;
}

/**
 * Server component that renders product prices with auth awareness
 */
const Price = async ({
	amount,
	currency = "SEK",
	className = "",
	showLoginButton = false,
}: PriceProps) => {
	const t = await getTranslations();

	return (
		<div className={className}>
			<AuthOnly>
				<span>{formatCurrency(amount, currency)}</span>
			</AuthOnly>

			<GuestOnly>
				<div className="flex flex-col gap-2">
					<span className="text-orange-500 font-bold">
						{t("LoginToViewPrices")}
					</span>

					{showLoginButton && (
						<Link href="/login">
							<Button size="sm" variant="outline">
								{t("Login")}
							</Button>
						</Link>
					)}
				</div>
			</GuestOnly>
		</div>
	);
};

export default Price;
