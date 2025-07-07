// client/src/app/[locale]/(admin)/admin/orders/components/StatsCards.tsx
import { Card } from "@/shadcn/components/ui/card";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { getTranslations } from "next-intl/server";

interface StatsCardsProps {
	statistics: {
		totalOrders: number;
		totalRevenue: number;
		averageOrderValue: number;
		pendingOrders: number;
		completedOrders: number;
	};
}

// Pure server component for statistics
export default async function StatsCards({ statistics }: StatsCardsProps) {
	const t = await getTranslations();

	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
			<Card className="p-4">
				<h3 className="text-sm text-gray-500">{t("totalOrders")}</h3>
				<p className="text-2xl font-semibold">{statistics.totalOrders}</p>
			</Card>

			<Card className="p-4">
				<h3 className="text-sm text-gray-500">{t("totalRevenue")}</h3>
				<p className="text-2xl font-semibold">
					{formatCurrency(statistics.totalRevenue, "SEK")}
				</p>
			</Card>

			<Card className="p-4">
				<h3 className="text-sm text-gray-500">{t("pendingOrders")}</h3>
				<p className="text-2xl font-semibold">{statistics.pendingOrders}</p>
			</Card>

			<Card className="p-4">
				<h3 className="text-sm text-gray-500">{t("avgOrderValue")}</h3>
				<p className="text-2xl font-semibold">
					{formatCurrency(statistics.averageOrderValue, "SEK")}
				</p>
			</Card>
		</div>
	);
}
